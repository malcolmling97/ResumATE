import express from "express"
import resumeItemsController from "../controllers/resumeItems.controller.js"
import resumeItemPointsController from "../controllers/resumeItemPoints.controller.js"
import { verifyToken } from "../utils/verify.js"

const router = express.Router()

// Resume Items routes
router.get("/", verifyToken, resumeItemsController.getUserResumeItems)
router.get("/:id", verifyToken, resumeItemsController.getResumeItemById)
router.post("/", verifyToken, resumeItemsController.createResumeItem)
router.patch("/:id", verifyToken, resumeItemsController.updateResumeItem)
router.delete("/:id", verifyToken, resumeItemsController.deleteResumeItem)

// Resume Item Points routes (nested under resume items)
router.get("/:itemId/points", verifyToken, resumeItemPointsController.getResumeItemPoints)
router.post("/points", verifyToken, resumeItemPointsController.createResumeItemPoint)
router.patch("/points/:id", verifyToken, resumeItemPointsController.updateResumeItemPoint)
router.delete("/points/:id", verifyToken, resumeItemPointsController.deleteResumeItemPoint)

export default router

