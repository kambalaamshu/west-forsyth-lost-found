'use client'

import { useState, useEffect } from 'react'
import { Search, Mail, Tag, Palette, FolderOpen, Clock, Bell, BellOff, Eye, X } from 'lucide-react'

interface LostSearch {
  id: number
  searcher_email: string
  description: string
  ai_tags: string | null
  colors: string | null
  category: string | null
  matched_item_id: number | null
  notification_sent: number
  created_at: string
}

export default function AdminSearchesPage() {
  const [searches, setSearches] = useState<LostSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSearch, setSelectedSearch] = useState<LostSearch | null>(null)

  const fetchSearches = async () => {
    try {
      const response = await fetch('/api/lost-searches')
      const data = await response.json()
      setSearches(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch searches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSearches()
  }, [])

  const parseJsonField = (field: string | null): string[] => {
    if (!field) return []
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return field.split(',').map(s => s.trim()).filter(Boolean)
    }
  }

  const notifiedCount = searches.filter(s => s.notification_sent === 1).length
  const pendingCount = searches.filter(s => s.notification_sent === 0).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy mb-8">Lost Item Searches</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{searches.length}</p>
          <p className="text-sm text-blue-700">Total Searches</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{notifiedCount}</p>
          <p className="text-sm text-green-700">Notified</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          <p className="text-sm text-orange-700">No Match Yet</p>
        </div>
      </div>

      {/* Searches List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {searches.length > 0 ? (
          <div className="divide-y">
            {searches.map((search) => {
              const tags = parseJsonField(search.ai_tags)
              const colors = parseJsonField(search.colors)

              return (
                <div key={search.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          search.notification_sent
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {search.notification_sent ? (
                            <><Bell className="inline w-3 h-3 mr-1" />NOTIFIED</>
                          ) : (
                            <><BellOff className="inline w-3 h-3 mr-1" />PENDING</>
                          )}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(search.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Mail size={14} className="text-gray-400" />
                        <a href={`mailto:${search.searcher_email}`} className="text-navy hover:underline">
                          {search.searcher_email}
                        </a>
                      </div>

                      <p className="text-gray-700 mb-2 line-clamp-2">
                        <strong>Looking for:</strong> {search.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {search.category && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                            <FolderOpen size={12} />
                            {search.category}
                          </span>
                        )}
                        {colors.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Palette size={12} />
                            {color}
                          </span>
                        ))}
                        {tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSearch(search)}
                      className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded ml-4"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No lost item searches yet</p>
          </div>
        )}
      </div>

      {/* Search Detail Modal */}
      {selectedSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-navy">Search Details</h2>
              <button onClick={() => setSelectedSearch(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  selectedSearch.notification_sent
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {selectedSearch.notification_sent ? 'MATCH NOTIFIED' : 'NO MATCH YET'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Searcher Email</h4>
                <a href={`mailto:${selectedSearch.searcher_email}`} className="text-navy hover:underline flex items-center gap-1">
                  <Mail size={14} /> {selectedSearch.searcher_email}
                </a>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Description</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSearch.description}</p>
              </div>

              {selectedSearch.category && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Category</h4>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded inline-flex items-center gap-1">
                    <FolderOpen size={14} />
                    {selectedSearch.category}
                  </span>
                </div>
              )}

              {selectedSearch.colors && parseJsonField(selectedSearch.colors).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Colors Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseJsonField(selectedSearch.colors).map((color, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSearch.ai_tags && parseJsonField(selectedSearch.ai_tags).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">AI Tags Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseJsonField(selectedSearch.ai_tags).map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Search Date</h4>
                <p className="text-gray-600">{new Date(selectedSearch.created_at).toLocaleString()}</p>
              </div>

              {selectedSearch.matched_item_id && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Matched Item ID</h4>
                  <p className="text-navy font-semibold">#{selectedSearch.matched_item_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
