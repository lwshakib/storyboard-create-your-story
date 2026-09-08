import { Type, Tool } from "./client"

/**
 * Tool definitions for the AI Project Architect.
 * These follow the Gemini Function Calling schema requirements.
 */

export const STORYBOARD_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "update_project_metadata",
        description: "Update the overall project title and description.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The new title of the project.",
            },
            description: {
              type: Type.STRING,
              description: "The new description of the project.",
            },
          },
        },
      },
      {
        name: "update_slide",
        description:
          "Update the description, title, prompt, or HTML of a specific slide.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slideId: {
              type: Type.STRING,
              description: "The database ID of the slide to update.",
            },
            updates: {
              type: Type.OBJECT,
              description: "The fields to update.",
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                prompt: { type: Type.STRING },
                html: { type: Type.STRING },
              },
            },
          },
          required: ["slideId", "updates"],
        },
      },
      {
        name: "batch_update_slides",
        description:
          "Update multiple slides simultaneously in a single call. Use whenever the user asks to update more than one slide (e.g. 2, 4, or all slides in the deck), or when a change concept affects multiple slides.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              description:
                "List of slide updates to apply across the presentation.",
              items: {
                type: Type.OBJECT,
                properties: {
                  slideId: {
                    type: Type.STRING,
                    description: "The database ID of the slide to update.",
                  },
                  updates: {
                    type: Type.OBJECT,
                    description: "The fields to update for this slide.",
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      html: { type: Type.STRING },
                    },
                  },
                },
                required: ["slideId", "updates"],
              },
            },
          },
          required: ["slides"],
        },
      },
      {
        name: "add_slide",
        description: "Insert a new slide into the project at a specific index.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            index: {
              type: Type.NUMBER,
              description: "The position to insert the slide at (0-indexed).",
            },
            slide: {
              type: Type.OBJECT,
              description: "The slide data.",
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                prompt: { type: Type.STRING },
                html: { type: Type.STRING },
              },
              required: ["title", "description", "prompt", "html"],
            },
          },
          required: ["index", "slide"],
        },
      },
      {
        name: "delete_slide",
        description: "Remove a specific slide from the project.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            slideId: {
              type: Type.STRING,
              description: "The database ID of the slide to delete.",
            },
          },
          required: ["slideId"],
        },
      },
      {
        name: "get_project_details",
        description:
          "Retrieve the current state of the storyboard project, including title, description, and list of slides (with their database IDs, sequential indices, titles, prompt visual blueprints, descriptions, and whether HTML slides exist).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
    ],
  },
]
