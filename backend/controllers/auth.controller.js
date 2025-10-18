import AuthModel from "../models/auth.model.js"
import jwt from "jsonwebtoken"

const signOut = async (req, res) => {
    try {
        console.log("Signing out user")
        res.clearCookie("access_token")
        res.status(200).json({
            status: "success",
            message: "User signed out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        })
    }
}

const getCurrentUser = async (req, res) => {
    try {
        // The verifyToken middleware already verified the token and set req.user with basic info
        // Now fetch the complete user data from the database
        const userId = req.user.id

        const user = await AuthModel.getUserById(userId)

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            })
        }

        res.status(200).json({
            status: "success",
            data: {
                user: user
            }
        })
    } catch (error) {
        console.error("Get current user error:", error.message)
        return res.status(500).json({
            status: "error",
            message: "Error fetching user data"
        })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (req.user.id !== id) {
        return res.status(403).json({
            status: "fail",
            message: "You are not authorized to delete this user"
        })
    }
    try {
        const results = await AuthModel.deleteUser(id)
        return res.status(200).json({
            status: "success",
            message: "User deleted successfully",
            data: results
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        })
    }
}

const googleCallback = async (req, res) => {
    try {
        // req.user contains the Google profile from Passport
        const googleUser = req.user

        if (!googleUser || !googleUser.emails || !googleUser.emails[0]) {
            throw new Error("Invalid Google user data received")
        }

        const email = googleUser.emails[0].value
        const isEmailVerified = googleUser.emails[0].verified

        if (!isEmailVerified) {
            throw new Error("Email not verified by Google")
        }

        let user = await AuthModel.getUserByProvider('google', googleUser.id)

        if (!user) {
            // Generate base username for OAuth users  
            const baseUsername = googleUser.displayName || email.split('@')[0]

            user = await AuthModel.createGoogleUser({
                username: baseUsername,
                email: email,
                googleId: googleUser.id
            })
        }

        if (!user) {
            throw new Error("Failed to create or retrieve user")
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
        const expiryDate = new Date(Date.now() + 10800000)

        res.cookie("access_token", token, { httpOnly: true, expires: expiryDate })

        // Send HTML page that communicates with parent window
        const { password_hash, ...userWithoutPassword } = user
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful</title>
            </head>
            <body>
                <script>
                    try {
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-success',
                                user: ${JSON.stringify(userWithoutPassword)}
                            }, '*');
                            window.close();
                        } else {
                            // Fallback: redirect to frontend
                            window.location.href = '${process.env.CLIENT_URL}/todo';
                        }
                    } catch (error) {
                        console.error('Error communicating with parent:', error);
                        window.location.href = '${process.env.CLIENT_URL}/todo';
                    }
                </script>
                <p>Authentication successful! This window should close automatically.</p>
            </body>
            </html>
        `)
    } catch (error) {
        console.error("Google OAuth callback error:", error)

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Failed</title>
            </head>
            <body>
                <script>
                    try {
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-error',
                                message: 'Authentication failed. Please try again.'
                            }, '*');
                            window.close();
                        } else {
                            // Fallback: redirect to frontend
                            window.location.href = '${process.env.CLIENT_URL}/signin';
                        }
                    } catch (error) {
                        console.error('Error communicating with parent:', error);
                        window.location.href = '${process.env.CLIENT_URL}/signin';
                    }
                </script>
                <p>Authentication failed. This window should close automatically.</p>
            </body>
            </html>
        `)
    }
}

export default {
    signOut,
    deleteUser,
    getCurrentUser,
    googleCallback
}