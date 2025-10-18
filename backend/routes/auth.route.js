import crypto from "crypto"
import express from "express"
import authController from "../controllers/auth.controller.js"
import { verifyToken } from "../utils/verify.js"
import passport from "passport"

const router = express.Router()

router.post("/signout", authController.signOut)
router.get("/user", verifyToken, authController.getCurrentUser)
router.delete("/delete/:id", verifyToken, authController.deleteUser)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/auth-failure" }),
    authController.googleCallback
)

export default router