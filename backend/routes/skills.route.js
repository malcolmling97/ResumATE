import express from "express"
import skillsController from "../controllers/skills.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// All routes require authentication
router.get("/", verifyToken, skillsController.getUserSkills)
router.get("/:id", verifyToken, skillsController.getSkillById)
router.post("/", verifyToken, skillsController.createSkill)
router.patch("/:id", verifyToken, skillsController.updateSkill)
router.delete("/:id", verifyToken, skillsController.deleteSkill)

export default router

