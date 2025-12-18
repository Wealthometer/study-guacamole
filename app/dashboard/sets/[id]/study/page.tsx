"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, Brain } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { sortCardsByPriority, calculateNextReview } from "@/lib/spaced-repetition"
import type { Flashcard } from "@/lib/types"

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [studiedCount, setStudiedCount] = useState(0)

  useEffect(() => {
    loadFlashcards()
  }, [setId])

  const loadFlashcards = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data, error } = await supabase.from("flashcards").select("*").eq("set_id", setId).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error loading flashcards:", error)
      return
    }

    // Sort cards by priority (hard cards first, then due cards, then new)
    const sortedCards = sortCardsByPriority(data || [])
    setFlashcards(sortedCards)
    setIsLoading(false)
  }

  const handleDifficultyRating = async (newDifficulty: number) => {
    const supabase = createClient()
    const card = flashcards[currentIndex]

    if (!card) return

    const newReviewCount = card.review_count + 1
    const nextReview = calculateNextReview(newDifficulty, newReviewCount)

    const { error } = await supabase
      .from("flashcards")
      .update({
        difficulty: newDifficulty,
        review_count: newReviewCount,
        next_review: nextReview.toISOString(),
      })
      .eq("id", card.id)

    if (error) {
      console.error("[v0] Error updating card:", error)
      return
    }

    // Move to next card
    setStudiedCount(studiedCount + 1)
    setIsFlipped(false)

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Finished studying
      router.push(`/dashboard/sets/${setId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading flashcards...</p>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">No Flashcards Available</h2>
          <p className="mb-6 text-muted-foreground">This set doesn't have any flashcards yet.</p>
          <Link href={`/dashboard/sets/${setId}`}>
            <Button>Back to Set</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]
  const progress = ((studiedCount / flashcards.length) * 100).toFixed(0)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/sets/${setId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Study Mode</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {studiedCount} / {flashcards.length} studied
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <Progress value={Number(progress)} className="h-2" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Flashcard */}
          <Card
            className="mb-8 min-h-[400px] cursor-pointer p-8 transition-all hover:shadow-lg"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="flex h-full min-h-[350px] flex-col items-center justify-center text-center">
              <p className="mb-4 text-xs font-medium text-muted-foreground">{isFlipped ? "BACK" : "FRONT"}</p>
              <p className="text-balance text-2xl leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              {!isFlipped && <p className="mt-6 text-sm text-muted-foreground">Click to reveal answer</p>}
            </div>
          </Card>

          {/* Difficulty Buttons */}
          {isFlipped && (
            <div className="space-y-3">
              <p className="text-center text-sm font-medium">How well did you know this?</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-red-200 py-4 hover:border-red-500 hover:bg-red-50 bg-transparent"
                  onClick={() => handleDifficultyRating(3)}
                >
                  <span className="text-lg font-semibold">Hard</span>
                  <span className="text-xs text-muted-foreground">Show soon</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-yellow-200 py-4 hover:border-yellow-500 hover:bg-yellow-50 bg-transparent"
                  onClick={() => handleDifficultyRating(2)}
                >
                  <span className="text-lg font-semibold">Medium</span>
                  <span className="text-xs text-muted-foreground">Show later</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-green-200 py-4 hover:border-green-500 hover:bg-green-50 bg-transparent"
                  onClick={() => handleDifficultyRating(1)}
                >
                  <span className="text-lg font-semibold">Easy</span>
                  <span className="text-xs text-muted-foreground">Show much later</span>
                </Button>
              </div>
            </div>
          )}

          {!isFlipped && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setIsFlipped(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reveal Answer
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
