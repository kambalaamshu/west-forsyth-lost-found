'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { Upload, Search, CheckCircle, AlertCircle, Sparkles, X, Loader2, Mail, MapPin, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'

interface ImageAnalysisResult {
  tags: string[]
  objects: string[]
  colors: string[]
  detectedText: string[]
  confidence: number
  suggestedCategory?: string
  warning?: string
}

interface MatchedItem {
  id: number
  title: string
  description: string | null
  category: string
  color: string | null
  location: string
  date_found: string
  image_url: string | null
  score: number
  quality: {
    label: string
    color: string
  }
  tagMatches: string[]
  colorMatch: boolean
  categoryMatch: boolean
}

interface SearchResult {
  success: boolean
  searchId: number
  matchCount: number
  matches: MatchedItem[]
}

const categories = [
  { value: '', label: 'Any Category' },
  { value: 'Bags', label: 'Backpack/Bag' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Sports', label: 'Sports Equipment' },
  { value: 'Books', label: 'Books/Supplies' },
  { value: 'Keys', label: 'Keys' },
  { value: 'Water Bottles', label: 'Water Bottles' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Other', label: 'Other' },
]

export default function SearchPage() {
  // Photo and analysis state
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  // Search state
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [searchId, setSearchId] = useState<number | null>(null)

  // Notification state
  const [notifying, setNotifying] = useState<number | null>(null)
  const [notificationSuccess, setNotificationSuccess] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setSearchResult(null)
      setError(null)

      // Run AI analysis
      setAnalyzing(true)
      setAnalysisResult(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Analysis failed')
        }

        const result: ImageAnalysisResult = await response.json()
        setAnalysisResult(result)

        // Auto-fill category if detected
        if (result.suggestedCategory && result.suggestedCategory !== 'Other') {
          setCategory(result.suggestedCategory)
        }

      } catch (err) {
        console.error('Image analysis failed:', err)
      } finally {
        setAnalyzing(false)
      }
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSearching(true)
    setSearchResult(null)
    setNotificationSuccess(null)

    try {
      // Validate email
      if (!email.trim()) {
        throw new Error('Please enter your email address')
      }

      if (!description.trim()) {
        throw new Error('Please describe what you lost')
      }

      // Prepare search data
      const searchData = {
        email: email.trim(),
        description: description.trim(),
        category: category || analysisResult?.suggestedCategory || '',
        tags: analysisResult?.tags || [],
        colors: analysisResult?.colors || [],
      }

      const response = await fetch('/api/search-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const result: SearchResult = await response.json()
      setSearchResult(result)
      setSearchId(result.searchId)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSearching(false)
    }
  }

  const handleClaimItem = async (item: MatchedItem) => {
    setNotifying(item.id)
    setError(null)

    try {
      const response = await fetch('/api/notify-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchId,
          itemId: item.id,
          email: email.trim(),
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit claim')
      }

      setNotificationSuccess(item.id)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim')
    } finally {
      setNotifying(null)
    }
  }

  const clearPhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    setAnalysisResult(null)
    setSearchResult(null)
  }

  const getScoreColor = (quality: { color: string }) => {
    switch (quality.color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-300'
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">I Lost Something</h1>
            <p className="text-gray-600 text-lg">
              Upload a photo of your lost item (or similar) and we&apos;ll help you find it
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-8">
            {/* Step 1: Upload Photo */}
            <div className="bg-light-gray rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">
                <span className="inline-block w-8 h-8 bg-gold text-navy rounded-full text-center mr-3">
                  1
                </span>
                Upload a Photo (Recommended)
              </h3>

              <div className="border-3 border-dashed border-medium-gray rounded-lg p-12 text-center hover:border-gold transition-colors cursor-pointer">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-semibold mb-2">
                    Upload a photo of your lost item
                  </p>
                  <p className="text-sm text-gray-600">
                    Or a similar item - we&apos;ll use AI to find matches
                  </p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {photo && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-4 items-start">
                    {/* Image Preview */}
                    <div className="relative">
                      <img
                        src={photoPreview!}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gold"
                      />
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* AI Analysis Results */}
                    <div className="flex-1">
                      {analyzing ? (
                        <div className="flex items-center gap-2 text-navy">
                          <Loader2 className="animate-spin" size={20} />
                          <span className="font-semibold">Analyzing image...</span>
                        </div>
                      ) : analysisResult && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green font-semibold">
                            <Sparkles size={20} />
                            <span>AI Analysis Complete!</span>
                          </div>

                          {analysisResult.warning && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm text-yellow-800">
                              {analysisResult.warning}
                            </div>
                          )}

                          {analysisResult.tags.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Detected:</p>
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.tags.slice(0, 6).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-navy/10 text-navy px-3 py-1 rounded-full text-sm"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {analysisResult.colors.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Colors:</p>
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.colors.map((color, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                  >
                                    {color}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Your Info */}
            <div className="bg-light-gray rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">
                <span className="inline-block w-8 h-8 bg-gold text-navy rounded-full text-center mr-3">
                  2
                </span>
                Tell Us About Your Item
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your.name@students.forsyth.k12.ga.us"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    We&apos;ll send match notifications to this email
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Describe Your Lost Item <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Describe your lost item in detail (brand, color, unique features, what was inside, etc.)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {description.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Category
                  </label>
                  <select
                    className="input-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                className="btn-primary text-lg px-12 py-4 flex items-center gap-3 disabled:opacity-50"
                disabled={searching || !email || !description}
              >
                {searching ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={24} />
                    Search for Matches
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center">
                We&apos;ll search our database for items matching your description
              </p>
            </div>
          </form>

          {/* Search Results */}
          {searchResult && (
            <div className="mt-12 border-t pt-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {searchResult.matchCount > 0
                  ? `Found ${searchResult.matchCount} Potential Match${searchResult.matchCount > 1 ? 'es' : ''}`
                  : 'No Matches Found'}
              </h2>

              {searchResult.matchCount === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-600 mb-4">
                    We couldn&apos;t find any items matching your description in our database.
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    This doesn&apos;t mean your item isn&apos;t here! Try:
                  </p>
                  <ul className="text-gray-600 text-left max-w-md mx-auto space-y-2">
                    <li>• Uploading a different photo</li>
                    <li>• Using different keywords in your description</li>
                    <li>• Browsing all items manually</li>
                    <li>• Visiting the Lost & Found office in person</li>
                  </ul>
                  <Link href="/browse" className="btn-secondary inline-block mt-6">
                    Browse All Items
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {searchResult.matches.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white border-2 rounded-xl p-6 transition-all ${
                        notificationSuccess === item.id
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 hover:border-gold hover:shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full md:w-48 h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-4xl">📦</span>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                            <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(item.quality)}`}>
                              {item.score}% - {item.quality.label}
                            </span>
                          </div>

                          {item.description && (
                            <p className="text-gray-600 mb-4">{item.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Tag size={16} />
                              <span>{item.category}</span>
                            </div>
                            {item.color && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <div className="w-4 h-4 rounded-full bg-gray-300" />
                                <span>{item.color}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin size={16} />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={16} />
                              <span>{new Date(item.date_found).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Match indicators */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.categoryMatch && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                Category Match
                              </span>
                            )}
                            {item.colorMatch && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                Color Match
                              </span>
                            )}
                            {item.tagMatches.length > 0 && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                {item.tagMatches.length} Tag Match{item.tagMatches.length > 1 ? 'es' : ''}
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          {notificationSuccess === item.id ? (
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                              <CheckCircle size={20} />
                              <span>Claim submitted! Check your email for next steps.</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleClaimItem(item)}
                              disabled={notifying === item.id}
                              className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                              {notifying === item.id ? (
                                <>
                                  <Loader2 className="animate-spin" size={18} />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Mail size={18} />
                                  This is My Item!
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Browse All Link */}
              {searchResult.matchCount > 0 && (
                <div className="text-center mt-8">
                  <p className="text-gray-600 mb-3">
                    Don&apos;t see your item? Try browsing all found items manually.
                  </p>
                  <Link href="/browse" className="btn-secondary inline-block">
                    Browse All Items
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
