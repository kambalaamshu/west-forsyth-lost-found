import { NextRequest, NextResponse } from 'next/server'
import { getAllClaims, createClaim, type CreateClaimInput } from '@/lib/sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const claims = getAllClaims(status)
    return NextResponse.json(claims)
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateClaimInput = await request.json()

    // Validate required fields
    if (!body.item_id || !body.item_title || !body.claimant_name || !body.claimant_email || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: item_id, item_title, claimant_name, claimant_email, description' },
        { status: 400 }
      )
    }

    const claim = createClaim(body)
    return NextResponse.json(claim, { status: 201 })
  } catch (error) {
    console.error('Error creating claim:', error)
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
  }
}
