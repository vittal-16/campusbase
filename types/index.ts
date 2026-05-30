
export type Category = {
  id: string
  name: string
  tier: number
}

export type Listing = {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  category_id: string
  tier: number
  listing_fee: number
  status: 'pending_payment' | 'active' | 'sold' | 'expired'
  image_urls: string[]
  created_at: string
}

export type Profile = {
  id: string
  full_name: string
  college_email: string
  college_name: string
  role: string
  semester: number
  profile_complete: boolean
}