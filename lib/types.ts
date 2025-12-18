export interface Profile {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface SubscriptionTier {
  id: string
  name: string
  price_in_cents: number
  generations_per_month: number
}

export interface UserSubscription {
  id: string
  user_id: string
  tier_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  status: string
}

export interface FlashcardSet {
  id: string
  user_id: string
  title: string
  description: string | null
  source_type: "text" | "pdf"
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  set_id: string
  user_id: string
  front: string
  back: string
  difficulty: number
  next_review: string
  review_count: number
  created_at: string
  updated_at: string
}

export interface UsageTracking {
  id: string
  user_id: string
  month_year: string
  generations_used: number
}
