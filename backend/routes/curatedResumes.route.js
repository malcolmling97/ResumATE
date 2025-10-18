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

router.get('/', verifyToken, getUserCuratedResumes)
router.get('/:id', verifyToken, getCuratedResumeById)
router.post('/', verifyToken, createCuratedResume)
router.patch('/:id/status', verifyToken, updateCuratedResumeStatus)
router.delete('/:id', verifyToken, deleteCuratedResume)

export default router

