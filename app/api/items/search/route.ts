import { NextRequest, NextResponse } from 'next/server'
import { searchItems, getItemsByCategory } from '@/lib/sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')

    let items

    if (category) {
      items = getItemsByCategory(category)
    } else if (query) {
      items = searchItems(query)
    } else {
      return NextResponse.json({ error: 'Provide either q or category parameter' }, { status: 400 })
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error searching items:', error)
    return NextResponse.json({ error: 'Failed to search items' }, { status: 500 })
  }
}
