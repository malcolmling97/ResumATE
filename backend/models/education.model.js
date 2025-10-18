import query from "../db/index.js"
import crypto from "crypto"

// Get all education entries for a user
const getUserEducation = async (userId) => {
  try {
    const results = await query(
      `SELECT id, user_id, title, description, grade, start_date, end_date, created_at
       FROM education
       WHERE user_id = $1
       ORDER BY start_date DESC NULLS LAST, created_at DESC`,
      [userId]
    )
    return results.rows
  } catch (error) {
    console.error("Error fetching user education:", error.message)
    throw new Error("DB error while fetching user education.")
  }
}

// Get a single education entry by ID
const getEducationById = async (educationId, userId) => {
  try {
    const results = await query(
      `SELECT id, user_id, title, description, grade, start_date, end_date, created_at
       FROM education
       WHERE id = $1 AND user_id = $2`,
      [educationId, userId]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching education by ID:", error.message)
    throw new Error("DB error while fetching education.")
  }
}

// Create a new education entry
const createEducation = async (userId, educationData) => {
  try {
    const { title, description, grade, start_date, end_date } = educationData
    const educationId = crypto.randomUUID()

    const results = await query(
      `INSERT INTO education(id, user_id, title, description, grade, start_date, end_date)
       VALUES($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, title, description, grade, start_date, end_date, created_at`,
      [educationId, userId, title, description || null, grade || null, start_date || null, end_date || null]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to create education entry.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error creating education:", error.message)
    throw new Error("DB error while creating education.")
  }
}

// Update an education entry
const updateEducation = async (educationId, userId, educationData) => {
  try {
    const { title, description, grade, start_date, end_date } = educationData

    const results = await query(
      `UPDATE education
       SET title = $3,
           description = $4,
           grade = $5,
           start_date = $6,
           end_date = $7
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, title, description, grade, start_date, end_date, created_at`,
      [educationId, userId, title, description || null, grade || null, start_date || null, end_date || null]
    )

    if (results.rows.length === 0) {
      throw new Error("Education entry not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error updating education:", error.message)
    throw new Error("DB error while updating education.")
  }
}

// Delete an education entry
const deleteEducation = async (educationId, userId) => {
  try {
    const results = await query(
      `DELETE FROM education
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [educationId, userId]
    )

    if (results.rows.length === 0) {
      throw new Error("Education entry not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error deleting education:", error.message)
    throw new Error("DB error while deleting education.")
  }
}

export default {
  getUserEducation,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation
}

