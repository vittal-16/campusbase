'use client'

import ChatBot from '@/components/ui/ChatBot'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClient()

  const [listings, setListings] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchListings()
  }, [])

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('tier', { ascending: true })
    if (data) setCategories(data)
  }

  async function fetchListings(categoryId?: string) {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select(`*, categories(name, tier)`)
      .order('created_at', { ascending: false })

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
    if (data) setListings(data)
    if (error) console.error(error)
    setLoading(false)
  }

  function handleCategoryChange(categoryId: string) {
    setSelectedCategory(categoryId)
    fetchListings(categoryId)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        {/* Top row - Logo and buttons */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-800">CampusBase</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/listings/new')}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              + Sell
            </button>
            <button
              onClick={() => router.push('/messages')}
              className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Messages
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Profile
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Search bar - full width */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(String(cat.id))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === String(cat.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm mt-1">Be the first to sell something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings
              .filter(listing =>
                listing.title.toLowerCase().includes(search.toLowerCase())
              )
              .map(listing => (
                <div
                  key={listing.id}
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer overflow-hidden"
                >
                  <div className="bg-gray-100 h-40 flex items-center justify-center overflow-hidden">
                    {listing.image_urls && listing.image_urls.length > 0 ? (
                      <img
                        src={listing.image_urls[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{listing.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{listing.categories?.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-blue-600 font-bold text-sm">₹{listing.price}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        listing.condition === 'new'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {listing.condition}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        listing.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : listing.status === 'sold'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {listing.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  )
}