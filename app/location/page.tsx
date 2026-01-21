'use client'

import Navigation from '@/components/Navigation'
import { MapPin, Clock, Phone, Mail, CheckCircle } from 'lucide-react'

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">
          📍 Visit Lost & Found Office
        </h1>

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
                      Main Office, Room 100<br />
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
                      (770) 781-6800 ext. 1234
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="text-gold w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-600">
                      lostandfound@forsyth.k12.ga.us
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Bring */}
            <div className="bg-gold/10 border-l-4 border-gold rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">📋 What to Bring When Claiming:</h3>
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

          {/* Map and Directions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-navy">How to Get There</h2>
              
              {/* Placeholder Map */}
              <div className="bg-gradient-to-br from-navy to-green rounded-lg h-64 flex items-center justify-center mb-6">
                <div className="text-center text-white">
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Interactive Map</p>
                  <p className="text-sm opacity-90">Google Maps integration</p>
                </div>
              </div>

              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="font-bold text-navy mb-2">From Main Entrance:</h3>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Enter through the main doors</li>
                    <li>Turn right at the first hallway</li>
                    <li>Lost & Found is in Room 100 (Main Office)</li>
                    <li>Look for the gold "Lost & Found" sign</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-bold text-navy mb-2">Parking:</h3>
                  <p>Visitor parking available in front lot near main entrance</p>
                </div>
              </div>
            </div>

            {/* Drop-off Instructions */}
            <div className="bg-green/10 border-l-4 border-green rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">📦 Dropping Off Found Items:</h3>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Submit item details on our website FIRST</li>
                <li>Bring the item to Room 100 within 24 hours</li>
                <li>We'll verify and approve your posting</li>
                <li>Item appears in searchable database</li>
              </ol>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-navy text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">How long are items kept?</h3>
              <p className="text-gray-600">
                Unclaimed items are held for 90 days, then donated to charity or disposed of properly.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Can parents pick up items?</h3>
              <p className="text-gray-600">
                Yes, with student ID and approval email. Parents may need to show identification.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">What if I find something after hours?</h3>
              <p className="text-gray-600">
                Take it to the main office the next school day, or secure it and report online immediately.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Are valuables stored securely?</h3>
              <p className="text-gray-600">
                Yes, electronics, jewelry, and wallets are kept in a locked cabinet with restricted access.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-navy to-green rounded-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Can't Find Your Item?
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
