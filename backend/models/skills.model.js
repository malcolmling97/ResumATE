import query from "../db/index.js"
import crypto from "crypto"

// Get all skills for a user
const getUserSkills = async (userId) => {
  try {
    const results = await query(
      `SELECT id, user_id, name, category, level, source_pdf_id, created_at, updated_at
       FROM skills
       WHERE user_id = $1
       ORDER BY category NULLS LAST, name ASC`,
      [userId]
    )
    return results.rows
  } catch (error) {
    console.error("Error fetching user skills:", error.message)
    throw new Error("DB error while fetching user skills.")
  }
}

// Get a single skill by ID
const getSkillById = async (skillId, userId) => {
  try {
    const results = await query(
      `SELECT id, user_id, name, category, level, source_pdf_id, created_at, updated_at
       FROM skills
       WHERE id = $1 AND user_id = $2`,
      [skillId, userId]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching skill by ID:", error.message)
    throw new Error("DB error while fetching skill.")
  }
}

// Create a new skill
const createSkill = async (userId, skillData) => {
  try {
    const { name, category, level, source_pdf_id } = skillData
    const skillId = crypto.randomUUID()

    // Validate level if provided
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    if (level && !validLevels.includes(level)) {
      throw new Error(`Invalid skill level. Must be one of: ${validLevels.join(', ')}`)
    }

    const results = await query(
      `INSERT INTO skills(id, user_id, name, category, level, source_pdf_id)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, category, level, source_pdf_id, created_at, updated_at`,
      [skillId, userId, name, category || null, level || null, source_pdf_id || null]
    )

    if (results.rows.length === 0) {
      throw new Error("Unable to create skill entry.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error creating skill:", error.message)
    throw error
  }
}

// Update a skill
const updateSkill = async (skillId, userId, skillData) => {
  try {
    const { name, category, level, source_pdf_id } = skillData

    // Validate level if provided
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    if (level && !validLevels.includes(level)) {
      throw new Error(`Invalid skill level. Must be one of: ${validLevels.join(', ')}`)
    }

    const results = await query(
      `UPDATE skills
       SET name = $3,
           category = $4,
           level = $5,
           source_pdf_id = $6,
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, category, level, source_pdf_id, created_at, updated_at`,
      [skillId, userId, name, category || null, level || null, source_pdf_id || null]
    )

    if (results.rows.length === 0) {
      throw new Error("Skill entry not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error updating skill:", error.message)
    throw error
  }
}

// Delete a skill
const deleteSkill = async (skillId, userId) => {
  try {
    const results = await query(
      `DELETE FROM skills
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [skillId, userId]
    )

    if (results.rows.length === 0) {
      throw new Error("Skill entry not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error deleting skill:", error.message)
    throw new Error("DB error while deleting skill.")
  }
}

export default {
  getUserSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
}

