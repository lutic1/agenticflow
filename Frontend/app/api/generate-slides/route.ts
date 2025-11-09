import { generateText, generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 60

// Schema for slide plan
const slidePlanSchema = z.object({
  title: z.string(),
  slides: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
})

const slideSchema = z.object({
  title: z.string(),
  content: z.string(),
  layout: z.enum(["title", "content", "two-column", "image-right"]),
})

export async function POST(req: Request) {
  try {
    const { prompt, template } = await req.json()

    // Step 1: Get AI reasoning about the presentation
    const reasoningResponse = await generateText({
      model: "openai/gpt-5-mini",
      prompt: `Analyze this presentation request and explain your approach:
${prompt}

Provide your reasoning in a structured way about what slides you'll create and why.`,
      maxOutputTokens: 500,
    })

    // Step 2: Generate slide plan
    const planResponse = await generateObject({
      model: "openai/gpt-5-mini",
      schema: slidePlanSchema,
      prompt: `Create a detailed slide plan for this presentation:
${prompt}

Generate a title and list 3-5 slides with their titles and descriptions.`,
    })

    // Step 3: Generate individual slides
    const slidesResponse = await generateObject({
      model: "openai/gpt-5-mini",
      schema: z.object({
        slides: z.array(slideSchema),
      }),
      prompt: `Generate detailed slide content for this presentation:
${prompt}

Create ${planResponse.object.slides.length} slides with the following titles:
${planResponse.object.slides.map((s) => `- ${s.title}`).join("\n")}

For each slide, provide the title, detailed content, and appropriate layout.`,
    })

    return Response.json({
      title: planResponse.object.title,
      reasoning: reasoningResponse.text,
      slidePlan: planResponse.object.slides,
      slides: slidesResponse.object.slides,
      template,
    })
  } catch (error) {
    console.error("Error generating slides:", error)
    return Response.json({ error: "Failed to generate slides" }, { status: 500 })
  }
}
