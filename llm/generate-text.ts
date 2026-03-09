import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from '@/lib/env';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Generates text using GLM-4.7-Flash through a Cloudflare Worker.
 * Supports agentic multi-step tool calls and messages array.
 * 
 * @param options - messages, tools, temperature, maxTokens, etc.
 * @returns Object containing the generated text/HTML.
 */
export const generateText = async (options: {
  messages: any[];
  tools?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  maxSteps?: number;
  abortSignal?: AbortSignal;
}) => {
  const { 
    messages, 
    tools, 
    temperature = 0.7, 
    maxTokens, 
    maxSteps = 1,
    abortSignal,
  } = options;

  if (!GLM_WORKER_URL) {
    throw new Error('GLM_WORKER_URL is not set in environment variables');
  }

  if (!CLOUDFLARE_API_KEY) {
    throw new Error('CLOUDFLARE_API_KEY is not set in environment variables');
  }

  const url = GLM_WORKER_URL;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
  };

  // Convert tools object to array format for the worker if needed
  const toolsArray = tools 
    ? Object.entries(tools).map(([name, tool]) => ({
        type: 'function',
        function: {
          name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.parameters as any),
        },
      }))
    : undefined;

  let currentMessages = [...messages];
  let stepCount = 0;

  while (stepCount < maxSteps) {
    // Immediate exit if signal aborted
    if (abortSignal?.aborted) {
      throw new Error('AbortError');
    }

    console.log(`[GENERATOR] Step ${stepCount + 1}: Contacting GLM worker...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      signal: abortSignal,
      body: JSON.stringify({
        messages: currentMessages,
        tools: toolsArray,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM-4.7-Flash Worker Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Unexpected response format from GLM-4.7-Flash Worker');
    }

    const message = result.choices[0].message;
    
    // Check for tool calls
    if (message.tool_calls && message.tool_calls.length > 0 && tools) {
      currentMessages.push(message);
      
      for (const toolCall of message.tool_calls) {
        // Exit if signal aborted during tool loop
        if (abortSignal?.aborted) {
          throw new Error('AbortError');
        }

        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const tool = tools[toolName];

        if (tool && tool.execute) {
          console.log(`[AGENT] Executing tool: ${toolName}`, toolArgs);
          const toolResult = await tool.execute(toolArgs);
          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }
      }
      
      stepCount++;
      continue; // Loop for next response after tool execution
    }

    // No tool calls (or direct answer), return the text content
    return {
      text: message.content,
      finishReason: result.choices[0].finish_reason,
      usage: result.usage,
      steps: [{ text: message.content }],
    };
  }

  throw new Error(`Exceeded max steps (${maxSteps}) without finishing.`);
};
