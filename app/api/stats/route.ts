import { NextResponse } from 'next/server'
import { getStats, getCategories, getRecentItems } from '@/lib/sqlite'

export async function GET() {
  try {
    const stats = getStats()
    const categories = getCategories()
    const recentItems = getRecentItems(5)

    return NextResponse.json({
      ...stats,
      categories,
      recentItems
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
