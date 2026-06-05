'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
// Fee calculation function based on price
function calculateListingFee(priceStr: string): number {
  const price = parseFloat(priceStr)
  if (isNaN(price)) return 0
  if (price < 100) return 0        // Below ₹100: FREE
  if (price <= 500) return 5       // ₹100 - ₹500: ₹5
  return 10                         // Above ₹500: ₹10
}
export default function NewListingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('tier', { ascending: true })
      if (data) setCategories(data)
      if (error) console.error(error)
    }
    fetchCategories()
  }, [])

  function handleCategoryChange(id: string) {
    setCategoryId(id)
    const found = categories.find(c => String(c.id) === id)
    if (found) setSelectedTier(found.tier)
    else setSelectedTier(null)
  }

  async function handleImageUpload(files: FileList) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUploading(true)
    const urls: string[] = []

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file)

      if (!error) {
        const { data } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)
        urls.push(data.publicUrl)
      }
    }

    setImageUrls(prev => [...prev, ...urls])
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (parseFloat(price) < 50) {
      setError('Minimum price is ₹50.')
      return
    }

    if (!selectedTier) {
      setError('Please select a category.')
      return
    }
if (imageUrls.length === 0) {
  setError('Please upload at least one photo.')
  return
}
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not logged in.')
      setLoading(false)
      return
    }

   const listingFee = calculateListingFee(price)

    const { error: insertError } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        title,
        description,
        condition,
        price: parseFloat(price),
        category_id: categoryId,
        tier: selectedTier,
        listing_fee: listingFee,
        status: listingFee === 0 ? 'active' : 'pending_payment',
        image_urls: imageUrls,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create a Listing</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in the details to list your item.</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Casio FX-991EX Calculator"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos <span className="text-gray-400 font-normal">— up to 3 images</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => e.target.files && handleImageUpload(e.target.files)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-xs text-blue-500 mt-1">Uploading images...</p>}
            {imageUrls.length > 0 && (
              <div className="flex gap-2 mt-2">
                {imageUrls.map((url, i) => (
                  <img key={i} src={url} alt="preview" className="w-16 h-16 object-cover rounded-lg border" />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the condition, age, reason for selling..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              required
              value={condition}
              onChange={e => setCondition(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              required
              value={categoryId}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {[1, 2, 3].map(tier => (
                <optgroup key={tier} label={`Tier ${tier}`}>
                  {categories
                    .filter(c => c.tier === tier)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {selectedTier && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-blue-700">Tier {selectedTier} Item</p>
                <p className="text-xs text-blue-500">
                  {price !== '' ? (
                    calculateListingFee(price) === 0
                    ? '🎉 Free listing — items under ₹100 are free!'
                    : `Listing fee: ₹${calculateListingFee(price)} (paid before going live)`
                    ) : 'Enter price to see fee'}
                </p>
              </div>
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-gray-400 font-normal">— minimum ₹50</span>
            </label>
            <input
              type="number"
              required
              min={50}
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 500"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Saving...' : uploading ? 'Uploading images...' : 'Submit Listing →'}
          </button>

        </form>
      </div>
    </div>
  )
}