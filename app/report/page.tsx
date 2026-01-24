'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { Upload, CheckCircle, AlertCircle, Sparkles, X, Loader2 } from 'lucide-react'

// Analysis result interface matching the server-side API
interface ImageAnalysisResult {
  tags: string[]
  objects: string[]
  colors: string[]
  detectedText: string[]
  confidence: number
  suggestedCategory?: string
  warning?: string
}

const categories = [
  { value: 'Bags', label: 'Backpack/Bag' },
  { value: 'Electronics', label: 'Electronics (Phone, AirPods, etc.)' },
  { value: 'Clothing', label: 'Clothing/Accessories' },
  { value: 'Sports', label: 'Sports Equipment' },
  { value: 'Books', label: 'Books/School Supplies' },
  { value: 'Keys', label: 'Keys' },
  { value: 'Water Bottles', label: 'Water Bottles' },
  { value: 'Accessories', label: 'Glasses/Jewelry/Accessories' },
  { value: 'Other', label: 'Other' },
]

const locations = [
  'Main Hallway',
  'Cafeteria',
  'Gymnasium',
  'Library',
  'Parking Lot A',
  'Parking Lot B',
  'Auditorium',
  'Science Lab',
  'Front Office',
  'Room 112 - English',
  'Room 204 - Math',
  'Football Field',
  'Other',
]

const colors = ['Navy Blue', 'Gold/Yellow', 'Green', 'Black', 'Red', 'White', 'Gray', 'Purple', 'Pink', 'Brown', 'Other']

