'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-4 py-4 border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">CampusBase</h1>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
            🎓 Only for MSRIT Students
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900">
            Buy & Sell Within Your <span className="text-blue-600">Campus</span>
          </h2>
          
          <p className="text-lg text-gray-600">
            CampusBase is a hyper-local marketplace for MSRIT students. Sell your old books, calculators, cycles and more — safely and easily. With online and offline payment options.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => router.push('/signup')}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition text-lg"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => router.push('/feed')}
              className="bg-gray-100 text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition text-lg"
            >
              Browse Listings
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">How it works</h2>
            <p className="text-lg text-gray-600">Start selling in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 text-center space-y-3">
              <div className="text-5xl mb-3">📝</div>
              <h3 className="font-bold text-gray-900 text-lg">1. Create a Listing</h3>
              <p className="text-gray-600 text-sm">
                Fill in your item details, upload photos and set your price
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 text-center space-y-3">
              <div className="text-5xl mb-3">💳</div>
              <h3 className="font-bold text-gray-900 text-lg">2. Pay Small Fee</h3>
              <p className="text-gray-600 text-sm">
                Pay a small listing fee (₹0-₹10) to make your listing go live. Fees are non-refundable.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 text-center space-y-3">
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="font-bold text-gray-900 text-lg">3. Buyers Purchase</h3>
              <p className="text-gray-600 text-sm">
                Buyers can choose online (UPI) or offline (cash) payment. Direct contact through app.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 text-center space-y-3">
              <div className="text-5xl mb-3">⭐</div>
              <h3 className="font-bold text-gray-900 text-lg">4. Rate & Complete</h3>
              <p className="text-gray-600 text-sm">
                Buyer leaves feedback. Confirm with "I Bought" and transaction is complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Can You Sell */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">What can you sell?</h2>
            <p className="text-lg text-gray-600">Everything a college student needs</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { emoji: '🧮', name: 'Calculators' },
              { emoji: '📐', name: 'Drafters' },
              { emoji: '🚴', name: 'Bicycles' },
              { emoji: '🖥️', name: 'Monitors' },
              { emoji: '🎒', name: 'Lab Records' },
              { emoji: '🎸', name: 'Instruments' },
              { emoji: '🫖', name: 'Kettles' },
              { emoji: '👔', name: 'Aprons' },
              { emoji: '🔧', name: 'Components' },
              { emoji: '📦', name: 'More...' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4">
                <div className="text-4xl mb-2">{item.emoji}</div>
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options Highlight */}
      <section className="px-4 py-16 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Flexible Payment Options</h2>
          <p className="text-lg text-blue-100">
            Choose what works best for you
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Online Payment */}
            <div className="bg-blue-700 rounded-2xl p-6 space-y-3">
              <div className="text-4xl">💳</div>
              <h3 className="text-xl font-bold">Pay Online (UPI)</h3>
              <p className="text-blue-100">
                Instant payment. Seller receives money immediately. Perfect for trusted transactions.
              </p>
            </div>

            {/* Offline Payment */}
            <div className="bg-blue-700 rounded-2xl p-6 space-y-3">
              <div className="text-4xl">🤝</div>
              <h3 className="text-xl font-bold">Pay Offline (Cash)</h3>
              <p className="text-blue-100">
                Meet in person and pay cash. Best for building trust and meeting fellow students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why CampusBase */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Why CampusBase?</h2>
            <p className="text-lg text-gray-600 mt-2">Built for students, by students</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* College Only */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white space-y-3">
              <div className="text-4xl">🔐</div>
              <h3 className="text-xl font-bold">College Only</h3>
              <p>Only verified MSRIT students can sign up. No strangers, no spam.</p>
            </div>

            {/* Zero Commission */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white space-y-3">
              <div className="text-4xl">💰</div>
              <h3 className="text-xl font-bold">No Hidden Fees</h3>
              <p>We only charge a small listing fee (₹0-₹10). No commission on sales.</p>
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white space-y-3">
              <div className="text-4xl">🤖</div>
              <h3 className="text-xl font-bold">AI Assistant</h3>
              <p>CampusBot helps you find items and answers all your questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="px-4 py-12 bg-yellow-50 border-t-4 border-yellow-400">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-sm font-semibold text-yellow-800">⚠️ Important Notice</p>
          <p className="text-gray-800">
            <strong>Listing fees are non-refundable.</strong> Once you pay the listing fee and your item goes live, the fee will not be returned even if you delete the listing. Please verify all details before submitting.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="text-lg text-gray-600">
            Join your fellow MSRIT students on CampusBase today.
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition"
          >
            Create Free Account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 px-4 py-8 text-center text-sm border-t">
        <p>© 2026 CampusBase · Built for MSRIT Students</p>
      </footer>
    </div>
  )
}