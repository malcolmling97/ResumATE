import { useState, useEffect } from 'react'
import { resumeItemsApi } from '../services/api'
import BulletPointsEditor from './BulletPointsEditor'

const AchievementsSection = () => {
    const [achievements, setAchievements] = useState([])
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        organization: '',
        description: '',
        start_date: '',
        end_date: '',
        is_current: false
    })

    useEffect(() => {
        loadAchievements()
    }, [])

    const loadAchievements = async () => {
        try {
            setLoading(true)
            const response = await resumeItemsApi.getUserResumeItems('achievement')
            setAchievements(response.data?.resume_items || [])
        } catch (err) {
            setError('Failed to load achievements')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({
            title: '',
            organization: '',
            description: '',
            start_date: '',
            end_date: '',
            is_current: false
        })
        setIsAdding(true)
        setEditingId(null)
        setError(null)
    }

    const handleEdit = (achievement) => {
        setFormData({
            title: achievement.title || '',
            organization: achievement.organization || '',
            description: achievement.description || '',
            start_date: achievement.start_date || '',
            end_date: achievement.end_date || '',
            is_current: achievement.is_current || false
        })
        setEditingId(achievement.id)
        setIsAdding(false)
        setError(null)
    }

    const handleCancel = () => {
        setIsAdding(false)
        setEditingId(null)
        setError(null)
    }

    const handleSave = async () => {
        if (!formData.title.trim()) {
            setError('Achievement title is required')
            return
        }

        try {
            const dataToSend = {
                item_type: 'achievement',
                ...formData
            }

            if (editingId) {
                await resumeItemsApi.updateResumeItem(editingId, dataToSend)
            } else {
                await resumeItemsApi.createResumeItem(dataToSend)
            }
            await loadAchievements()
            handleCancel()
        } catch (err) {
            setError(err.message || 'Failed to save achievement')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this achievement? All bullet points will also be deleted.')) {
            return
        }

        try {
            await resumeItemsApi.deleteResumeItem(id)
            await loadAchievements()
        } catch (err) {
            setError(err.message || 'Failed to delete achievement')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }

    const inputStyle = {
        width: '100%',
        padding: '0.5rem',
        fontSize: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontFamily: 'inherit'
    }

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading achievements...</div>
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#444', fontSize: '1.5rem' }}>
                    Achievements ({achievements.length})
                </h2>
                {!isAdding && !editingId && (
                    <button
                        onClick={handleAdd}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }}
                    >
                        + Add Achievement
                    </button>
                )}
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            {(isAdding || editingId) && (
                <div style={{
                    border: '2px solid #4CAF50',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#f9fff9'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                        {editingId ? 'Edit Achievement' : 'Add New Achievement'}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Achievement Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g. First Place in Hackathon"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Organization
                            </label>
                            <input
                                type="text"
                                value={formData.organization}
                                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g. TechCon 2024"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="Brief description of the achievement..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    style={inputStyle}
                                    disabled={formData.is_current}
                                />
                            </div>
                            <div style={{ paddingBottom: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_current}
                                        onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>Ongoing</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    backgroundColor: '#f5f5f5',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {achievements.length === 0 && !isAdding && !editingId ? (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '3rem 2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        No achievements yet
                    </p>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                        Add your achievements to showcase your accomplishments
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            style={{
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#333', fontSize: '1.25rem' }}>
                                        {achievement.title}
                                    </h3>
                                    {achievement.organization && (
                                        <div style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                            <strong>{achievement.organization}</strong>
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.75rem' }}>
                                        <span>
                                            📅 {formatDate(achievement.start_date) || 'Start'} - {achievement.is_current ? 'Ongoing' : (formatDate(achievement.end_date) || 'End')}
                                        </span>
                                    </div>
                                    {achievement.description && (
                                        <p style={{ margin: '0.5rem 0', color: '#555', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {achievement.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button
                                        onClick={() => handleEdit(achievement)}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            backgroundColor: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(achievement.id)}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Bullet Points Section */}
                            <div style={{
                                borderTop: '1px solid #eee',
                                paddingTop: '1rem',
                                marginTop: '1rem'
                            }}>
                                <BulletPointsEditor
                                    resumeItemId={achievement.id}
                                    points={achievement.points || []}
                                    onPointsUpdate={loadAchievements}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AchievementsSection

