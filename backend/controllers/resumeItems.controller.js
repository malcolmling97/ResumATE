import ResumeItemsModel from "../models/resumeItems.model.js"
import ResumeItemPointsModel from "../models/resumeItemPoints.model.js"

// Get all resume items for the authenticated user
const getUserResumeItems = async (req, res) => {
  try {
    const userId = req.user.id
    const { type } = req.query // Optional filter by type

    let resumeItems
    if (type && (type === 'experience' || type === 'project')) {
      resumeItems = await ResumeItemsModel.getUserResumeItemsByType(userId, type)
    } else {
      resumeItems = await ResumeItemsModel.getUserResumeItems(userId)
    }

    // Get bullet points for each item
    const itemsWithPoints = await Promise.all(
      resumeItems.map(async (item) => {
        const points = await ResumeItemPointsModel.getResumeItemPoints(item.id, userId)
        return {
          ...item,
          points
        }
      })
    )

    res.status(200).json({
      status: "success",
      data: {
        resume_items: itemsWithPoints
      }
    })
  } catch (error) {
    console.error("Get user resume items error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Get a single resume item by ID
const getResumeItemById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const resumeItem = await ResumeItemsModel.getResumeItemById(id, userId)

    if (!resumeItem) {
      return res.status(404).json({
        status: "fail",
        message: "Resume item not found"
      })
    }

    // Get bullet points
    const points = await ResumeItemPointsModel.getResumeItemPoints(id, userId)
    
    res.status(200).json({
      status: "success",
      data: {
        resume_item: {
          ...resumeItem,
          points
        }
      }
    })
  } catch (error) {
    console.error("Get resume item by ID error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Create a new resume item
const createResumeItem = async (req, res) => {
  try {
    const userId = req.user.id
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
    } = req.body

    if (!item_type || (item_type !== 'experience' && item_type !== 'project')) {
      return res.status(400).json({
        status: "fail",
        message: "Item type must be 'experience' or 'project'"
      })
    }

    if (!title) {
      return res.status(400).json({
        status: "fail",
        message: "Title is required"
      })
    }

    const itemData = {
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
    }

    const resumeItem = await ResumeItemsModel.createResumeItem(userId, itemData)

    res.status(201).json({
      status: "success",
      data: {
        resume_item: {
          ...resumeItem,
          points: []
        }
      }
    })
  } catch (error) {
    console.error("Create resume item error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Update a resume item
const updateResumeItem = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
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
    } = req.body

    if (!item_type || (item_type !== 'experience' && item_type !== 'project')) {
      return res.status(400).json({
        status: "fail",
        message: "Item type must be 'experience' or 'project'"
      })
    }

    if (!title) {
      return res.status(400).json({
        status: "fail",
        message: "Title is required"
      })
    }

    const itemData = {
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
    }

    const resumeItem = await ResumeItemsModel.updateResumeItem(id, userId, itemData)

    // Get updated bullet points
    const points = await ResumeItemPointsModel.getResumeItemPoints(id, userId)

    res.status(200).json({
      status: "success",
      data: {
        resume_item: {
          ...resumeItem,
          points
        }
      }
    })
  } catch (error) {
    console.error("Update resume item error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

// Delete a resume item
const deleteResumeItem = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    await ResumeItemsModel.deleteResumeItem(id, userId)

    res.status(200).json({
      status: "success",
      message: "Resume item deleted successfully"
    })
  } catch (error) {
    console.error("Delete resume item error:", error.message)
    return res.status(500).json({
      status: "error",
      message: error.message
    })
  }
}

export default {
  getUserResumeItems,
  getResumeItemById,
  createResumeItem,
  updateResumeItem,
  deleteResumeItem
}

