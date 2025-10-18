import { useState, useEffect } from 'react'
import { resumeItemsApi } from '../services/api'
import BulletPointsEditor from './BulletPointsEditor'

const ExperiencesSection = () => {
    const [experiences, setExperiences] = useState([])
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [expandedId, setExpandedId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        organization: '',
        location: '',
        employment_type: 'Full-time',
        description: '',
        start_date: '',
        end_date: '',
        is_current: false
    })

    useEffect(() => {
        loadExperiences()
    }, [])

    const loadExperiences = async () => {
        try {
            setLoading(true)
            const response = await resumeItemsApi.getUserResumeItems('experience')
            setExperiences(response.data?.resume_items || [])
        } catch (err) {
            setError('Failed to load experiences')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({
            title: '',
            organization: '',
            location: '',
            employment_type: 'Full-time',
            description: '',
            start_date: '',
            end_date: '',
            is_current: false
        })
        setIsAdding(true)
        setEditingId(null)
        setError(null)
    }

    const handleEdit = (exp) => {
        setFormData({
            title: exp.title || '',
            organization: exp.organization || '',
            location: exp.location || '',
            employment_type: exp.employment_type || 'Full-time',
            description: exp.description || '',
            start_date: exp.start_date || '',
            end_date: exp.end_date || '',
            is_current: exp.is_current || false
        })
        setEditingId(exp.id)
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
            setError('Job title is required')
            return
        }
        if (!formData.organization.trim()) {
            setError('Company/Organization is required')
            return
        }

        try {
            const dataToSend = {
                item_type: 'experience',
                ...formData
            }

            if (editingId) {
                await resumeItemsApi.updateResumeItem(editingId, dataToSend)
            } else {
                await resumeItemsApi.createResumeItem(dataToSend)
            }
            await loadExperiences()
            handleCancel()
        } catch (err) {
            setError(err.message || 'Failed to save experience')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this experience? All bullet points will also be deleted.')) {
            return
        }

        try {
            await resumeItemsApi.deleteResumeItem(id)
            await loadExperiences()
        } catch (err) {
            setError(err.message || 'Failed to delete experience')
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
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading experiences...</div>
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#444', fontSize: '1.5rem' }}>
                    Work Experiences ({experiences.length})
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
                        + Add Experience
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
                        {editingId ? 'Edit Experience' : 'Add New Experience'}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Employment Type
                                </label>
                                <select
                                    value={formData.employment_type}
                                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Freelance">Freelance</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Company/Organization *
                                </label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. San Francisco, CA"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="Brief description of your role..."
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
                                    <span style={{ fontSize: '0.875rem' }}>Current</span>
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

            {experiences.length === 0 && !isAdding && !editingId ? (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '3rem 2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        No work experiences yet
                    </p>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                        Add your work history to build your master resume
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {experiences.map((exp) => (
                        <div
                            key={exp.id}
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
                                        {exp.title}
                                    </h3>
                                    <div style={{ color: '#666', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                        <strong>{exp.organization}</strong>
                                        {exp.location && ` • ${exp.location}`}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888', marginBottom: '0.75rem' }}>
                                        {exp.employment_type && <span>📋 {exp.employment_type}</span>}
                                        <span>
                                            📅 {formatDate(exp.start_date) || 'Start'} - {exp.is_current ? 'Present' : (formatDate(exp.end_date) || 'End')}
                                        </span>
                                    </div>
                                    {exp.description && (
                                        <p style={{ margin: '0.5rem 0', color: '#555', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button
                                        onClick={() => handleEdit(exp)}
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
                                        onClick={() => handleDelete(exp.id)}
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
                                    resumeItemId={exp.id}
                                    points={exp.points || []}
                                    onPointsUpdate={loadExperiences}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExperiencesSection

