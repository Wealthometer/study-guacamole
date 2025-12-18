export interface SubscriptionProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  generations: number
  features: string[]
}

export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: "pro",
    name: "Pro",
    description: "Perfect for students and regular learners",
    priceInCents: 999,
    generations: 50,
    features: [
      "50 AI generations per month",
      "Unlimited flashcard reviews",
      "Advanced spaced repetition",
      "PDF upload support",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    description: "For power users and serious students",
    priceInCents: 2999,
    generations: -1,
    features: [
      "Unlimited AI generations",
      "Unlimited flashcard reviews",
      "Advanced spaced repetition",
      "PDF upload support",
      "Priority support",
    ],
  },
]
