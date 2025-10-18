import SkillsModel from "../models/skills.model.js"

// Get all skills for the authenticated user
const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id
    const skills = await SkillsModel.getUserSkills(userId)

    res.status(200).json({
      status: "success",
      data: {
        skills
      }
    })
  } catch (error) {
    console.error("Get user skills error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Get a single skill entry
const getSkillById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const skill = await SkillsModel.getSkillById(id, userId)

    if (!skill) {
      return res.status(404).json({
        status: "fail",
        message: "Skill entry not found"
      })
    }

    res.status(200).json({
      status: "success",
      data: {
        skill
      }
    })
  } catch (error) {
    console.error("Get skill by ID error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Create a new skill entry
const createSkill = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, category, level, source_pdf_id } = req.body

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Skill name is required"
      })
    }

    const skillData = {
      name,
      category,
      level,
      source_pdf_id
    }

    const skill = await SkillsModel.createSkill(userId, skillData)

    res.status(201).json({
      status: "success",
      data: {
        skill
      }
    })
  } catch (error) {
    console.error("Create skill error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Update a skill entry
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { name, category, level, source_pdf_id } = req.body

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Skill name is required"
      })
    }

    const skillData = {
      name,
      category,
      level,
      source_pdf_id
    }

    const skill = await SkillsModel.updateSkill(id, userId, skillData)

    res.status(200).json({
      status: "success",
      data: {
        skill
      }
    })
  } catch (error) {
    console.error("Update skill error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Delete a skill entry
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    await SkillsModel.deleteSkill(id, userId)

    res.status(200).json({
      status: "success",
      message: "Skill entry deleted successfully"
    })
  } catch (error) {
    console.error("Delete skill error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

export default {
  getUserSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
}

