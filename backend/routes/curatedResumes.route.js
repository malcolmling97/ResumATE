import express from "express"
import {
    createCuratedResume,
    getUserCuratedResumes,
    getCuratedResumeById,
    updateCuratedResumeStatus,
    deleteCuratedResume
} from "../controllers/curatedResumes.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// Get all curated resumes for current user
router.get('/', verifyToken, getUserCuratedResumes)

// Get a single curated resume
router.get('/:id', verifyToken, getCuratedResumeById)

// Create a new curated resume
router.post('/', verifyToken, createCuratedResume)

// Update curated resume status
router.patch('/:id/status', verifyToken, updateCuratedResumeStatus)

// Delete a curated resume
router.delete('/:id', verifyToken, deleteCuratedResume)

export default router

