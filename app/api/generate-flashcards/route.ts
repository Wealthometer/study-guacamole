import { streamObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { checkAndUpdateUsage } from "@/lib/usage"

const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().describe("The question or prompt on the front of the card"),
      back: z.string().describe("The answer or explanation on the back of the card"),
    }),
  ),
})

export async function POST(req: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Check usage limits
  const { allowed, remaining } = await checkAndUpdateUsage(user.id)

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Generation limit reached. Please upgrade your plan to continue.",
      }),
      { status: 403 },
    )
  }

  const { content, setTitle } = await req.json()

  const result = streamObject({
    model: "openai/gpt-4o-mini",
    schema: flashcardSchema,
    prompt: `You are an expert educator creating study flashcards. 

Analyze the following content and create comprehensive flashcards that help students learn the key concepts, definitions, and important details.

Guidelines:
- Create 8-15 flashcards depending on content length
- Front: Clear, concise question or prompt
- Back: Complete, informative answer
- Focus on key concepts, definitions, and important facts
- Use varied question types (what, why, how, define, etc.)
- Avoid overly simple or trivial questions

Content to analyze:
${content}`,
  })

  // Add remaining generations to response headers
  const response = result.toTextStreamResponse()
  response.headers.set("X-Remaining-Generations", remaining.toString())

  return response
}
