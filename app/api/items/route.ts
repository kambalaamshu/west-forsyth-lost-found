import { NextRequest, NextResponse } from 'next/server'
import { getAllItems, createItem, type CreateItemInput } from '@/lib/sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'

    const items = getAllItems(status)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateItemInput = await request.json()

    // Validate required fields
    if (!body.title || !body.category || !body.location || !body.date_found || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, location, date_found, type' },
        { status: 400 }
      )
    }

    const item = createItem(body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
