import { useState, useEffect } from 'react'
import { educationApi } from '../services/api'

const EducationSection = () => {
    const [education, setEducation] = useState([])
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        grade: '',
        start_date: '',
        end_date: ''
    })

    useEffect(() => {
        loadEducation()
    }, [])

    const loadEducation = async () => {
        try {
            setLoading(true)
            const response = await educationApi.getUserEducation()
            setEducation(response.data?.education || [])
        } catch (err) {
            setError('Failed to load education')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({
            title: '',
            description: '',
            grade: '',
            start_date: '',
            end_date: ''
        })
        setIsAdding(true)
        setEditingId(null)
        setError(null)
    }

    const handleEdit = (edu) => {
        setFormData({
            title: edu.title || '',
            description: edu.description || '',
            grade: edu.grade || '',
            start_date: edu.start_date || '',
            end_date: edu.end_date || ''
        })
        setEditingId(edu.id)
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
            setError('Title is required')
            return
        }

        try {
            if (editingId) {
                await educationApi.updateEducation(editingId, formData)
            } else {
                await educationApi.createEducation(formData)
            }
            await loadEducation()
            handleCancel()
        } catch (err) {
            setError(err.message || 'Failed to save education')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this education entry?')) {
            return
        }

        try {
            await educationApi.deleteEducation(id)
            await loadEducation()
        } catch (err) {
            setError(err.message || 'Failed to delete education')
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
        return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading education...</div>
    }

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#444', fontSize: '1.5rem' }}>Education</h2>
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
                            fontSize: '0.875rem'
                        }}
                    >
                        + Add Education
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
                        {editingId ? 'Edit Education' : 'Add Education'}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g. Bachelor of Science in Computer Science"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Institution
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="University name and additional details"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Grade/GPA
                                </label>
                                <input
                                    type="text"
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. 3.8 GPA"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                />
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
                                    fontSize: '1rem'
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

            {education.length === 0 && !isAdding && !editingId ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                    No education entries yet. Click "Add Education" to get started.
                </p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {education.map((edu) => (
                        <div
                            key={edu.id}
                            style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                padding: '1.25rem',
                                backgroundColor: '#fafafa'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.125rem' }}>
                                        {edu.title}
                                    </h3>
                                    {edu.description && (
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#666', whiteSpace: 'pre-wrap' }}>
                                            {edu.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#666' }}>
                                        {edu.grade && <span>Grade: {edu.grade}</span>}
                                        {(edu.start_date || edu.end_date) && (
                                            <span>
                                                {formatDate(edu.start_date) || 'Present'} - {formatDate(edu.end_date) || 'Present'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button
                                        onClick={() => handleEdit(edu)}
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
                                        onClick={() => handleDelete(edu.id)}
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default EducationSection

