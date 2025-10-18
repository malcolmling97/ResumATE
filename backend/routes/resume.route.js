import express from "express"
import { generateResume } from "../controllers/resume.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// Generate resume from job description
router.post('/generate', verifyToken, generateResume)

export default router

