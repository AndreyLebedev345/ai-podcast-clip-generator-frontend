'use server'

import { env } from "~/env"
import { auth } from "~/server/auth"
import { db } from "~/server/db"
import Stripe from "stripe"
import { redirect } from "next/navigation"

export type PriceId = 'small' | 'medium' | 'large'

const PRICE_MAP: Record<PriceId, string> = {
  small: env.STRIPE_SMALL_CREDIT_PACK,
  medium: env.STRIPE_MEDIUM_CREDIT_PACK,
  large: env.STRIPE_LARGE_CREDIT_PACK,
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export async function createCheckoutSession(priceId: PriceId) {
  const serverSession = await auth()

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: serverSession?.user.id,
    },
    select: {
      stripeCustomerId: true,
    },
  })

  if (!user.stripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID");
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: PRICE_MAP[priceId],
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${env.BASE_URL}/dashboard?success=true`,
    customer: user.stripeCustomerId,
  })

  if (!session.url) {
    throw new Error("Failed to create session URL");
  }

  redirect(session.url);
}


