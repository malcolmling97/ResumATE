import curatedResumesModel from "../models/curatedResumes.model.js"

// Create a new curated resume
export const createCuratedResume = async (req, res) => {
    try {
        const userId = req.user.id
        const resumeData = req.body

        console.log('Attempting to save curated resume for user:', userId)
        console.log('Resume data received:', JSON.stringify(resumeData, null, 2))

        const newResume = await curatedResumesModel.createCuratedResume(userId, resumeData)

        console.log('Resume saved successfully:', newResume)

        return res.status(201).json({
            success: true,
            message: 'Curated resume saved successfully',
            data: newResume
        })
    } catch (error) {
        console.error('Error creating curated resume:', error)
        console.error('Error stack:', error.stack)
        return res.status(500).json({
            success: false,
            message: 'Failed to save curated resume',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
}

// Get all curated resumes for the current user
export const getUserCuratedResumes = async (req, res) => {
    try {
        const userId = req.user.id

        const resumes = await curatedResumesModel.getUserCuratedResumes(userId)

        return res.status(200).json({
            success: true,
            data: resumes
        })
    } catch (error) {
        console.error('Error fetching curated resumes:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch curated resumes',
            error: error.message
        })
    }
}

// Get a single curated resume by ID
export const getCuratedResumeById = async (req, res) => {
    try {
        const userId = req.user.id
        const { id } = req.params

        const resume = await curatedResumesModel.getCuratedResumeById(id, userId)

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Curated resume not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: resume
        })
    } catch (error) {
        console.error('Error fetching curated resume:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch curated resume',
            error: error.message
        })
    }
}

// Update curated resume status
export const updateCuratedResumeStatus = async (req, res) => {
    try {
        const userId = req.user.id
        const { id } = req.params
        const { status } = req.body

        if (!['draft', 'finalized', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            })
        }

        const updatedResume = await curatedResumesModel.updateCuratedResumeStatus(id, userId, status)

        return res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: updatedResume
        })
    } catch (error) {
        console.error('Error updating curated resume status:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        })
    }
}

// Delete a curated resume
export const deleteCuratedResume = async (req, res) => {
    try {
        const userId = req.user.id
        const { id } = req.params

        await curatedResumesModel.deleteCuratedResume(id, userId)

        return res.status(200).json({
            success: true,
            message: 'Curated resume deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting curated resume:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to delete curated resume',
            error: error.message
        })
    }
}

