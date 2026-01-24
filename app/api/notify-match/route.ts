import { NextRequest, NextResponse } from 'next/server'
import { getItemById, updateSearchNotification, getLostSearchById, createClaim } from '@/lib/sqlite'
import { sendMatchNotification, isEmailConfigured } from '@/lib/email'

interface NotifyMatchRequest {
  searchId: number
  itemId: number
  email: string
  description: string
  claimerName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: NotifyMatchRequest = await request.json()

    // Validate required fields
    if (!body.itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

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

    // Get the item
    const item = getItemById(body.itemId)
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if item is still active
    if (item.status !== 'active') {
      return NextResponse.json(
        { error: 'This item is no longer available' },
        { status: 400 }
      )
    }

    // Get the base URL for claim link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                    'http://localhost:3000'

    // Create claim URL
    const claimUrl = `${baseUrl}/browse?claim=${item.id}`

    // Calculate a confidence score (we'll use the score passed in query or estimate)
    const confidenceScore = 75 // Default confidence for "This is my item!" clicks

    // Try to send email notification
    let emailSent = false
    if (isEmailConfigured()) {
      emailSent = await sendMatchNotification({
        toEmail: body.email,
        searcherName: body.claimerName,
        lostItemDescription: body.description,
        matchedItem: {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          color: item.color,
          location: item.location,
          date_found: item.date_found,
          image_url: item.image_url
        },
        confidenceScore,
        claimUrl
      })
    }

    // Update search record if searchId provided
    if (body.searchId) {
      const search = getLostSearchById(body.searchId)
      if (search) {
        updateSearchNotification(body.searchId, body.itemId)
      }
    }

    // Create a pending claim for tracking
    const claim = createClaim({
      item_id: item.id,
      item_title: item.title,
      claimant_name: body.claimerName || 'Anonymous',
      claimant_email: body.email,
      description: `User found via search: ${body.description}`
    })

    return NextResponse.json({
      success: true,
      emailSent,
      claimId: claim.id,
      claimUrl,
      message: emailSent
        ? 'Email notification sent! Check your inbox for next steps.'
        : 'Your claim has been recorded. Please visit the Lost & Found office to complete your claim.',
      warning: !isEmailConfigured()
        ? 'Email service not configured. Please visit the Lost & Found office directly.'
        : undefined
    })

  } catch (error) {
    console.error('Notify match error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
