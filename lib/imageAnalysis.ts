'use client'

import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import Tesseract from 'tesseract.js'

// Cache models to avoid reloading
let mobilenetModel: mobilenet.MobileNet | null = null
let cocoModel: cocoSsd.ObjectDetection | null = null

export interface ImageAnalysisResult {
  tags: string[]
  objects: string[]
  colors: string[]
  detectedText: string[]
  confidence: number
}

// Load MobileNet model for image classification
async function loadMobileNet(): Promise<mobilenet.MobileNet> {
  if (!mobilenetModel) {
    await tf.ready()
    mobilenetModel = await mobilenet.load()
  }
  return mobilenetModel
}

// Load COCO-SSD model for object detection
async function loadCocoSsd(): Promise<cocoSsd.ObjectDetection> {
  if (!cocoModel) {
    await tf.ready()
    cocoModel = await cocoSsd.load()
  }
  return cocoModel
}

// Convert File to HTMLImageElement
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

// Extract dominant colors from image
function extractColors(img: HTMLImageElement): string[] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  // Resize for faster processing
  const size = 50
  canvas.width = size
  canvas.height = size
  ctx.drawImage(img, 0, 0, size, size)

  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data

  // Simple color bucketing
  const colorCounts: Record<string, number> = {}

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const colorName = getColorName(r, g, b)
    colorCounts[colorName] = (colorCounts[colorName] || 0) + 1
  }

  // Sort by frequency and return top colors
  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color)
    .filter(color => color !== 'White' && color !== 'Black') // Filter out backgrounds
}

// Map RGB to color names
function getColorName(r: number, g: number, b: number): string {
  // Simple color classification
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2

  if (lightness < 30) return 'Black'
  if (lightness > 225) return 'White'
  if (max - min < 20) return lightness > 128 ? 'Gray' : 'Dark Gray'

  // Determine hue-based color
  if (r > g && r > b) {
    if (r - g < 30 && r > 180) return 'Pink'
    if (g > b) return 'Orange'
    return 'Red'
  }
  if (g > r && g > b) {
    if (g - r < 40 && g - b < 40) return 'Yellow'
    return 'Green'
  }
  if (b > r && b > g) {
    if (r > 100 && b > 150) return 'Purple'
    return 'Blue'
  }
  if (r > 150 && g > 100 && b < 100) return 'Gold/Yellow'
  if (r > 100 && g < 80 && b < 80) return 'Brown'

  return 'Multi-color'
}

// Classify image using MobileNet
async function classifyImage(img: HTMLImageElement): Promise<{ className: string; probability: number }[]> {
  try {
    const model = await loadMobileNet()
    const predictions = await model.classify(img)
    return predictions
  } catch (error) {
    console.error('MobileNet classification error:', error)
    return []
  }
}

// Detect objects using COCO-SSD
async function detectObjects(img: HTMLImageElement): Promise<cocoSsd.DetectedObject[]> {
  try {
    const model = await loadCocoSsd()
    const predictions = await model.detect(img)
    return predictions
  } catch (error) {
    console.error('COCO-SSD detection error:', error)
    return []
  }
}

// Extract text using Tesseract OCR
async function extractText(file: File): Promise<string[]> {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: () => {} // Suppress logs
    })

    // Extract words that look like names or identifiers
    const text = result.data.text
    const words = text.split(/\s+/)
      .map(word => word.trim())
      .filter(word => {
        // Filter for meaningful text (names, serial numbers, etc.)
        return word.length >= 2 &&
               word.length <= 30 &&
               /^[A-Za-z0-9#@.-]+$/.test(word) &&
               !/^[0-9]+$/.test(word) // Exclude pure numbers unless they look like IDs
      })

    // Return unique, meaningful words
    return Array.from(new Set(words)).slice(0, 10)
  } catch (error) {
    console.error('OCR error:', error)
    return []
  }
}

