import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, listingId } = await request.json()

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay takes amount in paise
      currency: 'INR',
      receipt: `listing_${listingId}`,
      notes: {
        listingId,
      },
    })

    return NextResponse.json({ orderId: order.id, amount: order.amount })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}