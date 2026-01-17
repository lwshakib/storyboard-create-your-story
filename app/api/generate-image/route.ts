import { generateImageTool } from "@/llm/tools";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, width, height } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const result = await (generateImageTool.execute as any)({
      prompt,
      width: width || 1024,
      height: height || 1024,
    });

    if (result.success) {
        return NextResponse.json({ url: result.image });
    } else {
        return new NextResponse("Failed to generate image", { status: 500 });
    }
  } catch (error) {
    console.error("Image generation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
