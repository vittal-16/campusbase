'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const supabase = createClient()

  const [listing, setListing] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    fetchListing()
    fetchCurrentUser()
  }, [])

  async function fetchListing() {
    const { data } = await supabase
      .from('listings')
      .select(`*, categories(name, tier)`)
      .eq('id', id)
      .single()
    if (data) {
      setListing(data)
      fetchSeller(data.seller_id)
    }
    setLoading(false)
  }

  async function fetchSeller(sellerId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, college_name, semester')
      .eq('id', sellerId)
      .single()
    if (data) setSeller(data)
  }

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  async function handlePayment() {
    setPaying(true)
    try {
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: listing.listing_fee,
          listingId: listing.id,
        }),
      })

      const { orderId, amount } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'CampusBase',
        description: `Listing fee for ${listing.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          await supabase
            .from('listings')
            .update({ status: 'active' })
            .eq('id', listing.id)
          alert('Payment successful! Your listing is now live.')
          router.push('/feed')
        },
        prefill: {
          email: currentUser?.email,
        },
        theme: {
          color: '#2563eb',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error) {
      alert('Payment failed. Please try again.')
    }
    setPaying(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Listing not found.
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-800">Listing Details</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="bg-gray-100 h-64 flex items-center justify-center overflow-hidden">
  {listing.image_urls && listing.image_urls.length > 0 ? (
    <img
      src={listing.image_urls[0]}
      alt={listing.title}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-7xl">📦</span>
  )}
</div>
        </div>

        <div className="bg-white rounded-2xl border p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{listing.title}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{listing.categories?.name}</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">₹{listing.price}</p>
          </div>

          <div className="flex gap-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
              Tier {listing.categories?.tier}
            </span>
            <span className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full font-medium capitalize">
              {listing.condition}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
        </div>

        {seller && (
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-xs text-gray-400 font-medium uppercase mb-2">Seller</p>
            <p className="text-sm font-semibold text-gray-800">{seller.full_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {seller.college_name} • Semester {seller.semester}
            </p>
          </div>
        )}

        {currentUser && currentUser.id !== listing.seller_id && (
          <button
            onClick={() => alert('Messaging coming in Phase 7!')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
          >
            💬 Contact Seller
          </button>
        )}

        {currentUser && currentUser.id === listing.seller_id && (
          <div>
            {listing.status === 'pending_payment' ? (
              <button
                onClick={handlePayment}
                disabled={paying}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition"
              >
                {paying ? 'Processing...' : `💳 Pay Listing Fee ₹${listing.listing_fee} to Go Live`}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-sm text-green-600 font-medium">
                ✅ Listing is Live!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}