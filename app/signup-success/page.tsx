import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">FlashLearn AI</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a confirmation link to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Click the link in the email to confirm your account and start creating AI-powered flashcards.
          </p>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