// Map MobileNet/COCO classes to user-friendly tags
function mapToFriendlyTags(predictions: { className: string; probability: number }[]): string[] {
  const tagMap: Record<string, string> = {
    'backpack': 'Backpack',
    'bag': 'Bag',
    'handbag': 'Handbag',
    'purse': 'Purse',
    'wallet': 'Wallet',
    'water_bottle': 'Water Bottle',
    'bottle': 'Bottle',
    'cell_phone': 'Phone',
    'cellular_telephone': 'Phone',
    'mobile_phone': 'Phone',
    'ipod': 'Electronics',
    'laptop': 'Laptop',
    'notebook': 'Notebook',
    'computer': 'Electronics',
    'sunglasses': 'Sunglasses',
    'glasses': 'Glasses',
    'watch': 'Watch',
    'umbrella': 'Umbrella',
    'jacket': 'Jacket',
    'coat': 'Coat',
    'sweatshirt': 'Sweatshirt',
    'hoodie': 'Hoodie',
    'jersey': 'Jersey',
    'shirt': 'Shirt',
    'shoe': 'Shoe',
    'sneaker': 'Sneaker',
    'running_shoe': 'Running Shoe',
    'book': 'Book',
    'binder': 'Binder',
    'pencil_case': 'Pencil Case',
    'calculator': 'Calculator',
    'headphone': 'Headphones',
    'earphone': 'Earbuds',
    'key': 'Keys',
    'keychain': 'Keychain',
    'sports': 'Sports Equipment',
    'ball': 'Ball',
    'cap': 'Cap/Hat',
    'hat': 'Hat',
  }

  const tags: string[] = []

  for (const pred of predictions) {
    const className = pred.className.toLowerCase().replace(/[_\s]+/g, '_')

    // Check for direct matches
    for (const [key, value] of Object.entries(tagMap)) {
      if (className.includes(key) && pred.probability > 0.1) {
        if (!tags.includes(value)) {
          tags.push(value)
        }
      }
    }
  }

  return tags.slice(0, 5)
}

// Main analysis function
export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
  const result: ImageAnalysisResult = {
    tags: [],
    objects: [],
    colors: [],
    detectedText: [],
    confidence: 0
  }

  try {
    // Convert file to image element
    const img = await fileToImage(file)

    // Run all analyses in parallel
    const [classifications, objects, extractedText] = await Promise.all([
      classifyImage(img),
      detectObjects(img),
      extractText(file)
    ])

    // Process MobileNet classifications
    const mobilenetTags = mapToFriendlyTags(classifications)
    result.tags.push(...mobilenetTags)

    // Process COCO-SSD detections
    const objectTags = objects
      .filter(obj => obj.score > 0.3)
      .map(obj => obj.class.charAt(0).toUpperCase() + obj.class.slice(1))
    result.objects = Array.from(new Set(objectTags))

    // Add object tags to main tags
    result.tags.push(...result.objects.filter(t => !result.tags.includes(t)))

    // Extract colors
    result.colors = extractColors(img)

    // Add detected text
    result.detectedText = extractedText

    // Calculate overall confidence
    const avgConfidence = classifications.length > 0
      ? classifications.reduce((sum, p) => sum + p.probability, 0) / classifications.length
      : 0
    result.confidence = Math.round(avgConfidence * 100)

    // Deduplicate tags
    result.tags = Array.from(new Set(result.tags)).slice(0, 8)

  } catch (error) {
    console.error('Image analysis error:', error)
  }

  return result
}

// Quick analysis - just colors and basic detection (faster)
export async function quickAnalyze(file: File): Promise<{ colors: string[]; objects: string[] }> {
  try {
    const img = await fileToImage(file)
    const colors = extractColors(img)

    // Quick object detection only
    const objects = await detectObjects(img)
    const objectTags = objects
      .filter(obj => obj.score > 0.4)
      .map(obj => obj.class.charAt(0).toUpperCase() + obj.class.slice(1))
      .slice(0, 3)

    return { colors, objects: Array.from(new Set(objectTags)) }
  } catch (error) {
    console.error('Quick analysis error:', error)
    return { colors: [], objects: [] }
  }
}
