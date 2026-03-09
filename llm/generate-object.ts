import { z } from 'zod';
import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from '@/lib/env';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Generates a structured JSON object using GLM-4.7-Flash in strict schema mode.
 * 
 * @param params - Configuration for the generation.
 * @returns An object containing the generated JSON.
 */
export const generateObject = async ({
  messages,
  schema,
  tools,
  maxSteps = 1,
  temperature = 0.7,
}: {
  messages: any[];
  schema: z.ZodSchema;
  tools?: Record<string, any>;
  maxSteps?: number;
  temperature?: number;
}) => {
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

  // Convert Zod schema to JSON Schema for the worker's strict mode
  const jsonSchema = zodToJsonSchema(schema as any);

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
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        messages: currentMessages,
        tools: toolsArray,
        temperature,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'response_schema',
            strict: true,
            schema: jsonSchema,
          },
        },
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

    // No tool calls or max steps reached, return the content
    const content = message.content;
    try {
      return { object: JSON.parse(content) };
    } catch (error) {
      console.error('Failed to parse JSON from model response:', content);
      throw new Error('Model returned invalid JSON');
    }
  }

  throw new Error(`Exceeded max steps (${maxSteps}) without finishing.`);
};

// Keep the old name as an alias for now, or just export both
export const generateObjectFromAI = generateObject;
