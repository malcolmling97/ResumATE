import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"
import GoogleButton from '../components/GoogleButton'

const SignInPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginWithGooglePopup = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setErrors([])

    try {
      const popup = window.open(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`,
        "googleAuth",
        "width=500,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no"
      )

      if (!popup) {
        throw new Error("Popup blocked! Please allow popups for this site.")
      }

      // Listen for messages from the popup
      const messageListener = async (evt) => {
        // Only accept messages with the expected structure to ensure security
        if (!evt.data || typeof evt.data !== 'object') return
        if (!evt.data.type || (evt.data.type !== 'oauth-success' && evt.data.type !== 'oauth-error')) return

        if (evt.data?.type === "oauth-success") {
          // Handle successful OAuth login
          if (evt.data.user) {
            login(evt.data.user)
            navigate("/")
          }

          // Clean up
          window.removeEventListener("message", messageListener)
          popup.close()
        } else if (evt.data?.type === "oauth-error") {
          // Handle OAuth error
          setErrors([evt.data.message || "Failed to sign in with Google"])
          window.removeEventListener("message", messageListener)
          popup.close()
        }
      }

      window.addEventListener("message", messageListener)

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener("message", messageListener)
          setIsSubmitting(false)
        }
      }, 1000)

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popup.closed) {
          popup.close()
          clearInterval(checkClosed)
          window.removeEventListener("message", messageListener)
          setIsSubmitting(false)
        }
      }, 300000) // 5 minutes
    } catch (error) {
      console.error("Google sign-in error:", error)
      setErrors([error.message || "Failed to sign in with Google"])
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <>
        <div>SignInPage</div>
        <GoogleButton onClick={loginWithGooglePopup} disabled={isSubmitting} />
    </>
  )
}

export default SignInPage