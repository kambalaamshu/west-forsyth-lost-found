import { Item, getAllItems } from './sqlite'

export interface SearchData {
  tags: string[]
  colors: string[]
  category: string
  description?: string
}

export interface MatchResult {
  item: Item
  score: number
  tagMatches: string[]
  colorMatch: boolean
  categoryMatch: boolean
}

/**
 * Calculate match score between search data and a found item
 * Scoring weights:
 * - AI tags overlap: 50%
 * - Color match: 25%
 * - Category match: 25%
 */
export function calculateMatchScore(searchData: SearchData, item: Item): {
  score: number
  tagMatches: string[]
  colorMatch: boolean
  categoryMatch: boolean
} {
  let score = 0
  let tagMatches: string[] = []
  let colorMatch = false
  let categoryMatch = false

  // Parse item's AI tags
  const itemTags = parseItemTags(item.ai_tags)

  // Tag overlap (50% weight)
  const searchTags = searchData.tags || []
  if (searchTags.length > 0 && itemTags.length > 0) {
    tagMatches = findTagMatches(searchTags, itemTags)
    const tagOverlapRatio = tagMatches.length / Math.max(searchTags.length, 1)
    score += tagOverlapRatio * 50
  }

  // Color match (25% weight)
  const searchColors = searchData.colors || []
  const itemColor = item.color?.toLowerCase() || ''

  if (searchColors.length > 0 && itemColor) {
    for (const searchColor of searchColors) {
      const normalizedSearchColor = searchColor.toLowerCase()
      // Check for exact match or partial match
      if (itemColor.includes(normalizedSearchColor) ||
          normalizedSearchColor.includes(itemColor.split('/')[0]) ||
          normalizedSearchColor.includes(itemColor.split(',')[0].trim())) {
        colorMatch = true
        score += 25
        break
      }
    }
  }

  // Category match (25% weight)
  if (searchData.category && item.category) {
    if (searchData.category.toLowerCase() === item.category.toLowerCase()) {
      categoryMatch = true
      score += 25
    }
  }

  // Bonus: Check description overlap if provided
  if (searchData.description && item.description) {
    const descriptionScore = calculateDescriptionSimilarity(
      searchData.description,
      item.description
    )
    // Add up to 10 bonus points for description match
    score += descriptionScore * 10
  }

  // Cap score at 100
  score = Math.min(Math.round(score), 100)

  return { score, tagMatches, colorMatch, categoryMatch }
}

/**
 * Parse AI tags from JSON string or comma-separated string
 */
function parseItemTags(aiTags: string | null): string[] {
  if (!aiTags) return []

  // Try parsing as JSON array
  try {
    const parsed = JSON.parse(aiTags)
    if (Array.isArray(parsed)) {
      return parsed.map(t => String(t).toLowerCase())
    }
  } catch {
    // Not JSON, treat as comma-separated
  }

  // Treat as comma-separated string
  return aiTags
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0)
}

/**
 * Find matching tags between search tags and item tags
 */
function findTagMatches(searchTags: string[], itemTags: string[]): string[] {
  const matches: string[] = []

  for (const searchTag of searchTags) {
    const normalizedSearch = searchTag.toLowerCase()
    for (const itemTag of itemTags) {
      // Check for exact match or partial match
      if (
        itemTag.includes(normalizedSearch) ||
        normalizedSearch.includes(itemTag) ||
        levenshteinSimilarity(normalizedSearch, itemTag) > 0.7
      ) {
        if (!matches.includes(searchTag)) {
          matches.push(searchTag)
        }
        break
      }
    }
  }

  return matches
}

/**
 * Calculate similarity between two descriptions using word overlap
 */
function calculateDescriptionSimilarity(desc1: string, desc2: string): number {
  const words1 = extractSignificantWords(desc1)
  const words2 = extractSignificantWords(desc2)

  if (words1.length === 0 || words2.length === 0) return 0

  const matches = words1.filter(w1 =>
    words2.some(w2 => w1 === w2 || levenshteinSimilarity(w1, w2) > 0.8)
  )

  return matches.length / Math.max(words1.length, words2.length)
}

/**
 * Extract significant words from text (ignore common words)
 */
function extractSignificantWords(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'it', 'to', 'of', 'and', 'or', 'in', 'on', 'at',
    'for', 'with', 'my', 'was', 'has', 'have', 'had', 'be', 'been', 'being',
    'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they', 'he', 'she',
    'found', 'lost', 'item', 'near', 'from', 'by', 'inside', 'outside'
  ])

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
}

/**
 * Calculate Levenshtein similarity between two strings (0-1)
 */
function levenshteinSimilarity(s1: string, s2: string): number {
  const len1 = s1.length
  const len2 = s2.length

  if (len1 === 0 && len2 === 0) return 1
  if (len1 === 0 || len2 === 0) return 0

  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  const distance = matrix[len1][len2]
  return 1 - distance / Math.max(len1, len2)
}

/**
 * Find potential matches for lost item search
 * @param searchData - Analysis results from the uploaded image
 * @param minScore - Minimum match score threshold (default: 30)
 * @returns Array of matched items sorted by score
 */
export function findMatches(
  searchData: SearchData,
  minScore: number = 30
): MatchResult[] {
  // Get all active items
  const items = getAllItems('active')

  const results: MatchResult[] = []

  for (const item of items) {
    const { score, tagMatches, colorMatch, categoryMatch } = calculateMatchScore(
      searchData,
      item
    )

    if (score >= minScore) {
      results.push({
        item,
        score,
        tagMatches,
        colorMatch,
        categoryMatch
      })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  return results
}

/**
 * Get match quality label based on score
 */
export function getMatchQuality(score: number): {
  label: string
  color: string
} {
  if (score >= 75) {
    return { label: 'Excellent Match', color: 'green' }
  }
  if (score >= 50) {
    return { label: 'Good Match', color: 'gold' }
  }
  if (score >= 30) {
    return { label: 'Possible Match', color: 'orange' }
  }
  return { label: 'Low Match', color: 'gray' }
}
