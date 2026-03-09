/* eslint-disable @typescript-eslint/no-explicit-any */
// Import environment configuration containing necessary URLs and API keys
import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from "@/lib/env"
// Import utility function for transforming Zod schemas to JSON Schemas for the tools
import { zodToJsonSchema } from "zod-to-json-schema"

/**
 * Generates text using GLM-4.7-Flash through a Cloudflare Worker.
 * Supports agentic multi-step tool calls and messages array.
 *
 * @param options - messages, tools, temperature, maxTokens, etc.
 * @returns Object containing the generated text/HTML.
 */
export const generateText = async (options: {
  messages: any[] // The sequence of conversational messages
  tools?: Record<string, any> // Optional registered tools map allowing the LLM to call functions
  temperature?: number // Sampling probability for response variability (higher = more random)
  maxTokens?: number // Maximum length of the generated response
  maxSteps?: number // Maximum internal agent loops allowed to resolve tool calls
  abortSignal?: AbortSignal // To cancel the request on client disconnect
}) => {
  // Destructure parameters, providing fallback defaults for temperature and maxSteps
  const {
    messages,
    tools,
    temperature = 0.7,
    maxTokens,
    maxSteps = 1,
    abortSignal,
  } = options

  // Validate that the GLM api endpoint is correctly exposed
  if (!GLM_WORKER_URL) {
    throw new Error("GLM_WORKER_URL is not set in environment variables")
  }

  // Validate that the Cloudflare Auth string is correctly set
  if (!CLOUDFLARE_API_KEY) {
    throw new Error("CLOUDFLARE_API_KEY is not set in environment variables")
  }

  // Ensure url points to the GLM inference worker
  const url = GLM_WORKER_URL
  // Construct standard HTTP headers specifying json payload and Bearer authentication
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
  }

  // Convert the native JS/Zod tools object into the OpenAPI function-calling format expected by the worker
  const toolsArray = tools
    ? Object.entries(tools).map(([name, tool]) => ({
        type: "function", // Specify this tool acts as a function
        function: {
          name, // The callable name for the tool
          description: tool.description, // String helping LLM understand what the tool does
          // Convert the tool's parameter Zod schema to an LLM-compatible JSON schema
          parameters: zodToJsonSchema(tool.parameters as any),
        },
      }))
    : undefined // Pass undefined if no tools are registered

  // Clone messages to safely mutate locally when appending tool results
  const currentMessages = [...messages]
  // Track how many generation iterations the agent has gone through
  let stepCount = 0

  // Begin iterative generation loop bounded by maxSteps setup
  while (stepCount < maxSteps) {
    // Check abort signal at start of loop to fail fast if client disconnected
    if (abortSignal?.aborted) {
      throw new Error("AbortError")
    }

    // Log progress detailing current loop step
    console.log(`[GENERATOR] Step ${stepCount + 1}: Contacting GLM worker...`)

    // Fetch call asking the worker for the next block of text or tool call intent
    const response = await fetch(url, {
      method: "POST", // Use POST verb for the payload
      headers: headers, // Attach headers
      signal: abortSignal, // Monitor request for immediate interruption
      body: JSON.stringify({
        // Compile all options into the API json payload
        messages: currentMessages, // Provide the full state of conversation thus far
        tools: toolsArray, // Expose available tools
        temperature, // Instruct model generation creativity parameter
        max_tokens: maxTokens, // Limit max words generated
      }),
    })

    // Check for HTTP errors sent by worker or cloudflare proxy
    if (!response.ok) {
      // Decode error message from body
      const errorText = await response.text()
      // Throw formatted error string for debugging higher up stack
      throw new Error(
        `GLM-4.7-Flash Worker Error (${response.status}): ${errorText}`
      )
    }

    // Parse strictly returned JSON dataset
    const result = await response.json()

    // Ensure the response conforms to standard OpenAI chat specification structure
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error("Unexpected response format from GLM-4.7-Flash Worker")
    }

    // Extract textual message object from the first generated choice branch
    const message = result.choices[0].message

    // Check if the LLM desires to invoke any specific external tool listed
    if (message.tool_calls && message.tool_calls.length > 0 && tools) {
      // Append the assistant's intermediate "calling tool" intent to the message log
      currentMessages.push(message)

      // Iterate over every individual tool call specified
      for (const toolCall of message.tool_calls) {
        // Break iteration instantly if stream is stopped by user
        if (abortSignal?.aborted) {
          throw new Error("AbortError")
        }

        // Fetch tool identifier from assistant response
        const toolName = toolCall.function.name
        // Parse the stringified JSON arguments passed by the assistant
        const toolArgs = JSON.parse(toolCall.function.arguments)
        // Look up tool implementation code
        const tool = tools[toolName]

        // Ensure tool is valid and executable
        if (tool && tool.execute) {
          // Log execution step for diagnostics
          console.log(`[AGENT] Executing tool: ${toolName}`, toolArgs)
          // Run the tool implementation function over input args
          const toolResult = await tool.execute(toolArgs)

          // Append the physical result of that tool call into the context
          // so the model can view what occurred on the next loop iteration
          currentMessages.push({
            role: "tool", // Define role specifically as 'tool' response
            tool_call_id: toolCall.id, // Link response back to specific invocation key
            content: JSON.stringify(toolResult), // Cast return body to string text
          })
        }
      }

      // Increment iteration counter and retry asking the LLM to process tool results
      stepCount++
      continue // Loop for next response after tool execution
    }

    // Process finished: No tool calls asked for, generation is complete
    return {
      text: message.content, // Provide raw string reply
      finishReason: result.choices[0].finish_reason, // Note why model stopped (stop string, token limit etc)
      usage: result.usage, // Metric of compute length required
      steps: [{ text: message.content }], // Legacy compatibility wrap for AI sdk standards
    }
  }

  // Safety net: Error out if max loops attained but no natural finish condition met
  throw new Error(`Exceeded max steps (${maxSteps}) without finishing.`)
}
