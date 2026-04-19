#!/usr/bin/env node
/**
 * Migration script to add layout_style column to existing SQLite databases
 *
 * Usage:
 *   node scripts/migrate-sqlite-layout-style.js
 *
 * This script safely adds the layout_style column to the user_settings table
 * for existing installations.
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'svlink.db')

console.log('[Migration] Starting layout_style column migration...')
console.log(`[Migration] Database path: ${dbPath}`)

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log('[Migration] No existing database found. Migration not needed.')
  console.log('[Migration] The layout_style column will be added automatically when the database is created.')
  process.exit(0)
}

const db = new Database(dbPath)

try {
  // Check if layout_style column already exists
  const tableInfo = db.prepare("PRAGMA table_info(user_settings)").all()
  const hasLayoutStyle = tableInfo.some(col => col.name === 'layout_style')

  if (hasLayoutStyle) {
    console.log('[Migration] layout_style column already exists. Migration not needed.')
    process.exit(0)
  }

  // Add layout_style column with default value 'list'
  console.log('[Migration] Adding layout_style column to user_settings table...')
  db.exec("ALTER TABLE user_settings ADD COLUMN layout_style TEXT DEFAULT 'list'")

  console.log('[Migration] Layout style column added successfully!')
  console.log('[Migration] All existing users will default to "list" layout.')
  console.log('[Migration] Migration completed successfully!')
  process.exit(0)
} catch (error) {
  console.error('[Migration] Error during migration:', error)
  process.exit(1)
} finally {
  db.close()
}
