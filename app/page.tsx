'use client'

import { useState, useEffect } from 'react'
import { Search, Upload, MapPin, Camera } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Stats {
  total: number
  active: number
  claimed: number
  successRate: number
}

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, claimed: 0, successRate: 0 })

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/browse')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-green text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Lost Something? We&apos;re Here to Help
          </h1>
          <p className="text-xl mb-8 text-gray-100">
            Search our database of found items or report what you&apos;ve found
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your lost item (e.g., navy backpack, airpods...)"
              className="flex-1 px-6 py-4 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              <Search className="inline mr-2" size={20} />
              Search
            </button>
          </form>

          <div className="mt-6 text-gold text-lg">
            {stats.active} items waiting to be reunited with their owners
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-bold py-4 px-8 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <Camera size={24} />
              I Lost Something
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold py-4 px-8 rounded-lg border-2 border-white/40 hover:bg-white/30 transition-colors"
            >
              <Upload size={24} />
              I Found Something
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Three simple steps to reunite lost items with their owners
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Lost Something */}
            <div className="card p-6 text-center hover:scale-105 transition-transform border-2 border-gold">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-navy" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">I Lost Something</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Upload a photo and let AI find your item in our database.
              </p>
              <Link href="/search" className="btn-primary inline-block text-sm">
                Find My Item
              </Link>
            </div>

            {/* Feature 2 - Report Found */}
            <div className="card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">I Found Something</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Report a found item and help reunite it with its owner.
              </p>
              <Link href="/report" className="btn-secondary inline-block text-sm">
                Report Item
              </Link>
            </div>

            {/* Feature 3 - Search */}
            <div className="card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gold" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Browse All Items</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Manually search all found items by category and date.
              </p>
              <Link href="/browse" className="btn-secondary inline-block text-sm">
                Browse
              </Link>
            </div>

            {/* Feature 4 - Location */}
            <div className="card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Visit Our Office</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Pick up claimed items at Room 100, Main Office.
              </p>
              <Link href="/location" className="btn-secondary inline-block text-sm">
                Get Directions
              </Link>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="mt-16 bg-light-gray rounded-xl p-12">
            <h3 className="text-3xl font-bold text-center mb-8">Our Impact</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-gold mb-2">{stats.total}</div>
                <div className="text-gray-600">Total Items Reported</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green mb-2">{stats.claimed}</div>
                <div className="text-gray-600">Items Claimed</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-navy mb-2">{stats.successRate}%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-300">
            © 2026 West Forsyth High School Lost & Found
          </p>
          <p className="text-gold mt-2">
            Helping Wolverines find their way back home
          </p>
        </div>
      </footer>
    </div>
  )
}
