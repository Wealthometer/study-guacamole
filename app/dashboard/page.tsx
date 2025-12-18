import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus, BookOpen, Brain, LogOut } from "lucide-react"
import { getCurrentUsage } from "@/lib/usage"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's flashcard sets
  const { data: flashcardSets } = await supabase
    .from("flashcard_sets")
    .select("*, flashcards(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get subscription info
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*, subscription_tiers(*)")
    .eq("user_id", user.id)
    .single()

  const usage = await getCurrentUsage(user.id)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FlashLearn AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard/settings">
              <Button variant="ghost">Settings</Button>
            </Link>
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect("/")
              }}
            >
              <Button variant="ghost" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Usage Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sets</p>
                <p className="text-2xl font-bold">{flashcardSets?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Generations</p>
                <p className="text-2xl font-bold">
                  {usage.used} / {usage.limit === -1 ? "∞" : usage.limit}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-lg font-bold text-primary">
                  {subscription?.subscription_tiers?.name?.charAt(0) || "F"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-2xl font-bold">{subscription?.subscription_tiers?.name || "Free"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Flashcard Sets</h2>
          <Link href="/dashboard/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Set
            </Button>
          </Link>
        </div>

        {/* Flashcard Sets Grid */}
        {flashcardSets && flashcardSets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcardSets.map((set: any) => (
              <Link key={set.id} href={`/dashboard/sets/${set.id}`}>
                <Card className="p-6 transition-colors hover:bg-muted/50">
                  <h3 className="mb-2 text-lg font-semibold">{set.title}</h3>
                  {set.description && (
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{set.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{set.flashcards[0]?.count || 0} cards</span>
                    <span>•</span>
                    <span>{set.source_type}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No flashcard sets yet</h3>
            <p className="mb-6 text-muted-foreground">
              Create your first set to start learning with AI-powered flashcards
            </p>
            <Link href="/dashboard/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Set
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}
