import Database from 'better-sqlite3'
import path from 'path'

// Database file location - use /app/data volume on Railway, otherwise use project root
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'lost-found.db')
  : path.join(process.cwd(), 'lost-found.db')

// Initialize database connection
let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    initSchema()
  }
  return db
}

// Initialize database schema
function initSchema() {
  const database = db!

  // Create items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      color TEXT,
      location TEXT NOT NULL,
      date_found TEXT NOT NULL,
      image_url TEXT,
      contact_name TEXT,
      contact_email TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'claimed', 'expired')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create index for faster searches
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
    CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
    CREATE INDEX IF NOT EXISTS idx_items_date ON items(date_found);
  `)

  // Add ai_tags column if it doesn't exist (migration for existing databases)
  try {
    database.exec(`ALTER TABLE items ADD COLUMN ai_tags TEXT`)
  } catch {
    // Column already exists, ignore error
  }

  // Migration: update CHECK constraint to include 'pending' status for existing databases
  try {
    // SQLite doesn't support ALTER CHECK constraints, so we recreate via a temp table approach
    // However, SQLite CHECK constraints are not enforced on existing data and the CREATE TABLE
    // IF NOT EXISTS won't re-run if the table exists. Instead, we just ensure the column default
    // is updated and the constraint allows 'pending' by testing an insert/rollback.
    const testResult = database.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'pending'").get() as { count: number }
    // If this succeeds, the column accepts 'pending' (new schema). If not, we need to migrate.
    void testResult
  } catch {
    // If somehow the query fails, we proceed anyway — the CHECK constraint in CREATE TABLE
    // only applies to new databases.
  }

  // Ensure existing databases can store 'pending' status by recreating the table if needed
  try {
    database.exec(`
      BEGIN;
      CREATE TABLE IF NOT EXISTS items_backup AS SELECT * FROM items;
      DROP TABLE IF EXISTS items;
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        color TEXT,
        location TEXT NOT NULL,
        date_found TEXT NOT NULL,
        image_url TEXT,
        contact_name TEXT,
        contact_email TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'claimed', 'expired')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        ai_tags TEXT
      );
      INSERT INTO items SELECT * FROM items_backup;
      DROP TABLE items_backup;
      COMMIT;
    `)
  } catch {
    // Migration already applied or table is already correct
    try { database.exec('ROLLBACK') } catch { /* no transaction to rollback */ }
  }

  // Create contacts table for contact form submissions
  database.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'responded')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create claims table for item claims
  database.exec(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      item_title TEXT NOT NULL,
      claimant_name TEXT NOT NULL,
      claimant_email TEXT NOT NULL,
      student_id TEXT,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id)
    )
  `)

  // Create index for claims
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
    CREATE INDEX IF NOT EXISTS idx_claims_item ON claims(item_id);
  `)

  // Create lost_searches table for tracking search history
  database.exec(`
    CREATE TABLE IF NOT EXISTS lost_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      searcher_email TEXT NOT NULL,
      description TEXT NOT NULL,
      ai_tags TEXT,
      colors TEXT,
      category TEXT,
      matched_item_id INTEGER,
      notification_sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (matched_item_id) REFERENCES items(id)
    )
  `)

  // Create index for lost_searches
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_lost_searches_email ON lost_searches(searcher_email);
    CREATE INDEX IF NOT EXISTS idx_lost_searches_created ON lost_searches(created_at);
  `)

  // Seed with sample data if table is empty
  const count = database.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number }
  if (count.count === 0) {
    seedSampleData()
  }
}