export default function ReportPage() {
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null)
  const [aiTags, setAiTags] = useState<string[]>([])
  const [detectedText, setDetectedText] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    selectedColors: [] as string[],
    location: '',
    locationDetail: '',
    dateFound: '',
    timeFound: '',
    contactName: '',
    contactEmail: '',
    deliveryAgreed: false,
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).slice(0, 5)
      setPhotos(filesArray)

      // Create preview for first image
      const previewUrl = URL.createObjectURL(filesArray[0])
      setPhotoPreview(previewUrl)

      // Run AI analysis on first image using server-side Google Cloud Vision
      setAnalyzing(true)
      setAnalysisResult(null)
      setAiTags([])
      setDetectedText([])

      try {
        // Call server-side API for Google Cloud Vision analysis
        const analyzeFormData = new FormData()
        analyzeFormData.append('file', filesArray[0])

        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          body: analyzeFormData,
        })

        if (!response.ok) {
          throw new Error('Analysis failed')
        }

        const result: ImageAnalysisResult = await response.json()
        setAnalysisResult(result)
        setAiTags(result.tags)
        setDetectedText(result.detectedText)

        // Auto-fill colors if detected
        if (result.colors.length > 0) {
          const matchedColors = result.colors.filter(c =>
            colors.some(color => color.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(color.toLowerCase()))
          )
          if (matchedColors.length > 0) {
            setFormData(prev => ({
              ...prev,
              selectedColors: Array.from(new Set([...prev.selectedColors, ...matchedColors]))
            }))
          }
        }

        // Use suggested category from API if available
        if (result.suggestedCategory && result.suggestedCategory !== 'Other' && !formData.category) {
          setFormData(prev => ({ ...prev, category: result.suggestedCategory! }))
        }

      } catch (err) {
        console.error('Image analysis failed:', err)
      } finally {
        setAnalyzing(false)
      }
    }
  }

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(color)
        ? prev.selectedColors.filter(c => c !== color)
        : [...prev.selectedColors, color]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Upload photo if provided
      let imageUrl: string | null = null
      if (photos.length > 0) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', photos[0])

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      // Build the location string
      const fullLocation = formData.locationDetail
        ? `${formData.location} - ${formData.locationDetail}`
        : formData.location

      // Build the color string
      const colorString = formData.selectedColors.join(', ')

      // Combine AI tags and detected text
      const allTags = [...aiTags, ...detectedText].join(', ')

      // Create the item payload
      const payload = {
        type: 'found' as const,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        color: colorString || null,
        location: fullLocation,
        date_found: formData.dateFound,
        image_url: imageUrl,
        ai_tags: allTags || null,
        contact_name: formData.contactName || 'Anonymous',
        contact_email: formData.contactEmail || 'wfhslostandfound@forsyth.k12.ga.us',
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit item')
      }

      setSubmitted(true)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CheckCircle className="text-green w-20 h-20 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-6">
              Your found item has been added to our database.
            </p>
            <div className="bg-gold/10 border-l-4 border-gold p-6 rounded-lg mb-8 text-left">
              <h3 className="font-bold mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Deliver the item to the Lost & Found (front office)</li>
                <li>The item is now visible in our searchable database</li>
                <li>The owner can contact you via the email provided</li>
                <li>Check back for claim requests</li>
              </ol>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/browse'}
                className="btn-secondary"
              >
                View All Items
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-primary"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Report a Found Item</h1>
            <p className="text-gray-600 text-lg">
              Help reunite someone with their lost belongings
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-error-red p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-error-red flex-shrink-0" />
              <p className="text-error-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Upload Photos */}
            <div className="bg-light-gray rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">
                <span className="inline-block w-8 h-8 bg-gold text-navy rounded-full text-center mr-3">
                  1
                </span>
                Upload Photos (Optional)
              </h3>

              <div className="border-3 border-dashed border-medium-gray rounded-lg p-12 text-center hover:border-gold transition-colors cursor-pointer">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-semibold mb-2">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-sm text-gray-600">
                    Maximum 5 photos - JPG, PNG - Max 5MB each
                  </p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-4 items-start">
                    {/* Image Preview */}
                    {photoPreview && (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotos([])
                            setPhotoPreview(null)
                            setAnalysisResult(null)
                            setAiTags([])
                            setDetectedText([])
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* AI Analysis Results */}
                    <div className="flex-1">
                      {analyzing ? (
                        <div className="flex items-center gap-2 text-navy">
                          <Loader2 className="animate-spin" size={20} />
                          <span className="font-semibold">Analyzing image with Google Cloud Vision...</span>
                        </div>
                      ) : analysisResult && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green font-semibold">
                            <Sparkles size={20} />
                            <span>AI Analysis Complete!</span>
                            {analysisResult.confidence > 0 && (
                              <span className="text-sm text-gray-500">({analysisResult.confidence}% confidence)</span>
                            )}
                          </div>

                          {/* Warning if Vision API not configured */}
                          {analysisResult.warning && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm text-yellow-800">
                              {analysisResult.warning}
                            </div>
                          )}

                          {/* Detected Tags */}
                          {aiTags.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Detected Objects:</p>
                              <div className="flex flex-wrap gap-2">
                                {aiTags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-navy/10 text-navy px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                  >
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => setAiTags(aiTags.filter((_, i) => i !== idx))}
                                      className="hover:text-red-500"
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Detected Text (OCR) */}
                          {detectedText.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Detected Text (Names/Labels):</p>
                              <div className="flex flex-wrap gap-2">
                                {detectedText.map((text, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-gold/20 text-navy px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                  >
                                    "{text}"
                                    <button
                                      type="button"
                                      onClick={() => setDetectedText(detectedText.filter((_, i) => i !== idx))}
                                      className="hover:text-red-500"
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Detected Colors */}
                          {analysisResult.colors.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-1">Detected Colors:</p>
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

                      <p className="text-sm text-gray-500 mt-2">
                        {photos.length} photo{photos.length > 1 ? 's' : ''} selected: {photos.map(p => p.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Item Details */}
            <div className="bg-light-gray rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">
                <span className="inline-block w-8 h-8 bg-gold text-navy rounded-full text-center mr-3">
                  2
                </span>
                Item Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Item Title <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Navy Blue JanSport Backpack"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Category <span className="text-error-red">*</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Item Description <span className="text-error-red">*</span>
                  </label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Describe the item in detail (brand, condition, what's inside, distinguishing features, etc.)"
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Color(s)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colors.map((color) => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-gold"
                          checked={formData.selectedColors.includes(color)}
                          onChange={() => handleColorToggle(color)}
                        />
                        <span>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Location & Time */}
            <div className="bg-light-gray rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">
                <span className="inline-block w-8 h-8 bg-gold text-navy rounded-full text-center mr-3">
                  3
                </span>
                Location & Time
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Where did you find it? <span className="text-error-red">*</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Specific Details (optional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., near water fountain, under bench"
                    value={formData.locationDetail}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationDetail: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    When did you find it? <span className="text-error-red">*</span>
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="date"
                      className="input-field"
                      value={formData.dateFound}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateFound: e.target.value }))}
                      required
                    />
                    <input
                      type="time"
                      className="input-field"
                      value={formData.timeFound}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeFound: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Your Contact Info */}
            <div className="bg-light-gray rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">
                <span className="inline-block w-8 h-8 bg-gold text-navy rounded-full text-center mr-3">
                  4
                </span>
                Your Contact Info (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., John Smith"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="e.g., john.smith@forsyth.k12.ga.us"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    If left blank, inquiries will go to the Lost & Found office
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement & Submit */}
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-gold p-4 rounded">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 mt-1 accent-gold"
                    checked={formData.deliveryAgreed}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAgreed: e.target.checked }))}
                    required
                  />
                  <span className="text-sm">
                    I will deliver this item to the Lost & Found (front office) within 72 hours, or I have already done so.
                  </span>
                </label>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  type="submit"
                  className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Found Item'}
                </button>
                <p className="text-sm text-gray-500 text-center">
                  Your item will be immediately visible in our database
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
