import express from "express"
import educationController from "../controllers/education.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// All routes require authentication
router.get("/", verifyToken, educationController.getUserEducation)
router.get("/:id", verifyToken, educationController.getEducationById)
router.post("/", verifyToken, educationController.createEducation)
router.patch("/:id", verifyToken, educationController.updateEducation)
router.delete("/:id", verifyToken, educationController.deleteEducation)

export default router

