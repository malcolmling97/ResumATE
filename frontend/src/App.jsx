import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/ProfilePage'
import MasterResumePage from './pages/MasterResumePage'
import GenerateResumePage from './pages/GenerateResumePage'
import ProtectedRoute from './components/ProtectedRoute'
import HomePageTwo from './pages/HomePageTwo'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/home-two' element={<HomePageTwo />} />
        <Route path='/sign-in' element={<SignInPage />} />
        <Route path='/sign-up' element={<SignUpPage />} />
        <Route path='/profile' element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path='/master-resume' element={
          <ProtectedRoute>
            <MasterResumePage />
          </ProtectedRoute>
        } />
        <Route path='/generate-resume' element={
          <ProtectedRoute>
            <GenerateResumePage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
