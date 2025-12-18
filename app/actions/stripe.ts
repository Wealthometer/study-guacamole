"use server"

import { stripe } from "@/lib/stripe"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

export async function createCheckoutSession(productId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const product = SUBSCRIPTION_PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    // Update user subscription with customer ID
    await supabase.from("user_subscriptions").update({ stripe_customer_id: customerId }).eq("user_id", user.id)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      user_id: user.id,
      tier_id: productId,
    },
  })

  return session.client_secret
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    customer_email: session.customer_details?.email,
  }
}
