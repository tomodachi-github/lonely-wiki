import { Database } from './init.js'

let dbInstance = null

export async function initializeDatabase() {
  if (!dbInstance) {
    dbInstance = new Database()
    await dbInstance.init()
  }
  return dbInstance
}

export function getDatabase() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return dbInstance
}
