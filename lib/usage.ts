import { createClient } from "@/lib/supabase/server"

export async function checkAndUpdateUsage(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createClient()

  // Get current month-year
  const now = new Date()
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  // Get user subscription
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*, subscription_tiers(*)")
    .eq("user_id", userId)
    .single()

  if (!subscription) {
    return { allowed: false, remaining: 0 }
  }

  const tier = subscription.subscription_tiers as { generations_per_month: number }
  const limit = tier.generations_per_month

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, remaining: -1 }
  }

  // Get or create usage tracking
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .eq("month_year", monthYear)
    .single()

  if (!usage) {
    // Create new usage tracking
    await supabase.from("usage_tracking").insert({
      user_id: userId,
      month_year: monthYear,
      generations_used: 1,
    })
    return { allowed: true, remaining: limit - 1 }
  }

  // Check if user has exceeded limit
  if (usage.generations_used >= limit) {
    return { allowed: false, remaining: 0 }
  }

  // Update usage
  await supabase
    .from("usage_tracking")
    .update({ generations_used: usage.generations_used + 1 })
    .eq("id", usage.id)

  return { allowed: true, remaining: limit - usage.generations_used - 1 }
}

export async function getCurrentUsage(userId: string): Promise<{ used: number; limit: number }> {
  const supabase = await createClient()

  const now = new Date()
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  // Get user subscription
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*, subscription_tiers(*)")
    .eq("user_id", userId)
    .single()

  if (!subscription) {
    return { used: 0, limit: 0 }
  }

  const tier = subscription.subscription_tiers as { generations_per_month: number }
  const limit = tier.generations_per_month

  // Get usage tracking
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .eq("month_year", monthYear)
    .single()

  return { used: usage?.generations_used || 0, limit }
}
