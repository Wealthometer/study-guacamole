import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Brain, Crown } from "lucide-react"
import { getCurrentUsage } from "@/lib/usage"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get subscription info
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*, subscription_tiers(*)")
    .eq("user_id", user.id)
    .single()

  const usage = await getCurrentUsage(user.id)
  const tier = subscription?.subscription_tiers as any

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
          <span className="text-xl font-bold">Settings</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Account Info */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">Account</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Subscription */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">Subscription</h2>
            <Card className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{tier?.name || "Free"} Plan</h3>
                    {tier?.name !== "Free" && <Crown className="h-5 w-5 text-yellow-500" />}
                  </div>
                  <p className="text-muted-foreground">
                    {tier?.generations_per_month === -1
                      ? "Unlimited AI generations per month"
                      : `${tier?.generations_per_month} AI generations per month`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${tier?.price_in_cents ? (tier.price_in_cents / 100).toFixed(2) : "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">/month</p>
                </div>
              </div>

              <div className="mb-6 rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">This month's usage</p>
                  <p className="text-sm font-medium">
                    {usage.used} / {usage.limit === -1 ? "∞" : usage.limit}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: usage.limit === -1 ? "0%" : `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {tier?.name === "Free" && (
                <Link href="/dashboard/upgrade">
                  <Button className="w-full">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}

              {tier?.name !== "Free" && subscription?.stripe_subscription_id && (
                <p className="text-center text-sm text-muted-foreground">
                  Subscription ID: {subscription.stripe_subscription_id}
                </p>
              )}
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
