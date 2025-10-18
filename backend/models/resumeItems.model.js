import query from "../db/index.js"
import crypto from "crypto"

// Get all resume items for a user
const getUserResumeItems = async (userId) => {
  try {
    const results = await query(
      `SELECT id, user_id, item_type, title, organization, description, location,
              employment_type, technologies, github_url, demo_url,
              start_date, end_date, is_current, source_pdf_id, created_at, updated_at
       FROM resume_items
       WHERE user_id = $1
       ORDER BY start_date DESC NULLS LAST, created_at DESC`,
      [userId]
    )
    return results.rows
  } catch (error) {
    console.error("Error fetching user resume items:", error.message)
    throw new Error("DB error while fetching resume items.")
  }
}

// Get resume items by type (experience or project)
const getUserResumeItemsByType = async (userId, itemType) => {
  try {
    const results = await query(
      `SELECT id, user_id, item_type, title, organization, description, location,
              employment_type, technologies, github_url, demo_url,
              start_date, end_date, is_current, source_pdf_id, created_at, updated_at
       FROM resume_items
       WHERE user_id = $1 AND item_type = $2
       ORDER BY start_date DESC NULLS LAST, created_at DESC`,
      [userId, itemType]
    )
    return results.rows
  } catch (error) {
    console.error("Error fetching user resume items by type:", error.message)
    throw new Error("DB error while fetching resume items by type.")
  }
}

// Get a single resume item by ID
const getResumeItemById = async (itemId, userId) => {
  try {
    const results = await query(
      `SELECT id, user_id, item_type, title, organization, description, location,
              employment_type, technologies, github_url, demo_url,
              start_date, end_date, is_current, source_pdf_id, created_at, updated_at
       FROM resume_items
       WHERE id = $1 AND user_id = $2`,
      [itemId, userId]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching resume item by ID:", error.message)
    throw new Error("DB error while fetching resume item.")
  }
}

// Create a new resume item
const createResumeItem = async (userId, itemData) => {
  try {
    const {
      item_type,
      title,
      organization,
      description,
      location,
      employment_type,
      technologies,
      github_url,
      demo_url,
      start_date,
      end_date,
      is_current
    } = itemData
    
    const itemId = crypto.randomUUID()

    const results = await query(
      `INSERT INTO resume_items(
        id, user_id, item_type, title, organization, description, location,
        employment_type, technologies, github_url, demo_url,
        start_date, end_date, is_current
      )
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, user_id, item_type, title, organization, description, location,
                 employment_type, technologies, github_url, demo_url,
                 start_date, end_date, is_current, created_at, updated_at`,
      [
        itemId, userId, item_type, title,
        organization || null,
        description || null,
        location || null,
        employment_type || null,
        technologies || null,
        github_url || null,
        demo_url || null,
        start_date || null,
        end_date || null,
        is_current || false
      ]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to create resume item.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error creating resume item:", error.message)
    throw new Error("DB error while creating resume item.")
  }
}

// Update a resume item (supports partial updates)
const updateResumeItem = async (itemId, userId, itemData) => {
  try {
    // Build dynamic SET clause for only the fields that are provided
    const updates = []
    const values = [itemId, userId]
    let paramCount = 2

    // Map of field names to their database column names
    const fieldMap = {
      item_type: 'item_type',
      title: 'title',
      organization: 'organization',
      description: 'description',
      location: 'location',
      employment_type: 'employment_type',
      technologies: 'technologies',
      github_url: 'github_url',
      demo_url: 'demo_url',
      start_date: 'start_date',
      end_date: 'end_date',
      is_current: 'is_current'
    }

    // Build the SET clause dynamically
    for (const [key, dbColumn] of Object.entries(fieldMap)) {
      if (itemData.hasOwnProperty(key)) {
        paramCount++
        updates.push(`${dbColumn} = $${paramCount}`)
        values.push(itemData[key] === '' ? null : itemData[key])
      }
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = now()')

    if (updates.length === 1) { // Only updated_at
      throw new Error("No fields provided to update.")
    }

    const sql = `UPDATE resume_items
       SET ${updates.join(', ')}
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, item_type, title, organization, description, location,
                 employment_type, technologies, github_url, demo_url,
                 start_date, end_date, is_current, created_at, updated_at`

    const results = await query(sql, values)

    if (results.rows.length === 0) {
      throw new Error("Resume item not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error updating resume item:", error.message)
    throw new Error("DB error while updating resume item.")
  }
}

// Delete a resume item
const deleteResumeItem = async (itemId, userId) => {
  try {
    const results = await query(
      `DELETE FROM resume_items
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [itemId, userId]
    )

    if (results.rows.length === 0) {
      throw new Error("Resume item not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error deleting resume item:", error.message)
    throw new Error("DB error while deleting resume item.")
  }
}

export default {
  getUserResumeItems,
  getUserResumeItemsByType,
  getResumeItemById,
  createResumeItem,
  updateResumeItem,
  deleteResumeItem
}

