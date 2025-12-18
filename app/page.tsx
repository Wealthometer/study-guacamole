import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Brain, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FlashLearn AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          AI-Powered Learning
        </div>
        <h1 className="mb-6 max-w-4xl text-balance text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
          Transform Any Article into Smart Flashcards
        </h1>
        <p className="mb-8 max-w-2xl text-balance text-xl text-muted-foreground leading-relaxed">
          Paste an article or upload a PDF, and let AI generate study flashcards instantly. Master your material with
          spaced repetition that adapts to your learning.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Start Learning Free
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg bg-transparent">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">Powerful Features</h2>
          <p className="mb-12 text-center text-lg text-muted-foreground">
            Everything you need to accelerate your learning
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Generation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our advanced AI analyzes your content and generates high-quality flashcards in seconds. Just paste text
                or upload a PDF.
              </p>
            </Card>
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Spaced Repetition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Study smarter with an algorithm that shows difficult cards more often, optimizing your retention and
                learning efficiency.
              </p>
            </Card>
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fast & Modern</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built with edge runtime for lightning-fast AI streaming responses. Watch your flashcards generate in
                real-time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">Simple Pricing</h2>
          <p className="mb-12 text-center text-lg text-muted-foreground">
            Choose the plan that fits your learning needs
          </p>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="flex flex-col p-6">
              <h3 className="mb-2 text-2xl font-bold">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />3 AI generations per month
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited flashcard reviews
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Basic spaced repetition
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </Link>
            </Card>
            <Card className="flex flex-col border-primary p-6 shadow-lg">
              <div className="mb-2 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                POPULAR
              </div>
              <h3 className="mb-2 text-2xl font-bold">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  50 AI generations per month
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited flashcard reviews
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Advanced spaced repetition
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  PDF upload support
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full">Get Started</Button>
              </Link>
            </Card>
            <Card className="flex flex-col p-6">
              <h3 className="mb-2 text-2xl font-bold">Unlimited</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited AI generations
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unlimited flashcard reviews
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Advanced spaced repetition
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  PDF upload support
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Priority support
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 FlashLearn AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
