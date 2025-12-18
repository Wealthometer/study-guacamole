import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Play, Trash2, Brain } from "lucide-react"

export default async function FlashcardSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get flashcard set
  const { data: set } = await supabase.from("flashcard_sets").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!set) {
    redirect("/dashboard")
  }

  // Get flashcards
  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("set_id", id)
    .order("created_at", { ascending: true })

  const now = new Date()
  const dueCards = flashcards?.filter((card) => new Date(card.next_review) <= now) || []

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
          <span className="text-xl font-bold">FlashLearn AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Set Info */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">{set.title}</h1>
            {set.description && <p className="text-muted-foreground">{set.description}</p>}
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Total Cards</p>
              <p className="text-3xl font-bold">{flashcards?.length || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Due for Review</p>
              <p className="text-3xl font-bold text-primary">{dueCards.length}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Mastered</p>
              <p className="text-3xl font-bold text-green-600">
                {flashcards?.filter((c) => c.difficulty === 1 && c.review_count >= 3).length || 0}
              </p>
            </Card>
          </div>

          {/* Study Button */}
          {flashcards && flashcards.length > 0 && (
            <Link href={`/dashboard/sets/${id}/study`} className="mb-8 block">
              <Button size="lg" className="w-full">
                <Play className="mr-2 h-5 w-5" />
                {dueCards.length > 0 ? `Study ${dueCards.length} Due Cards` : "Study All Cards"}
              </Button>
            </Link>
          )}

          {/* Flashcard List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Flashcards</h2>
            {flashcards && flashcards.length > 0 ? (
              <div className="space-y-3">
                {flashcards.map((card) => {
                  const isDue = new Date(card.next_review) <= now
                  const difficultyLabel = ["New", "Easy", "Medium", "Hard"][card.difficulty]
                  const difficultyColor = ["bg-gray-500", "bg-green-500", "bg-yellow-500", "bg-red-500"][
                    card.difficulty
                  ]

                  return (
                    <Card key={card.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground">FRONT</p>
                            <p className="text-sm">{card.front}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground">BACK</p>
                            <p className="text-sm">{card.back}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-white ${difficultyColor}`}
                            >
                              {difficultyLabel}
                            </span>
                            <span>Reviewed {card.review_count} times</span>
                            {isDue && <span className="font-medium text-primary">Due now</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">No flashcards in this set</Card>
            )}
          </div>

          {/* Delete Set */}
          <form
            action={async () => {
              "use server"
              const supabase = await createClient()
              await supabase.from("flashcard_sets").delete().eq("id", id)
              redirect("/dashboard")
            }}
            className="mt-8"
          >
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Set
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
