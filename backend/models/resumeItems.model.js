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

// Update a resume item
const updateResumeItem = async (itemId, userId, itemData) => {
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

    const results = await query(
      `UPDATE resume_items
       SET item_type = $3,
           title = $4,
           organization = $5,
           description = $6,
           location = $7,
           employment_type = $8,
           technologies = $9,
           github_url = $10,
           demo_url = $11,
           start_date = $12,
           end_date = $13,
           is_current = $14,
           updated_at = now()
       WHERE id = $1 AND user_id = $2
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

