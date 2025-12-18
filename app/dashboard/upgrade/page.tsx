"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Brain, Crown } from "lucide-react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function UpgradePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const fetchClientSecret = useCallback(() => {
    if (!selectedProduct) return Promise.reject("No product selected")
    return createCheckoutSession(selectedProduct)
  }, [selectedProduct])

  if (selectedProduct) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center gap-4 px-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Complete Your Upgrade</span>
          </div>
        </header>

        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Upgrade Your Plan</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground">Unlock more AI generations and supercharge your learning</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {SUBSCRIPTION_PRODUCTS.map((product) => (
              <Card key={product.id} className="flex flex-col p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Crown className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">{product.name}</h3>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{product.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${(product.priceInCents / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mb-6 flex-1 space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => setSelectedProduct(product.id)} className="w-full">
                  Choose {product.name}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
