import { useState } from 'react'
import LogOutButton from '../components/LogOutButton'
import DeleteUserButton from '../components/DeleteUserButton'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../services/api'

const ProfilePage = () => {
    const { user, updateUserInStore } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        phone: '',
        about: ''
    })

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleEditClick = () => {
        setFormData({
            name: user?.name || '',
            location: user?.location || '',
            phone: user?.phone || '',
            about: user?.about || ''
        })
        setIsEditing(true)
        setError(null)
    }

    const handleCancelClick = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveClick = async () => {
        try {
            setIsSaving(true)
            setError(null)
            
            const response = await authApi.updateUser(user.id, formData)
            
            // Update the user in the store with the response data
            if (response.data?.user) {
                updateUserInStore(response.data.user)
            }
            
            setIsEditing(false)
        } catch (err) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const inputStyle = {
        width: '100%',
        padding: '0.5rem',
        fontSize: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontFamily: 'inherit'
    }

    const textareaStyle = {
        ...inputStyle,
        minHeight: '100px',
        resize: 'vertical'
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ margin: 0, color: '#333' }}>Profile</h1>
                {!isEditing && (
                    <button
                        onClick={handleEditClick}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        Edit Profile
                    </button>
                )}
            </div>
            
            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '1rem',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '2rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
            }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#444', fontSize: '1.5rem' }}>
                    User Information
                </h2>
                
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                        }}>
                            Username
                        </label>
                        <div style={{ color: '#333', fontSize: '1rem' }}>
                            {user?.username || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                        }}>
                            Email
                        </label>
                        <div style={{ color: '#333', fontSize: '1rem' }}>
                            {user?.email || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                        }}>
                            Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                style={inputStyle}
                                placeholder="Enter your name"
                            />
                        ) : (
                            <div style={{ color: '#333', fontSize: '1rem' }}>
                                {user?.name || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                        }}>
                            Location
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                style={inputStyle}
                                placeholder="Enter your location"
                            />
                        ) : (
                            <div style={{ color: '#333', fontSize: '1rem' }}>
                                {user?.location || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                        }}>
                            Phone
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                style={inputStyle}
                                placeholder="Enter your phone number"
                            />
                        ) : (
                            <div style={{ color: '#333', fontSize: '1rem' }}>
                                {user?.phone || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                        }}>
                            About
                        </label>
                        {isEditing ? (
                            <textarea
                                value={formData.about}
                                onChange={(e) => handleInputChange('about', e.target.value)}
                                style={textareaStyle}
                                placeholder="Tell us about yourself"
                            />
                        ) : (
                            <div style={{
                                color: '#333',
                                fontSize: '1rem',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.6'
                            }}>
                                {user?.about || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                        }}>
                            Member Since
                        </label>
                        <div style={{ color: '#333', fontSize: '1rem' }}>
                            {formatDate(user?.created_at)}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #eee'
                    }}>
                        <button
                            onClick={handleSaveClick}
                            disabled={isSaving}
                            style={{
                                padding: '0.5rem 1.5rem',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500',
                                opacity: isSaving ? 0.6 : 1
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={handleCancelClick}
                            disabled={isSaving}
                            style={{
                                padding: '0.5rem 1.5rem',
                                backgroundColor: '#f5f5f5',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <LogOutButton />
                <DeleteUserButton />
            </div>
        </div>
    )
}

export default ProfilePage