import express from "express"
import { getMasterResume, generateResume } from "../controllers/resume.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// Get user's master resume
router.get('/', verifyToken, getMasterResume)

// Generate resume from job description
router.post('/generate', verifyToken, generateResume)

export default router

