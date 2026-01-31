'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, CheckCircle, Clock, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'

interface Stats {
  total: number
  active: number
  claimed: number
  pending: number
  categories: string[]
  recentItems: Array<{
    id: number
    title: string
    category: string
    date_found: string
    status: string
  }>
}

interface Claim {
  id: number
  item_title: string
  claimant_name: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, claimsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/claims')
        ])

        const statsData = await statsRes.json()
        setStats(statsData)

        if (claimsRes.ok) {
          const claimsData = await claimsRes.json()
          setClaims(claimsData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const pendingClaims = claims.filter(c => c.status === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-navy/10 p-3 rounded-lg">
              <Package className="text-navy" size={24} />
            </div>
            <span className="text-3xl font-bold text-navy">{stats?.total || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Total Items</h3>
          <p className="text-sm text-gray-500">All time</p>
        </div>

        <Link href="/admin/items" className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow border-2 border-transparent hover:border-orange-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="text-orange-500" size={24} />
            </div>
            <span className="text-3xl font-bold text-orange-500">{stats?.pending || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Pending Items</h3>
          <p className="text-sm text-gray-500">Awaiting approval</p>
        </Link>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green/10 p-3 rounded-lg">
              <TrendingUp className="text-green" size={24} />
            </div>
            <span className="text-3xl font-bold text-green">{stats?.active || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Active Items</h3>
          <p className="text-sm text-gray-500">Currently listed</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gold/20 p-3 rounded-lg">
              <CheckCircle className="text-gold" size={24} />
            </div>
            <span className="text-3xl font-bold text-gold">{stats?.claimed || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Items Claimed</h3>
          <p className="text-sm text-gray-500">Successfully returned</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="text-orange-500" size={24} />
            </div>
            <span className="text-3xl font-bold text-orange-500">{pendingClaims}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Pending Claims</h3>
          <p className="text-sm text-gray-500">Awaiting review</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Items */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-navy">Recent Items</h2>
            <Link href="/admin/items" className="text-navy hover:text-gold flex items-center gap-1 text-sm">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y">
            {stats?.recentItems && stats.recentItems.length > 0 ? (
              stats.recentItems.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-navy">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      item.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      item.status === 'active' ? 'bg-green/10 text-green' :
                      'bg-gold/20 text-gold'
                    }`}>
                      {item.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.date_found).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No items yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-navy">Recent Claims</h2>
            <Link href="/admin/claims" className="text-navy hover:text-gold flex items-center gap-1 text-sm">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="divide-y">
            {claims.length > 0 ? (
              claims.slice(0, 5).map((claim) => (
                <div key={claim.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-navy">{claim.item_title}</p>
                    <p className="text-sm text-gray-500">by {claim.claimant_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      claim.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      claim.status === 'approved' ? 'bg-green/10 text-green' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {claim.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No claims yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
