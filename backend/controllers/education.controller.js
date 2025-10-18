import EducationModel from "../models/education.model.js"

// Get all education entries for the authenticated user
const getUserEducation = async (req, res) => {
  try {
    const userId = req.user.id
    const education = await EducationModel.getUserEducation(userId)

    res.status(200).json({
      status: "success",
      data: {
        education
      }
    })
  } catch (error) {
    console.error("Get user education error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Get a single education entry
const getEducationById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const education = await EducationModel.getEducationById(id, userId)

    if (!education) {
      return res.status(404).json({
        status: "fail",
        message: "Education entry not found"
      })
    }

    res.status(200).json({
      status: "success",
      data: {
        education
      }
    })
  } catch (error) {
    console.error("Get education by ID error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Create a new education entry
const createEducation = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, description, grade, start_date, end_date } = req.body

    if (!title) {
      return res.status(400).json({
        status: "fail",
        message: "Title is required"
      })
    }

    const educationData = {
      title,
      description,
      grade,
      start_date,
      end_date
    }

    const education = await EducationModel.createEducation(userId, educationData)

    res.status(201).json({
      status: "success",
      data: {
        education
      }
    })
  } catch (error) {
    console.error("Create education error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Update an education entry
const updateEducation = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { title, description, grade, start_date, end_date } = req.body

    if (!title) {
      return res.status(400).json({
        status: "fail",
        message: "Title is required"
      })
    }

    const educationData = {
      title,
      description,
      grade,
      start_date,
      end_date
    }

    const education = await EducationModel.updateEducation(id, userId, educationData)

    res.status(200).json({
      status: "success",
      data: {
        education
      }
    })
  } catch (error) {
    console.error("Update education error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Delete an education entry
const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    await EducationModel.deleteEducation(id, userId)

    res.status(200).json({
      status: "success",
      message: "Education entry deleted successfully"
    })
  } catch (error) {
    console.error("Delete education error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

export default {
  getUserEducation,
  getEducationById,
  createEducation,
  updateEducation,
  deleteEducation
}

