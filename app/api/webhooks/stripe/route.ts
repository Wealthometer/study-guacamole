import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Use service role key for webhook to bypass RLS
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("[v0] Webhook signature verification failed:", err)
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  console.log("[v0] Processing Stripe webhook:", event.type)

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const userId = session.metadata?.user_id
      const tierId = session.metadata?.tier_id

      if (!userId || !tierId) {
        console.error("[v0] Missing metadata in checkout session")
        return new Response("Missing metadata", { status: 400 })
      }

      // Update user subscription
      await supabase
        .from("user_subscriptions")
        .update({
          tier_id: tierId,
          stripe_subscription_id: session.subscription as string,
          status: "active",
        })
        .eq("user_id", userId)

      console.log("[v0] Subscription created for user:", userId)
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object
      const userId = subscription.metadata?.user_id

      if (!userId) {
        // Try to find user by subscription ID
        const { data: userSub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (!userSub) {
          console.error("[v0] Could not find user for subscription:", subscription.id)
          return new Response("User not found", { status: 404 })
        }

        // Update subscription status
        await supabase
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)
      }

      console.log("[v0] Subscription updated:", subscription.id)
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object

      // Downgrade to free tier
      const { data: userSub } = await supabase
        .from("user_subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .single()

      if (userSub) {
        await supabase
          .from("user_subscriptions")
          .update({
            tier_id: "free",
            status: "canceled",
          })
          .eq("user_id", userSub.user_id)

        console.log("[v0] Subscription canceled, user downgraded to free:", userSub.user_id)
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
