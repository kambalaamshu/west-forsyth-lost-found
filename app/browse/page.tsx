'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Search, MapPin, Calendar, Palette, Package, X, CheckCircle, Tag, Loader2, Upload, Image } from 'lucide-react'

interface Item {
  id: number
  type: 'lost' | 'found'
  title: string
  description: string | null
  category: string
  color: string | null
  location: string
  date_found: string
  image_url: string | null
  ai_tags: string | null
  contact_name: string | null
  contact_email: string | null
  status: string
}

const categoryIcons: Record<string, string> = {
  'Bags': '🎒',
  'Electronics': '📱',
  'Clothing': '🧥',
  'Keys': '🔑',
  'Water Bottles': '🍶',
  'Accessories': '👓',
  'Sports': '⚽',
  'Books': '📚',
  'Other': '📦',
}

function BrowsePageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const claimItemId = searchParams.get('claim')

  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimItem, setClaimItem] = useState<Item | null>(null)
  const [claimForm, setClaimForm] = useState({ name: '', email: '', studentId: '', description: '' })
  const [claimSubmitted, setClaimSubmitted] = useState(false)
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null)

  // Fetch items and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, statsRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/stats')
        ])
        const itemsData = await itemsRes.json()
        const statsData = await statsRes.json()

        setItems(itemsData)
        setCategories(statsData.categories || [])

        // If claim parameter is present, find the item and open claim modal
        if (claimItemId) {
          const itemToClaimId = parseInt(claimItemId, 10)
          const itemToClaim = itemsData.find((item: Item) => item.id === itemToClaimId)
          if (itemToClaim) {
            setClaimItem(itemToClaim)
            setShowClaimModal(true)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [claimItemId])

  // Get unique colors from items
  const availableColors = Array.from(new Set(items.map(item => item.color).filter(Boolean))) as string[]

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ai_tags?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.includes(item.category)

    const matchesColor = selectedColors.length === 0 ||
      (item.color && selectedColors.some(color =>
        item.color!.toLowerCase().includes(color.toLowerCase())
      ))

    return matchesSearch && matchesCategory && matchesColor
  })

  const toggleFilter = (value: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value))
    } else {
      setSelected([...selected, value])
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedColors([])
    setSearchTerm('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const openClaimModal = (item: Item) => {
    setClaimItem(item)
    setShowClaimModal(true)
    setClaimSubmitted(false)
    setClaimForm({ name: '', email: '', studentId: '', description: '' })
    setProofImage(null)
    setProofImagePreview(null)
  }

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProofImage(file)
      setProofImagePreview(URL.createObjectURL(file))
    }
  }

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!proofImage) {
      alert('Please upload a proof of ownership image')
      return
    }

    setClaimSubmitting(true)

    // Submit claim to API
    try {
      // Upload proof image first
      let proofImageUrl: string | null = null
      const uploadFormData = new FormData()
      uploadFormData.append('file', proofImage)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        proofImageUrl = uploadData.url
      }

      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: claimItem!.id,
          item_title: claimItem!.title,
          claimant_name: claimForm.name,
          claimant_email: claimForm.email,
          student_id: claimForm.studentId || undefined,
          description: claimForm.description + (proofImageUrl ? `\n\n[Proof Image: ${proofImageUrl}]` : ''),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit claim')
      }

      setClaimSubmitted(true)
    } catch (error) {
      console.error('Error submitting claim:', error)
      alert('Failed to submit claim. Please try again.')
    } finally {
      setClaimSubmitting(false)
    }
  }

  const closeClaimModal = () => {
    setShowClaimModal(false)
    setClaimItem(null)
    setClaimSubmitted(false)
    setProofImage(null)
    setProofImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Search Header */}
      <div className="bg-navy text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-white">Browse Found Items</h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-6 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button type="submit" className="btn-primary">
              <Search className="inline mr-2" size={20} />
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-navy">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-gold"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                      />
                      <span>{categoryIcons[cat] || '📦'} {cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-navy">Color</h4>
                <div className="space-y-2">
                  {availableColors.map((color) => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-gold"
                        checked={selectedColors.includes(color)}
                        onChange={() => toggleFilter(color, selectedColors, setSelectedColors)}
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Items Grid */}
          <main className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                <strong>{filteredItems.length}</strong> items found
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
                <p className="text-gray-500">Loading items...</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-gold cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      {/* Item Image/Icon */}
                      {item.image_url ? (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-navy to-green flex items-center justify-center text-6xl">
                          {categoryIcons[item.category] || '📦'}
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 text-navy">{item.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <MapPin size={14} /> {item.location}
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar size={14} /> {new Date(item.date_found).toLocaleDateString()}
                          </p>
                          {item.color && (
                            <p className="flex items-center gap-2">
                              <Palette size={14} /> {item.color}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Package size={14} /> {item.category}
                          </p>
                        </div>

                        {/* AI Tags */}
                        {item.ai_tags && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.ai_tags.split(', ').slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-navy/10 text-navy text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                              >
                                <Tag size={10} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          className="mt-4 w-full bg-navy text-gold font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedItem(item)
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-6xl mb-4">🔍</p>
                    <p className="text-2xl text-gray-400 mb-4">No items found</p>
                    <p className="text-gray-500">Try adjusting your filters or search term</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {selectedItem.image_url ? (
              <div className="h-48 overflow-hidden">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-navy to-green flex items-center justify-center text-8xl">
                {categoryIcons[selectedItem.category] || '📦'}
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-navy mb-4">{selectedItem.title}</h2>

              {selectedItem.description && (
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="text-navy" size={20} />
                  <span><strong>Location:</strong> {selectedItem.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="text-navy" size={20} />
                  <span><strong>Date Found:</strong> {new Date(selectedItem.date_found).toLocaleDateString()}</span>
                </div>
                {selectedItem.color && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Palette className="text-navy" size={20} />
                    <span><strong>Color:</strong> {selectedItem.color}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <Package className="text-navy" size={20} />
                  <span><strong>Category:</strong> {selectedItem.category}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-light-gray rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-navy mb-2">Contact Information</h4>
                {selectedItem.contact_name && (
                  <p className="text-gray-700">{selectedItem.contact_name}</p>
                )}
                {selectedItem.contact_email && (
                  <a
                    href={`mailto:${selectedItem.contact_email}?subject=Inquiry about: ${selectedItem.title}`}
                    className="text-green hover:underline"
                  >
                    {selectedItem.contact_email}
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedItem(null)
                    openClaimModal(selectedItem)
                  }}
                  className="flex-1 bg-navy text-gold font-semibold py-3 px-4 rounded-lg text-center hover:bg-opacity-90 transition-colors"
                >
                  Claim This Item
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Form Modal */}
      {showClaimModal && claimItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeClaimModal}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-navy text-white p-6 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Claim Item</h2>
              <button onClick={closeClaimModal} className="text-white hover:text-gold">
                <X size={24} />
              </button>
            </div>

            {claimSubmitted ? (
              /* Success Message */
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-navy mb-2">Claim Submitted!</h3>
                <p className="text-gray-600 mb-6">
                  Your claim for <strong>{claimItem.title}</strong> has been submitted.
                  The Lost & Found office will review your request and contact you within 1-2 business days.
                </p>
                <button
                  onClick={closeClaimModal}
                  className="bg-navy text-gold font-semibold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Claim Form */
              <form onSubmit={handleClaimSubmit} className="p-6">
                <div className="bg-light-gray rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    <strong>Claiming:</strong> {claimItem.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Found at:</strong> {claimItem.location}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={claimForm.name}
                      onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={claimForm.email}
                      onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                      className="input-field"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Student ID (if applicable)
                    </label>
                    <input
                      type="text"
                      value={claimForm.studentId}
                      onChange={(e) => setClaimForm({ ...claimForm, studentId: e.target.value })}
                      className="input-field"
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Upload Proof of Ownership *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a photo showing you with a similar item, a receipt, or other proof that this belongs to you.
                    </p>
                    <div className="border-2 border-dashed border-medium-gray rounded-lg p-4 text-center hover:border-gold transition-colors cursor-pointer">
                      <label htmlFor="proof-upload" className="cursor-pointer">
                        {proofImagePreview ? (
                          <div className="relative inline-block">
                            <img
                              src={proofImagePreview}
                              alt="Proof preview"
                              className="max-h-32 rounded-lg mx-auto"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setProofImage(null)
                                setProofImagePreview(null)
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Image className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload proof image</p>
                          </>
                        )}
                        <input
                          id="proof-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProofImageChange}
                          className="hidden"
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Additional Description (Optional)
                    </label>
                    <textarea
                      value={claimForm.description}
                      onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                      className="input-field min-h-[80px]"
                      placeholder="Describe unique features, contents, or identifying marks..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={claimSubmitting}
                    className="flex-1 bg-navy text-gold font-semibold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                  <button
                    type="button"
                    onClick={closeClaimModal}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Loading fallback for Suspense
function BrowseLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="bg-navy text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-white">Browse Found Items</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-navy" />
          <p className="text-gray-500">Loading items...</p>
        </div>
      </div>
    </div>
  )
}

// Export page with Suspense wrapper
export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowsePageContent />
    </Suspense>
  )
}