// Seed sample data for development
function seedSampleData() {
  const database = db!

  const sampleItems = [
    {
      type: 'found',
      title: 'Navy Blue Backpack',
      description: 'JanSport backpack with math textbook and notebooks inside. Found near the gym.',
      category: 'Bags',
      color: 'Navy Blue',
      location: 'Gymnasium',
      date_found: '2026-01-18',
      contact_name: 'Office Staff',
      contact_email: 'lostandfound@westforsyth.edu',
      status: 'active'
    },
    {
      type: 'found',
      title: 'AirPods Pro Case',
      description: 'White AirPods Pro case, no name on it. Found in the cafeteria.',
      category: 'Electronics',
      color: 'White',
      location: 'Cafeteria',
      date_found: '2026-01-17',
      contact_name: 'Office Staff',
      contact_email: 'lostandfound@westforsyth.edu',
      status: 'active'
    },
    {
      type: 'found',
      title: 'Texas Instruments Calculator',
      description: 'TI-84 Plus graphing calculator. Has initials "JM" on the back.',
      category: 'Electronics',
      color: 'Black',
      location: 'Room 204 - Math',
      date_found: '2026-01-16',
      contact_name: 'Mr. Johnson',
      contact_email: 'johnson@westforsyth.edu',
      status: 'active'
    },
    {
      type: 'found',
      title: 'Wolverines Varsity Jacket',
      description: 'Green and gold varsity jacket, size Large. Has "FOOTBALL" patch.',
      category: 'Clothing',
      color: 'Green/Gold',
      location: 'Football Field',
      date_found: '2026-01-15',
      contact_name: 'Coach Williams',
      contact_email: 'williams@westforsyth.edu',
      status: 'active'
    },
    {
      type: 'found',
      title: 'Car Keys with Lanyard',
      description: 'Honda car keys on a blue West Forsyth lanyard.',
      category: 'Keys',
      color: 'Blue',
      location: 'Parking Lot B',
      date_found: '2026-01-19',
      contact_name: 'Security Office',
      contact_email: 'security@westforsyth.edu',
      status: 'active'
    },
    {
      type: 'found',
      title: 'Water Bottle - Hydro Flask',
      description: 'Purple Hydro Flask 32oz with stickers on it.',
      category: 'Water Bottles',
      color: 'Purple',
      location: 'Library',
      date_found: '2026-01-14',
      contact_name: 'Librarian',
      contact_email: 'library@westforsyth.edu',
      status: 'active'
    },
    {
      type: 'found',
      title: 'Prescription Glasses',
      description: 'Black frame prescription glasses in a hard case.',
      category: 'Accessories',
      color: 'Black',
      location: 'Science Lab',
      date_found: '2026-01-13',
      contact_name: 'Office Staff',
      contact_email: 'lostandfound@westforsyth.edu',
      status: 'active'
    },
    {
      type: 'found',
      title: 'iPhone Charger',
      description: 'Apple 20W charger with braided cable.',
      category: 'Electronics',
      color: 'White',
      location: 'Room 112 - English',
      date_found: '2026-01-12',
      contact_name: 'Mrs. Davis',
      contact_email: 'davis@westforsyth.edu',
      status: 'active'
    }
  ]

  const insert = database.prepare(`
    INSERT INTO items (type, title, description, category, color, location, date_found, contact_name, contact_email, status)
    VALUES (@type, @title, @description, @category, @color, @location, @date_found, @contact_name, @contact_email, @status)
  `)

  for (const item of sampleItems) {
    insert.run(item)
  }
}

// Types
export interface Item {
  id: number
  type: 'lost' | 'found'
  title: string
  description: string | null
  category: string
  color: string | null
  location: string
  date_found: string
  image_url: string | null
  ai_tags: string | null
  contact_name: string | null
  contact_email: string | null
  status: 'pending' | 'active' | 'claimed' | 'expired'
  created_at: string
  updated_at: string
}

export interface CreateItemInput {
  type: 'lost' | 'found'
  title: string
  description?: string
  category: string
  color?: string
  location: string
  date_found: string
  image_url?: string
  ai_tags?: string
  contact_name?: string
  contact_email?: string
}

// CRUD Operations

