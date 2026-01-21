'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

const subjects = [
  'Question about a found item',
  'Claim status inquiry',
  'Technical support',
  'General inquiry',
  'Feedback',
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setSubmitted(true)
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
            <h1 className="text-4xl font-bold mb-4">Message Sent!</h1>
            <p className="text-xl text-gray-600 mb-6">
              We&apos;ve received your message and will respond within 24 hours.
            </p>
            <div className="bg-gold/10 border-l-4 border-gold p-6 rounded-lg mb-8 text-left">
              <h3 className="font-bold mb-2">What happens next:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>Your message has been saved to our system</li>
                <li>Our staff will review it during office hours</li>
                <li>You&apos;ll receive a response at: <strong>{formData.email}</strong></li>
              </ul>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Have questions? We&apos;re here to help!
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-error-red p-4 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-error-red flex-shrink-0" />
                <p className="text-error-red">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">
                  Your Name <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Email <span className="text-error-red">*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  required
                  placeholder="john.smith@forsyth.k12.ga.us"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Subject <span className="text-error-red">*</span>
                </label>
                <select
                  className="input-field"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                >
                  <option value="">Select a topic...</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Message <span className="text-error-red">*</span>
                </label>
                <textarea
                  className="input-field"
                  rows={6}
                  required
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="inline mr-2" size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-navy mb-2">Visit Us</h3>
                  <p className="text-gray-600">
                    Lost & Found Office<br />
                    Room 100, Main Office<br />
                    West Forsyth High School
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-navy mb-2">Call Us</h3>
                  <p className="text-gray-600">
                    (770) 781-6800 ext. 1234<br />
                    Monday - Friday, 7:30 AM - 3:30 PM
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-navy mb-2">Email Us</h3>
                  <p className="text-gray-600">
                    lostandfound@forsyth.k12.ga.us<br />
                    Response time: Within 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gold/10 border-l-4 border-gold rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Before Contacting:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>Check our <a href="/browse" className="text-navy underline">database</a> for your item</li>
                <li>Review our <a href="/location" className="text-navy underline">FAQ section</a></li>
                <li>Have your item ID number ready (if applicable)</li>
                <li>Check your email for previous responses</li>
              </ul>
            </div>

            <div className="bg-green/10 border-l-4 border-green rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Response Times:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>Claim status: Same day</li>
                <li>General questions: Within 24 hours</li>
                <li>Technical issues: 1-2 business days</li>
                <li>Urgent matters: Call during office hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <a href="/report" className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-bold mb-2">Report Found Item</h3>
            <p className="text-sm text-gray-600">Submit a found item to our database</p>
          </a>

          <a href="/browse" className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold mb-2">Search Database</h3>
            <p className="text-sm text-gray-600">Browse all found items</p>
          </a>

          <a href="/location" className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-bold mb-2">Visit Office</h3>
            <p className="text-sm text-gray-600">Get directions and hours</p>
          </a>
        </div>
      </div>
    </div>
  )
}
