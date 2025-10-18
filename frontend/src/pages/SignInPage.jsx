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
            navigate("/generate-resume")
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-sky-200 via-slate-100 to-violet-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center w-full max-w-sm">
        <h1 className="text-4xl font-serif mb-4">resum<span className="text-sky-700">ate</span></h1>
        <p className="mb-8 text-gray-500 text-center text-lg">Sign in to continue to <span className="text-sky-700">Resumate</span>.</p>
        <GoogleButton
          onClick={loginWithGooglePopup}
          disabled={isSubmitting}
          className="w-full"
        />
      </div>
    </div>
  )
}

export default SignInPage