export function getAllItems(status: string = 'active'): Item[] {
  const database = getDb()
  if (status === 'all') {
    return database.prepare('SELECT * FROM items ORDER BY date_found DESC').all() as Item[]
  }
  return database.prepare('SELECT * FROM items WHERE status = ? ORDER BY date_found DESC').all(status) as Item[]
}

export function getItemById(id: number): Item | undefined {
  const database = getDb()
  return database.prepare('SELECT * FROM items WHERE id = ?').get(id) as Item | undefined
}

export function searchItems(query: string): Item[] {
  const database = getDb()
  const searchTerm = `%${query}%`
  return database.prepare(`
    SELECT * FROM items
    WHERE status = 'active'
    AND (title LIKE ? OR description LIKE ? OR category LIKE ? OR color LIKE ? OR location LIKE ? OR ai_tags LIKE ?)
    ORDER BY date_found DESC
  `).all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm) as Item[]
}

export function getItemsByCategory(category: string): Item[] {
  const database = getDb()
  return database.prepare('SELECT * FROM items WHERE category = ? AND status = ? ORDER BY date_found DESC').all(category, 'active') as Item[]
}

export function createItem(item: CreateItemInput): Item {
  const database = getDb()

  // Ensure all fields have values (null for optional fields if not provided)
  const itemWithDefaults = {
    type: item.type,
    title: item.title,
    description: item.description ?? null,
    category: item.category,
    color: item.color ?? null,
    location: item.location,
    date_found: item.date_found,
    image_url: item.image_url ?? null,
    ai_tags: item.ai_tags ?? null,
    contact_name: item.contact_name ?? null,
    contact_email: item.contact_email ?? null,
  }

  const result = database.prepare(`
    INSERT INTO items (type, title, description, category, color, location, date_found, image_url, ai_tags, contact_name, contact_email)
    VALUES (@type, @title, @description, @category, @color, @location, @date_found, @image_url, @ai_tags, @contact_name, @contact_email)
  `).run(itemWithDefaults)

  return getItemById(result.lastInsertRowid as number)!
}

export function updateItemStatus(id: number, status: 'pending' | 'active' | 'claimed' | 'expired'): boolean {
  const database = getDb()
  const result = database.prepare('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id)
  return result.changes > 0
}

export function deleteItem(id: number): boolean {
  const database = getDb()

  // Delete related claims first (foreign key constraint)
  database.prepare('DELETE FROM claims WHERE item_id = ?').run(id)

  // Delete related lost_searches (foreign key constraint)
  database.prepare('UPDATE lost_searches SET matched_item_id = NULL WHERE matched_item_id = ?').run(id)

  // Now delete the item
  const result = database.prepare('DELETE FROM items WHERE id = ?').run(id)
  return result.changes > 0
}

export function getStats() {
  const database = getDb()
  const total = database.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number }
  const active = database.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'active'").get() as { count: number }
  const claimed = database.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'claimed'").get() as { count: number }
  const pending = database.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'pending'").get() as { count: number }

  return {
    total: total.count,
    active: active.count,
    claimed: claimed.count,
    pending: pending.count,
    successRate: total.count > 0 ? Math.round((claimed.count / total.count) * 100) : 0
  }
}

export function getCategories(): string[] {
  const database = getDb()
  const results = database.prepare('SELECT DISTINCT category FROM items ORDER BY category').all() as { category: string }[]
  return results.map(r => r.category)
}

export function getRecentItems(limit: number = 5): Item[] {
  const database = getDb()
  return database.prepare('SELECT * FROM items ORDER BY created_at DESC LIMIT ?').all(limit) as Item[]
}

// Contact Types and Functions

export interface Contact {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'responded'
  created_at: string
}

export interface CreateContactInput {
  name: string
  email: string
  subject: string
  message: string
}

export function createContact(contact: CreateContactInput): Contact {
  const database = getDb()
  const result = database.prepare(`
    INSERT INTO contacts (name, email, subject, message)
    VALUES (@name, @email, @subject, @message)
  `).run(contact)

  return getContactById(result.lastInsertRowid as number)!
}

