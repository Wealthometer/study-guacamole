"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { experimental_useObject as useObject } from "ai/react"
import { createClient } from "@/lib/supabase/client"

export default function CreateFlashcardSetPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { object, submit, isLoading } = useObject({
    api: "/api/generate-flashcards",
    schema: {
      type: "object",
      properties: {
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: { type: "string" },
              back: { type: "string" },
            },
          },
        },
      },
    },
    onFinish: async ({ object: result }) => {
      if (!result?.flashcards || result.flashcards.length === 0) {
        setError("No flashcards were generated. Please try again.")
        return
      }

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("You must be logged in to create flashcards")
          return
        }

        // Create flashcard set
        const { data: set, error: setError } = await supabase
          .from("flashcard_sets")
          .insert({
            user_id: user.id,
            title: title || "Untitled Set",
            description: content.slice(0, 200),
            source_type: "text",
          })
          .select()
          .single()

        if (setError) throw setError

        // Insert flashcards
        const flashcardsToInsert = result.flashcards.map((card) => ({
          set_id: set.id,
          user_id: user.id,
          front: card.front,
          back: card.back,
          difficulty: 0,
          next_review: new Date().toISOString(),
          review_count: 0,
        }))

        const { error: cardsError } = await supabase.from("flashcards").insert(flashcardsToInsert)

        if (cardsError) throw cardsError

        // Navigate to the new set
        router.push(`/dashboard/sets/${set.id}`)
      } catch (err) {
        console.error("[v0] Error saving flashcards:", err)
        setError("Failed to save flashcards. Please try again.")
      }
    },
    onError: (err) => {
      console.error("[v0] Generation error:", err)
      setError("Failed to generate flashcards. You may have reached your generation limit.")
    },
  })

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError("Please enter some content to generate flashcards from")
      return
    }

    setError(null)
    submit({ content, setTitle: title })
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Create Flashcard Set</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold">Generate AI Flashcards</h2>
              <p className="text-muted-foreground">
                Paste your article or study material and let AI create flashcards for you
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Set Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Biology Chapter 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content to Learn</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your article, lecture notes, or any study material here..."
                  className="min-h-[300px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Tip: More detailed content generates better flashcards</p>
              </div>

              {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

              <Button onClick={handleGenerate} disabled={isLoading || !content.trim()} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Preview Generated Flashcards */}
          {object && object.flashcards && object.flashcards.length > 0 && (
            <Card className="mt-6 p-6">
              <h3 className="mb-4 text-xl font-semibold">Generated Flashcards ({object.flashcards.length})</h3>
              <div className="space-y-3">
                {object.flashcards.map((card, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground">FRONT</p>
                      <p className="text-sm">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">BACK</p>
                      <p className="text-sm">{card.back}</p>
                    </div>
                  </div>
                ))}
              </div>
              {isLoading && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                  Generating more flashcards...
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
