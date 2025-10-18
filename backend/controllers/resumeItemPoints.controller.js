import ResumeItemPointsModel from "../models/resumeItemPoints.model.js"

// Get all bullet points for a resume item
const getResumeItemPoints = async (req, res) => {
  try {
    const { itemId } = req.params
    const userId = req.user.id

    const points = await ResumeItemPointsModel.getResumeItemPoints(itemId, userId)

    res.status(200).json({
      status: "success",
      data: {
        points
      }
    })
  } catch (error) {
    console.error("Get resume item points error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Get a single bullet point by ID
const getResumeItemPointById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const point = await ResumeItemPointsModel.getResumeItemPointById(id, userId)

    if (!point) {
      return res.status(404).json({
        status: "fail",
        message: "Resume item point not found"
      })
    }

    res.status(200).json({
      status: "success",
      data: {
        point
      }
    })
  } catch (error) {
    console.error("Get resume item point by ID error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Create a new bullet point
const createResumeItemPoint = async (req, res) => {
  try {
    const userId = req.user.id
    const { resume_item_id, content, display_order } = req.body

    if (!resume_item_id) {
      return res.status(400).json({
        status: "fail",
        message: "Resume item ID is required"
      })
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Content is required"
      })
    }

    const pointData = {
      resume_item_id,
      content: content.trim(),
      display_order: display_order || 0
    }

    const point = await ResumeItemPointsModel.createResumeItemPoint(userId, pointData)

    res.status(201).json({
      status: "success",
      data: {
        point
      }
    })
  } catch (error) {
    console.error("Create resume item point error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Update a bullet point
const updateResumeItemPoint = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { content, display_order } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Content is required"
      })
    }

    const pointData = {
      content: content.trim(),
      display_order: display_order !== undefined ? display_order : 0
    }

    const point = await ResumeItemPointsModel.updateResumeItemPoint(id, userId, pointData)

    res.status(200).json({
      status: "success",
      data: {
        point
      }
    })
  } catch (error) {
    console.error("Update resume item point error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Delete a bullet point
const deleteResumeItemPoint = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    await ResumeItemPointsModel.deleteResumeItemPoint(id, userId)

    res.status(200).json({
      status: "success",
      message: "Resume item point deleted successfully"
    })
  } catch (error) {
    console.error("Delete resume item point error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

export default {
  getResumeItemPoints,
  getResumeItemPointById,
  createResumeItemPoint,
  updateResumeItemPoint,
  deleteResumeItemPoint
}

