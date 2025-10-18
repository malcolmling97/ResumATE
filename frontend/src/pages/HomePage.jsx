import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const HomePage = () => {
  const { user } = useAuthStore()

  return (
    <>
      <div>HomePage</div>
      <div className='flex gap-4'>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/master-resume">Master Resume</Link>
          </>
        ) : (
          <>
            <Link to="/sign-in">Sign In</Link>
            <Link to="/sign-up">Sign Up</Link>
          </>
        )}
      </div>
    </>
  )
}

export default HomePage