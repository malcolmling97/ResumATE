import { useState, useEffect } from 'react'
import { resumeItemsApi } from '../services/api'
import BulletPointsEditor from './BulletPointsEditor'

const ProjectsSection = () => {
    const [projects, setProjects] = useState([])
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technologies: '',
        github_url: '',
        demo_url: '',
        start_date: '',
        end_date: '',
        is_current: false
    })

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        try {
            setLoading(true)
            const response = await resumeItemsApi.getUserResumeItems('project')
            setProjects(response.data?.resume_items || [])
        } catch (err) {
            setError('Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({
            title: '',
            description: '',
            technologies: '',
            github_url: '',
            demo_url: '',
            start_date: '',
            end_date: '',
            is_current: false
        })
        setIsAdding(true)
        setEditingId(null)
        setError(null)
    }

    const handleEdit = (proj) => {
        setFormData({
            title: proj.title || '',
            description: proj.description || '',
            technologies: proj.technologies ? proj.technologies.join(', ') : '',
            github_url: proj.github_url || '',
            demo_url: proj.demo_url || '',
            start_date: proj.start_date || '',
            end_date: proj.end_date || '',
            is_current: proj.is_current || false
        })
        setEditingId(proj.id)
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
            setError('Project name is required')
            return
        }

        try {
            const technologiesArray = formData.technologies 
                ? formData.technologies.split(',').map(t => t.trim()).filter(t => t)
                : null

            const dataToSend = {
                item_type: 'project',
                title: formData.title,
                description: formData.description,
                technologies: technologiesArray,
                github_url: formData.github_url,
                demo_url: formData.demo_url,
                start_date: formData.start_date,
                end_date: formData.end_date,
                is_current: formData.is_current
            }

            if (editingId) {
                await resumeItemsApi.updateResumeItem(editingId, dataToSend)
            } else {
                await resumeItemsApi.createResumeItem(dataToSend)
            }
            await loadProjects()
            handleCancel()
        } catch (err) {
            setError(err.message || 'Failed to save project')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project? All bullet points will also be deleted.')) {
            return
        }

        try {
            await resumeItemsApi.deleteResumeItem(id)
            await loadProjects()
        } catch (err) {
            setError(err.message || 'Failed to delete project')
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
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading projects...</div>
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#444', fontSize: '1.5rem' }}>
                    Projects ({projects.length})
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
                        + Add Project
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
                        {editingId ? 'Edit Project' : 'Add New Project'}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g. E-commerce Platform"
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
                                placeholder="Brief description of the project..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Technologies
                            </label>
                            <input
                                type="text"
                                value={formData.technologies}
                                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g. React, Node.js, PostgreSQL (comma-separated)"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    GitHub URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.github_url}
                                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Demo URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.demo_url}
                                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://..."
                                />
                            </div>
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

            {projects.length === 0 && !isAdding && !editingId ? (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '3rem 2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        No projects yet
                    </p>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                        Add your projects to showcase your work
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {projects.map((proj) => (
                        <div
                            key={proj.id}
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
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.25rem' }}>
                                        {proj.title}
                                    </h3>
                                    {proj.description && (
                                        <p style={{ margin: '0 0 0.75rem 0', color: '#555', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {proj.description}
                                        </p>
                                    )}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            {proj.technologies.map((tech, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        display: 'inline-block',
                                                        backgroundColor: '#e3f2fd',
                                                        color: '#1976d2',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        marginRight: '0.5rem',
                                                        marginBottom: '0.25rem'
                                                    }}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888', flexWrap: 'wrap' }}>
                                        {(proj.start_date || proj.end_date) && (
                                            <span>
                                                📅 {formatDate(proj.start_date) || 'Start'} - {proj.is_current ? 'Ongoing' : (formatDate(proj.end_date) || 'End')}
                                            </span>
                                        )}
                                        {proj.github_url && (
                                            <a href={proj.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                🔗 GitHub
                                            </a>
                                        )}
                                        {proj.demo_url && (
                                            <a href={proj.demo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                🌐 Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button
                                        onClick={() => handleEdit(proj)}
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
                                        onClick={() => handleDelete(proj.id)}
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
                                    resumeItemId={proj.id}
                                    points={proj.points || []}
                                    onPointsUpdate={loadProjects}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProjectsSection

