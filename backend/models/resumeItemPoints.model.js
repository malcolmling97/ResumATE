import query from "../db/index.js"
import crypto from "crypto"

// Get all bullet points for a resume item
const getResumeItemPoints = async (resumeItemId, userId) => {
  try {
    const results = await query(
      `SELECT rip.id, rip.resume_item_id, rip.user_id, rip.content, 
              rip.display_order, rip.usage_count, rip.created_at, rip.updated_at
       FROM resume_item_points rip
       INNER JOIN resume_items ri ON rip.resume_item_id = ri.id
       WHERE rip.resume_item_id = $1 AND rip.user_id = $2
       ORDER BY rip.display_order ASC, rip.created_at ASC`,
      [resumeItemId, userId]
    )
    return results.rows
  } catch (error) {
    console.error("Error fetching resume item points:", error.message)
    throw new Error("DB error while fetching resume item points.")
  }
}

// Get a single bullet point by ID
const getResumeItemPointById = async (pointId, userId) => {
  try {
    const results = await query(
      `SELECT rip.id, rip.resume_item_id, rip.user_id, rip.content,
              rip.display_order, rip.usage_count, rip.created_at, rip.updated_at
       FROM resume_item_points rip
       INNER JOIN resume_items ri ON rip.resume_item_id = ri.id
       WHERE rip.id = $1 AND rip.user_id = $2`,
      [pointId, userId]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching resume item point by ID:", error.message)
    throw new Error("DB error while fetching resume item point.")
  }
}

// Create a new bullet point
const createResumeItemPoint = async (userId, pointData) => {
  try {
    const { resume_item_id, content, display_order } = pointData
    const pointId = crypto.randomUUID()

    const results = await query(
      `INSERT INTO resume_item_points(id, resume_item_id, user_id, content, display_order)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, resume_item_id, user_id, content, display_order, usage_count, created_at, updated_at`,
      [pointId, resume_item_id, userId, content, display_order || 0]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to create resume item point.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error creating resume item point:", error.message)
    throw new Error("DB error while creating resume item point.")
  }
}

// Update a bullet point
const updateResumeItemPoint = async (pointId, userId, pointData) => {
  try {
    const { content, display_order } = pointData

    const results = await query(
      `UPDATE resume_item_points
       SET content = $3,
           display_order = $4,
           updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING id, resume_item_id, user_id, content, display_order, usage_count, created_at, updated_at`,
      [pointId, userId, content, display_order]
    )

    if (results.rows.length === 0) {
      throw new Error("Resume item point not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error updating resume item point:", error.message)
    throw new Error("DB error while updating resume item point.")
  }
}

// Delete a bullet point
const deleteResumeItemPoint = async (pointId, userId) => {
  try {
    const results = await query(
      `DELETE FROM resume_item_points
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [pointId, userId]
    )

    if (results.rows.length === 0) {
      throw new Error("Resume item point not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error deleting resume item point:", error.message)
    throw new Error("DB error while deleting resume item point.")
  }
}

export default {
  getResumeItemPoints,
  getResumeItemPointById,
  createResumeItemPoint,
  updateResumeItemPoint,
  deleteResumeItemPoint
}

