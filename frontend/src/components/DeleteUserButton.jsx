import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const DeleteUserButton = () => {
    const deleteUser = useAuthStore(state => state.deleteUser)
    const logout = useAuthStore(state => state.logout)
    const navigate = useNavigate()

    const handleDeleteUser = async () => {
        try {
            await deleteUser()
            await logout()
            navigate('/sign-in')
        } catch (error) {
            // Optionally handle error, e.g. show a message
            console.error('Failed to delete user:', error)
        }
    }

    return (
        <button onClick={handleDeleteUser}>Delete Account</button>
    )
}

export default DeleteUserButton