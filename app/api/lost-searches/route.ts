import { NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'lost-found.db')

interface LostSearch {
  id: number
  searcher_email: string
  description: string
  ai_tags: string | null
  colors: string | null
  category: string | null
  matched_item_id: number | null
  notification_sent: number
  created_at: string
}

export async function GET() {
  try {
    const db = new Database(dbPath)
    db.pragma('journal_mode = WAL')

    const searches = db.prepare(`
      SELECT * FROM lost_searches
      ORDER BY created_at DESC
    `).all() as LostSearch[]

    db.close()

    return NextResponse.json(searches)
  } catch (error) {
    console.error('Failed to fetch lost searches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lost searches' },
      { status: 500 }
    )
  }
}
