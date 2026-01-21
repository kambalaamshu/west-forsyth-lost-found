'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, X, Mail } from 'lucide-react'

interface Claim {
  id: number
  item_id: number
  item_title: string
  claimant_name: string
  claimant_email: string
  student_id: string | null
  description: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/claims')
      const data = await response.json()
      setClaims(data)
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  const filteredClaims = claims.filter(claim =>
    statusFilter === 'all' || claim.status === statusFilter
  )

  const handleStatusUpdate = async (id: number, newStatus: 'approved' | 'rejected') => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes || undefined
        })
      })

      if (response.ok) {
        setClaims(claims.map(claim =>
          claim.id === id ? { ...claim, status: newStatus, admin_notes: adminNotes } : claim
        ))
        setSelectedClaim(null)
        setAdminNotes('')
      }
    } catch (error) {
      console.error('Failed to update claim:', error)
    } finally {
      setProcessing(false)
    }
  }

  const pendingCount = claims.filter(c => c.status === 'pending').length
  const approvedCount = claims.filter(c => c.status === 'approved').length
  const rejectedCount = claims.filter(c => c.status === 'rejected').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy mb-8">Claims Review</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          <p className="text-sm text-orange-700">Pending</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-sm text-green-700">Approved</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          <p className="text-sm text-red-700">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredClaims.length > 0 ? (
          <div className="divide-y">
            {filteredClaims.map((claim) => (
              <div key={claim.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        claim.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                        claim.status === 'approved' ? 'bg-green-100 text-green-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {claim.status === 'pending' && <Clock className="inline w-3 h-3 mr-1" />}
                        {claim.status === 'approved' && <CheckCircle className="inline w-3 h-3 mr-1" />}
                        {claim.status === 'rejected' && <XCircle className="inline w-3 h-3 mr-1" />}
                        {claim.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(claim.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-navy mb-1">
                      Claim for: {claim.item_title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>By:</strong> {claim.claimant_name} ({claim.claimant_email})
                      {claim.student_id && <span className="ml-2">| ID: {claim.student_id}</span>}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {claim.description}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedClaim(claim)
                        setAdminNotes(claim.admin_notes || '')
                      }}
                      className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(claim.id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(claim.id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No claims found
          </div>
        )}
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">Claim Details</h2>
              <button onClick={() => setSelectedClaim(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  selectedClaim.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                  selectedClaim.status === 'approved' ? 'bg-green-100 text-green-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {selectedClaim.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Item</h4>
                  <p className="text-navy font-semibold">{selectedClaim.item_title}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Claimant</h4>
                  <p>{selectedClaim.claimant_name}</p>
                  <a href={`mailto:${selectedClaim.claimant_email}`} className="text-navy hover:underline flex items-center gap-1">
                    <Mail size={14} /> {selectedClaim.claimant_email}
                  </a>
                  {selectedClaim.student_id && (
                    <p className="text-sm text-gray-500">Student ID: {selectedClaim.student_id}</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Proof of Ownership</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedClaim.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Submitted</h4>
                  <p className="text-gray-600">{new Date(selectedClaim.created_at).toLocaleString()}</p>
                </div>

                {selectedClaim.status === 'pending' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Admin Notes (Optional)</h4>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Add notes about this decision..."
                    />
                  </div>
                )}

                {selectedClaim.admin_notes && selectedClaim.status !== 'pending' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Admin Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedClaim.admin_notes}</p>
                  </div>
                )}
              </div>

              {selectedClaim.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleStatusUpdate(selectedClaim.id, 'approved')}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve Claim
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedClaim.id, 'rejected')}
                    disabled={processing}
                    className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject Claim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
