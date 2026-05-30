import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Only handle successful payments
    if (event.event === 'payment.captured') {
      const listingId = event.payload.payment.entity.notes?.listingId

      if (listingId) {
        // Update listing status to active
        await supabase
          .from('listings')
          .update({ status: 'active' })
          .eq('id', listingId)

        // Record payment
        await supabase
          .from('payments')
          .insert({
            listing_id: listingId,
            amount: event.payload.payment.entity.amount / 100,
            status: 'captured',
            razorpay_payment_id: event.payload.payment.entity.id,
          })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}