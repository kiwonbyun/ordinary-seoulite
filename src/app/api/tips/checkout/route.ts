import { NextResponse } from "next/server";
import Stripe from "stripe";
import { validateServerEnv } from "@/lib/env";

const env = validateServerEnv(process.env);
const stripe = new Stripe(env.stripeSecretKey);

export async function POST(req: Request) {
  const body = await req.json();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: body.currency || "usd",
          unit_amount: body.amount * 100,
          product_data: { name: "Thank you tip" },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.siteUrl}/tips/success`,
    cancel_url: `${env.siteUrl}/tips/cancel`,
  });
  return NextResponse.json({ url: session.url });
}