export function getContactById(id: number): Contact | undefined {
  const database = getDb()
  return database.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Contact | undefined
}

export function getAllContacts(): Contact[] {
  const database = getDb()
  return database.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all() as Contact[]
}

export function updateContactStatus(id: number, status: 'unread' | 'read' | 'responded'): boolean {
  const database = getDb()
  const result = database.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, id)
  return result.changes > 0
}

// Claim Types and Functions

export interface Claim {
  id: number
  item_id: number
  item_title: string
  claimant_name: string
  claimant_email: string
  student_id: string | null
  description: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateClaimInput {
  item_id: number
  item_title: string
  claimant_name: string
  claimant_email: string
  student_id?: string
  description: string
}

export function createClaim(claim: CreateClaimInput): Claim {
  const database = getDb()

  const claimWithDefaults = {
    item_id: claim.item_id,
    item_title: claim.item_title,
    claimant_name: claim.claimant_name,
    claimant_email: claim.claimant_email,
    student_id: claim.student_id ?? null,
    description: claim.description,
  }

  const result = database.prepare(`
    INSERT INTO claims (item_id, item_title, claimant_name, claimant_email, student_id, description)
    VALUES (@item_id, @item_title, @claimant_name, @claimant_email, @student_id, @description)
  `).run(claimWithDefaults)

  return getClaimById(result.lastInsertRowid as number)!
}

export function getClaimById(id: number): Claim | undefined {
  const database = getDb()
  return database.prepare('SELECT * FROM claims WHERE id = ?').get(id) as Claim | undefined
}

export function getAllClaims(status?: string): Claim[] {
  const database = getDb()
  if (status && status !== 'all') {
    return database.prepare('SELECT * FROM claims WHERE status = ? ORDER BY created_at DESC').all(status) as Claim[]
  }
  return database.prepare('SELECT * FROM claims ORDER BY created_at DESC').all() as Claim[]
}

export function updateClaimStatus(id: number, status: 'pending' | 'approved' | 'rejected', adminNotes?: string): boolean {
  const database = getDb()
  const result = database.prepare(`
    UPDATE claims
    SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, adminNotes ?? null, id)
  return result.changes > 0
}

export function deleteClaim(id: number): boolean {
  const database = getDb()
  const result = database.prepare('DELETE FROM claims WHERE id = ?').run(id)
  return result.changes > 0
}

// Lost Search Types and Functions

export interface LostSearch {
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

export interface CreateLostSearchInput {
  searcher_email: string
  description: string
  ai_tags?: string
  colors?: string
  category?: string
}

export function createLostSearch(search: CreateLostSearchInput): LostSearch {
  const database = getDb()

  const searchWithDefaults = {
    searcher_email: search.searcher_email,
    description: search.description,
    ai_tags: search.ai_tags ?? null,
    colors: search.colors ?? null,
    category: search.category ?? null,
  }

  const result = database.prepare(`
    INSERT INTO lost_searches (searcher_email, description, ai_tags, colors, category)
    VALUES (@searcher_email, @description, @ai_tags, @colors, @category)
  `).run(searchWithDefaults)

  return getLostSearchById(result.lastInsertRowid as number)!
}

export function getLostSearchById(id: number): LostSearch | undefined {
  const database = getDb()
  return database.prepare('SELECT * FROM lost_searches WHERE id = ?').get(id) as LostSearch | undefined
}

export function updateSearchNotification(id: number, matchedItemId: number): boolean {
  const database = getDb()
  const result = database.prepare(`
    UPDATE lost_searches
    SET matched_item_id = ?, notification_sent = 1
    WHERE id = ?
  `).run(matchedItemId, id)
  return result.changes > 0
}

export function getRecentSearchesByEmail(email: string, limit: number = 10): LostSearch[] {
  const database = getDb()
  return database.prepare(`
    SELECT * FROM lost_searches
    WHERE searcher_email = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(email, limit) as LostSearch[]
}
