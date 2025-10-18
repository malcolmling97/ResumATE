import React from 'react'
import GoogleButton from '../components/GoogleButton'

const SignUpPage = () => {
  return (
    <>
        <div>SignUpPage</div>
        <GoogleButton onClick={() => console.log("Google button clicked")} disabled={false} />
    </>
  )
}

export default SignUpPage