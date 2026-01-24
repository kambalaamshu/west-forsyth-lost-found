'use client'

import Navigation from '@/components/Navigation'
import { MapPin, Clock, Phone, Mail, CheckCircle, HelpCircle } from 'lucide-react'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h1>

        {/* Main FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">How long are items kept?</h3>
                <p className="text-gray-600">
                  Unclaimed items are held for 90 days, then donated to charity or disposed of properly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Can parents pick up items?</h3>
                <p className="text-gray-600">
                  Yes, with student ID and approval email. Parents may need to show identification.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">What if I find something after hours?</h3>
                <p className="text-gray-600">
                  Take it to the front office the next school day, or secure it and report online immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Are valuables stored securely?</h3>
                <p className="text-gray-600">
                  Yes, electronics, jewelry, and wallets are kept in a locked cabinet with restricted access.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">How do I claim an item?</h3>
                <p className="text-gray-600">
                  Browse our database, submit a claim with proof of ownership, then pick up your approved item at the front office.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">How do I report a found item?</h3>
                <p className="text-gray-600">
                  Submit item details on our website, then bring the item to the front office within 72 hours.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">What items should I report?</h3>
                <p className="text-gray-600">
                  Any items that appear to belong to someone else: electronics, clothing, bags, school supplies, sports equipment, etc.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <HelpCircle className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-2">Can I search for my lost item?</h3>
                <p className="text-gray-600">
                  Yes! Use "I Lost Something" to upload a photo and we'll find potential matches using AI image recognition.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Office Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-navy">Office Details</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">Location</h3>
                    <p className="text-gray-600">
                      Front Office<br />
                      West Forsyth High School<br />
                      4155 Drew Road<br />
                      Cumming, GA 30040
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 7:30 AM - 3:30 PM<br />
                      School Holidays: Closed<br />
                      Summer Hours: Limited (call ahead)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">Phone</h3>
                    <p className="text-gray-600">
                      (770) 888-3470
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-600">
                      wfhslostandfound@forsyth.k12.ga.us
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Bring */}
            <div className="bg-gold/10 border-l-4 border-gold rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">What to Bring When Claiming:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Student ID card</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Approval email from website</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Additional proof (if requested)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Drop-off Instructions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-navy">Dropping Off Found Items</h2>

              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-gray-700">
                  <span className="font-semibold">Submit item details on our website FIRST</span>
                  <p className="text-gray-600 ml-6 mt-1">Take a photo and fill out the report form</p>
                </li>
                <li className="text-gray-700">
                  <span className="font-semibold">Bring the item to the front office within 72 hours</span>
                  <p className="text-gray-600 ml-6 mt-1">During school hours (7:30 AM - 3:30 PM)</p>
                </li>
                <li className="text-gray-700">
                  <span className="font-semibold">We&apos;ll verify and approve your posting</span>
                  <p className="text-gray-600 ml-6 mt-1">Item will be matched with your submission</p>
                </li>
                <li className="text-gray-700">
                  <span className="font-semibold">Item appears in searchable database</span>
                  <p className="text-gray-600 ml-6 mt-1">Owner can now find and claim their item</p>
                </li>
              </ol>
            </div>

            {/* Claiming Instructions */}
            <div className="bg-green/10 border-l-4 border-green rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">How to Claim Your Item:</h3>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Browse the database or search with a photo</li>
                <li>Click "Claim This Item" and provide proof</li>
                <li>Wait for approval email</li>
                <li>Visit the front office with your ID</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-navy to-green rounded-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Can&apos;t Find Your Item?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Check our database or contact us directly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/browse" className="bg-gold text-navy font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-colors">
              Browse Database
            </a>
            <a href="/contact" className="bg-white text-navy font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
