import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold text-blue-600">CampusBase</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <div className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          🎓 Only for MSRIT Students
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Buy & Sell Within Your
          <span className="text-blue-600"> Campus</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          CampusBase is a hyper-local marketplace for MSRIT students. 
          Sell your old books, calculators, cycles and more — safely and easily.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
          >
            Get Started Free →
          </Link>
          <Link
            href="/feed"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
          >
            Browse Listings
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">How it works</h2>
          <p className="text-center text-gray-400 text-sm mb-10">Start selling in 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '📝', step: '1', title: 'Create a Listing', desc: 'Fill in your item details, upload photos and set your price' },
              { emoji: '💳', step: '2', title: 'Pay Small Listing Fee', desc: 'Pay a small fee (₹10–₹25) to make your listing go live' },
              { emoji: '🤝', step: '3', title: 'Connect & Sell', desc: 'Buyers contact you directly through the app. No middleman!' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <div className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">What can you sell?</h2>
        <p className="text-center text-gray-400 text-sm mb-10">Everything a college student needs</p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { emoji: '🧮', name: 'Calculators' },
            { emoji: '📐', name: 'Drafters' },
            { emoji: '🚲', name: 'Bicycles' },
            { emoji: '🖥️', name: 'Monitors' },
            { emoji: '🎒', name: 'Lab Records' },
            { emoji: '🎸', name: 'Instruments' },
            { emoji: '🍵', name: 'Kettles' },
            { emoji: '🥼', name: 'Aprons' },
            { emoji: '🔧', name: 'Components' },
            { emoji: '📦', name: 'More...' },
          ].map(cat => (
            <div key={cat.name} className="bg-gray-50 rounded-2xl p-4 text-center hover:bg-blue-50 transition cursor-pointer">
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <p className="text-xs font-medium text-gray-600">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why CampusBase */}
      <section className="bg-blue-600 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-2">Why CampusBase?</h2>
          <p className="text-center text-blue-200 text-sm mb-10">Built for students, by students</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '🔒', title: 'College Only', desc: 'Only verified MSRIT students can sign up. No strangers.' },
              { emoji: '💰', title: 'Zero Commission', desc: 'We never take a cut from your sale. Pay only a small listing fee.' },
              { emoji: '🤖', title: 'AI Assistant', desc: 'CampusBot helps you find items and answers all your questions.' },
            ].map(item => (
              <div key={item.title} className="bg-blue-500 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-blue-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Ready to get started?</h2>
        <p className="text-gray-400 mb-8">Join your fellow MSRIT students on CampusBase today.</p>
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-10 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
        >
          Create Free Account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-gray-400 text-sm">
        <p>© 2026 CampusBase · Built for MSRIT Students</p>
      </footer>

    </div>
  )
}