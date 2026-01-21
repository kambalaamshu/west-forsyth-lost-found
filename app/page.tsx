'use client'

import { useState, useEffect } from 'react'
import { Search, Upload, MapPin } from 'lucide-react'
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Three simple steps to reunite lost items with their owners
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="text-navy" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Report Found Item</h3>
              <p className="text-gray-600 mb-6">
                Found something? Upload photos and details. We&apos;ll help find the owner.
              </p>
              <Link href="/report" className="btn-secondary inline-block">
                Report Item
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Search Database</h3>
              <p className="text-gray-600 mb-6">
                Browse all found items with advanced filters by color, location, and date.
              </p>
              <Link href="/browse" className="btn-secondary inline-block">
                Search Now
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-gold" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Visit Lost & Found</h3>
              <p className="text-gray-600 mb-6">
                Pick up your claimed item at our office. Room 100, Main Office.
              </p>
              <Link href="/location" className="btn-secondary inline-block">
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
