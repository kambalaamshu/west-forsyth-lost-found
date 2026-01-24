import { NextRequest, NextResponse } from 'next/server'
import vision from '@google-cloud/vision'
import path from 'path'
import fs from 'fs'

// Initialize Google Cloud Vision client
// Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
// Or GOOGLE_CLOUD_API_KEY for API key authentication
function getVisionClient() {
  // Check for API key first
  if (process.env.GOOGLE_CLOUD_API_KEY) {
    return new vision.ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_API_KEY
    })
  }

  // Check for service account credentials
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new vision.ImageAnnotatorClient()
  }

  // Check for credentials in project root
  const credPath = path.join(process.cwd(), 'google-credentials.json')
  if (fs.existsSync(credPath)) {
    return new vision.ImageAnnotatorClient({
      keyFilename: credPath
    })
  }

  throw new Error('Google Cloud credentials not configured')
}

export interface AnalysisResult {
  tags: string[]
  objects: string[]
  colors: string[]
  detectedText: string[]
  confidence: number
  suggestedCategory: string
}

// Map Vision API labels to user-friendly categories
function mapToCategory(labels: string[]): string {
  const categoryMap: Record<string, string[]> = {
    'Electronics': ['phone', 'laptop', 'computer', 'tablet', 'electronic', 'charger', 'cable', 'airpods', 'earbuds', 'headphones', 'calculator', 'watch', 'smartwatch'],
    'Bags': ['backpack', 'bag', 'handbag', 'purse', 'luggage', 'suitcase', 'tote', 'messenger bag', 'duffel'],
    'Clothing': ['jacket', 'coat', 'hoodie', 'sweatshirt', 'shirt', 'pants', 'jeans', 'sweater', 'dress', 'uniform', 'jersey'],
    'Accessories': ['glasses', 'sunglasses', 'watch', 'jewelry', 'bracelet', 'necklace', 'ring', 'hat', 'cap', 'scarf', 'gloves', 'belt'],
    'Books': ['book', 'textbook', 'notebook', 'binder', 'folder', 'planner', 'journal'],
    'Keys': ['key', 'keychain', 'car key', 'lanyard'],
    'Water Bottles': ['water bottle', 'bottle', 'thermos', 'flask', 'hydro flask', 'tumbler'],
    'Sports Equipment': ['ball', 'sports', 'athletic', 'racket', 'bat', 'glove', 'helmet', 'pads'],
    'ID/Cards': ['card', 'id', 'badge', 'wallet', 'credit card', 'student id'],
  }

  const lowerLabels = labels.map(l => l.toLowerCase())

  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (lowerLabels.some(label => label.includes(keyword))) {
        return category
      }
    }
  }

  return 'Other'
}

// Map Vision API colors to friendly names
function mapColorName(color: { red: number; green: number; blue: number }): string {
  const { red, green, blue } = color

  // Calculate lightness
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2

  if (lightness < 30) return 'Black'
  if (lightness > 225) return 'White'
  if (max - min < 25) return lightness > 128 ? 'Gray' : 'Dark Gray'

  // Determine hue-based color
  if (red >= green && red >= blue) {
    if (green > blue + 30 && red > 180) return 'Orange'
    if (Math.abs(red - green) < 30 && red > 180 && blue < 100) return 'Yellow'
    if (red > 180 && green > 150 && blue < 100) return 'Gold'
    return 'Red'
  }
  if (green >= red && green >= blue) {
    if (Math.abs(green - red) < 40 && blue < 100) return 'Yellow'
    return 'Green'
  }
  if (blue >= red && blue >= green) {
    if (red > 100 && red < blue) return 'Purple'
    if (green > 150 && blue > 200) return 'Teal'
    return 'Blue'
  }

  return 'Multi-color'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if credentials are configured
    if (!process.env.GOOGLE_CLOUD_API_KEY &&
        !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
        !fs.existsSync(path.join(process.cwd(), 'google-credentials.json'))) {
      // Return mock analysis for development/demo
      return NextResponse.json({
        tags: ['Item detected'],
        objects: [],
        colors: ['Unknown'],
        detectedText: [],
        confidence: 0,
        suggestedCategory: 'Other',
        warning: 'Google Cloud Vision not configured. Add GOOGLE_CLOUD_API_KEY to .env.local'
      })
    }

    const client = getVisionClient()

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Request multiple features from Vision API
    const [result] = await client.annotateImage({
      image: { content: base64Image },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 15 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'TEXT_DETECTION' },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'LOGO_DETECTION', maxResults: 5 },
      ],
    })

    const analysisResult: AnalysisResult = {
      tags: [],
      objects: [],
      colors: [],
      detectedText: [],
      confidence: 0,
      suggestedCategory: 'Other'
    }

    // Process labels (general image classification)
    if (result.labelAnnotations) {
      analysisResult.tags = result.labelAnnotations
        .filter(label => (label.score || 0) > 0.5)
        .map(label => label.description || '')
        .filter(Boolean)
        .slice(0, 10)

      // Calculate average confidence
      const scores = result.labelAnnotations.map(l => l.score || 0)
      analysisResult.confidence = Math.round(
        (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
      )
    }

    // Process detected objects
    if (result.localizedObjectAnnotations) {
      analysisResult.objects = result.localizedObjectAnnotations
        .filter(obj => (obj.score || 0) > 0.5)
        .map(obj => obj.name || '')
        .filter(Boolean)
    }

    // Process logos (brand detection)
    if (result.logoAnnotations) {
      const logos = result.logoAnnotations
        .map(logo => logo.description || '')
        .filter(Boolean)
      analysisResult.tags.push(...logos.map(l => `${l} (Brand)`))
    }

    // Process text (OCR)
    if (result.textAnnotations && result.textAnnotations.length > 0) {
      const fullText = result.textAnnotations[0].description || ''
      // Extract meaningful words (names, serial numbers, etc.)
      const words = fullText.split(/\s+/)
        .map(word => word.trim())
        .filter(word => {
          return word.length >= 2 &&
                 word.length <= 30 &&
                 /^[A-Za-z0-9#@.\-]+$/.test(word)
        })
      analysisResult.detectedText = Array.from(new Set(words)).slice(0, 15)
    }

    // Process colors
    if (result.imagePropertiesAnnotation?.dominantColors?.colors) {
      const colors = result.imagePropertiesAnnotation.dominantColors.colors
        .sort((a, b) => (b.pixelFraction || 0) - (a.pixelFraction || 0))
        .slice(0, 5)
        .map(c => mapColorName({
          red: c.color?.red || 0,
          green: c.color?.green || 0,
          blue: c.color?.blue || 0
        }))
        .filter(c => c !== 'White' && c !== 'Black' && c !== 'Gray')

      analysisResult.colors = Array.from(new Set(colors)).slice(0, 3)
    }

    // Determine suggested category
    const allLabels = [...analysisResult.tags, ...analysisResult.objects]
    analysisResult.suggestedCategory = mapToCategory(allLabels)

    // Deduplicate tags
    analysisResult.tags = Array.from(new Set(analysisResult.tags)).slice(0, 10)
    analysisResult.objects = Array.from(new Set(analysisResult.objects)).slice(0, 5)

    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
