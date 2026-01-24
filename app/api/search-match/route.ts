import { NextRequest, NextResponse } from 'next/server'
import { findMatches, SearchData, MatchResult, getMatchQuality } from '@/lib/matcher'
import { createLostSearch } from '@/lib/sqlite'

interface SearchMatchRequest {
  tags: string[]
  colors: string[]
  category: string
  description: string
  email: string
}

interface MatchResponse {
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

export async function POST(request: NextRequest) {
  try {
    const body: SearchMatchRequest = await request.json()

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!body.description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Validate email format (school email preferred but not required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Prepare search data
    const searchData: SearchData = {
      tags: body.tags || [],
      colors: body.colors || [],
      category: body.category || '',
      description: body.description
    }

    // Record the search in database
    const lostSearch = createLostSearch({
      searcher_email: body.email,
      description: body.description,
      ai_tags: JSON.stringify(body.tags || []),
      colors: JSON.stringify(body.colors || []),
      category: body.category || undefined
    })

    // Find potential matches
    const matches: MatchResult[] = findMatches(searchData, 25) // Lower threshold for more results

    // Format response
    const matchedItems: MatchResponse[] = matches.map(match => ({
      id: match.item.id,
      title: match.item.title,
      description: match.item.description,
      category: match.item.category,
      color: match.item.color,
      location: match.item.location,
      date_found: match.item.date_found,
      image_url: match.item.image_url,
      score: match.score,
      quality: getMatchQuality(match.score),
      tagMatches: match.tagMatches,
      colorMatch: match.colorMatch,
      categoryMatch: match.categoryMatch
    }))

    return NextResponse.json({
      success: true,
      searchId: lostSearch.id,
      matchCount: matchedItems.length,
      matches: matchedItems
    })

  } catch (error) {
    console.error('Search match error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search for matches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
