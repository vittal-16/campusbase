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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [existingPurchase, setExistingPurchase] = useState<any>(null)
  const [checkingPurchase, setCheckingPurchase] = useState(false)

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

  async function checkExistingPurchase() {
    if (!currentUser) return
    
    setCheckingPurchase(true)
    const { data } = await supabase
      .from('purchases')
      .select('*')
      .eq('listing_id', id)
      .single()
    
    if (data) {
      setExistingPurchase(data)
    }
    setCheckingPurchase(false)
  }

  async function submitFeedback() {
    if (!currentUser || !existingPurchase) return
    
    setSubmittingFeedback(true)
    try {
      // Save feedback/review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          purchase_id: existingPurchase.id,
          rating: feedbackRating,
          feedback: feedbackComment,
        })

      if (reviewError) throw reviewError

      alert('Thank you for your feedback!')
      setShowFeedbackModal(false)
      // Refresh page to show "I Bought" button
      fetchListing()
    } catch (error) {
      console.error(error)
      alert('Error saving feedback. Please try again.')
    }
    setSubmittingFeedback(false)
  }

  async function handleIBought() {
    if (!existingPurchase) return
    
    const confirmDelete = confirm('Are you sure you bought this item? This will delete the listing.')
    if (!confirmDelete) return

    setPaying(true)
    try {
      // Delete the listing
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Update purchase status to completed
      await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', existingPurchase.id)

      alert('Transaction completed! Listing deleted.')
      router.push('/feed')
    } catch (error) {
      console.error(error)
      alert('Error deleting listing. Please try again.')
    }
    setPaying(false)
  }

  async function handleOfflinePayment() {
    if (!currentUser || !seller) return
    
    setPaying(true)
    try {
      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          listing_id: id,
          buyer_id: currentUser.id,
          seller_id: listing.seller_id,
          payment_method: 'offline',
          status: 'pending',
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Send message to seller
      const message = `I want to buy "${listing.title}" (₹${listing.price}). Let's meet and complete the payment offline.`
      
      await supabase
        .from('messages')
        .insert({
          listing_id: id,
          sender_id: currentUser.id,
          receiver_id: listing.seller_id,
          content: message,
        })

      // Mark listing as sold
      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', id)

      setExistingPurchase(purchase)
      setShowPaymentModal(false)
      setShowFeedbackModal(true)
    } catch (error) {
      console.error(error)
      alert('Error initiating purchase. Please try again.')
    }
    setPaying(false)
  }

  async function handleOnlinePayment() {
    if (!currentUser || !seller) return
    
    setPaying(true)
    try {
      // Create Razorpay order for buyer's payment
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: listing.price,
          listingId: listing.id,
          buyerId: currentUser.id,
        }),
      })

      const { orderId, amount } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'CampusBase',
        description: `Buying ${listing.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Create purchase record
            const { data: purchase, error: purchaseError } = await supabase
              .from('purchases')
              .insert({
                listing_id: id,
                buyer_id: currentUser.id,
                seller_id: listing.seller_id,
                payment_method: 'online',
                status: 'completed',
              })
              .select()
              .single()

            if (purchaseError) throw purchaseError

            // Send message to seller with payment info
            const message = `I bought "${listing.title}" (₹${listing.price}) via UPI. Payment completed. Let's arrange delivery.`
            
            await supabase
              .from('messages')
              .insert({
                listing_id: id,
                sender_id: currentUser.id,
                receiver_id: listing.seller_id,
                content: message,
              })

            // Mark listing as sold
            await supabase
              .from('listings')
              .update({ status: 'sold' })
              .eq('id', id)

            setExistingPurchase(purchase)
            setShowPaymentModal(false)
            setShowFeedbackModal(true)
          } catch (error) {
            console.error(error)
            alert('Payment recorded but error sending notification. Please contact seller.')
          }
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
      console.error(error)
      alert('Payment failed. Please try again.')
    }
    setPaying(false)
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

  const isBuyer = currentUser && currentUser.id !== listing.seller_id
  const canBuy = isBuyer && listing.status === 'active' && !existingPurchase

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
            {listing.status === 'sold' && (
              <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">
                Sold
              </span>
            )}
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

        {/* Action Buttons */}
        {currentUser && currentUser.id !== listing.seller_id && (
          <div className="space-y-3">
            {canBuy ? (
              <button
                onClick={() => {
                  checkExistingPurchase()
                  setShowPaymentModal(true)
                }}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition"
              >
                🛒 Buy Now
              </button>
            ) : existingPurchase && listing.status === 'sold' ? (
              <button
                onClick={handleIBought}
                disabled={paying}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition"
              >
                {paying ? 'Processing...' : '✅ I Bought This'}
              </button>
            ) : listing.status === 'sold' ? (
              <div className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl text-center text-sm font-semibold">
                ❌ Already Sold
              </div>
            ) : null}
            
            <button
              onClick={() => router.push(`/messages/${listing.id}?with=${listing.seller_id}`)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
            >
              💬 Contact Seller
            </button>
          </div>
        )}

        {currentUser && currentUser.id === listing.seller_id && (
          <div>
            {listing.status === 'pending_payment' && listing.listing_fee > 0 ? (
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

      {/* Payment Options Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Choose Payment Method</h2>
            <p className="text-sm text-gray-600">How would you like to pay for {listing.title}?</p>
            
            <div className="space-y-3">
              <button
                onClick={handleOnlinePayment}
                disabled={paying}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {paying ? 'Processing...' : '💳 Pay Online (UPI)'}
              </button>
              
              <button
                onClick={handleOfflinePayment}
                disabled={paying}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {paying ? 'Processing...' : '🤝 Pay Offline (Cash)'}
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={paying}
              className="w-full text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Rate this Item</h2>
            <p className="text-sm text-gray-600">How was your experience with {listing.title}?</p>
            
            {/* Rating Stars */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className={`text-3xl transition ${
                    star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="Share your feedback (optional)"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={submitFeedback}
                disabled={submittingFeedback}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
              
              <button
                onClick={() => setShowFeedbackModal(false)}
                disabled={submittingFeedback}
                className="w-full text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
