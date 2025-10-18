import { useState, useEffect } from 'react'
import { skillsApi } from '../services/api'

const SkillsSection = () => {
    const [skills, setSkills] = useState([])
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        level: ''
    })

    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']

    useEffect(() => {
        loadSkills()
    }, [])

    const loadSkills = async () => {
        try {
            setLoading(true)
            const response = await skillsApi.getUserSkills()
            setSkills(response.data?.skills || [])
        } catch (err) {
            setError('Failed to load skills')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({
            name: '',
            category: '',
            level: ''
        })
        setIsAdding(true)
        setEditingId(null)
        setError(null)
    }

    const handleEdit = (skill) => {
        setFormData({
            name: skill.name || '',
            category: skill.category || '',
            level: skill.level || ''
        })
        setEditingId(skill.id)
        setIsAdding(false)
        setError(null)
    }

    const handleCancel = () => {
        setIsAdding(false)
        setEditingId(null)
        setError(null)
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Skill name is required')
            return
        }

        try {
            if (editingId) {
                await skillsApi.updateSkill(editingId, formData)
            } else {
                await skillsApi.createSkill(formData)
            }
            await loadSkills()
            handleCancel()
        } catch (err) {
            setError(err.message || 'Failed to save skill')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill?')) {
            return
        }

        try {
            await skillsApi.deleteSkill(id)
            await loadSkills()
        } catch (err) {
            setError(err.message || 'Failed to delete skill')
        }
    }

    const groupSkillsByCategory = () => {
        const grouped = {}
        skills.forEach(skill => {
            const category = skill.category || 'Other'
            if (!grouped[category]) {
                grouped[category] = []
            }
            grouped[category].push(skill)
        })
        return grouped
    }

    const getLevelColor = (level) => {
        const colors = {
            beginner: '#90CAF9',
            intermediate: '#81C784',
            advanced: '#FFB74D',
            expert: '#E57373'
        }
        return colors[level] || '#BDBDBD'
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
        return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading skills...</div>
    }

    const groupedSkills = groupSkillsByCategory()

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#444', fontSize: '1.5rem' }}>Skills</h2>
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
                        + Add Skill
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
                        {editingId ? 'Edit Skill' : 'Add Skill'}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                Skill Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g. JavaScript, Project Management, etc."
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Programming, Design, etc."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Level
                                </label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">Select level (optional)</option>
                                    {skillLevels.map(level => (
                                        <option key={level} value={level}>
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </option>
                                    ))}
                                </select>
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

            {skills.length === 0 && !isAdding && !editingId ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                    No skills added yet. Click "Add Skill" to get started.
                </p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                        <div key={category}>
                            <h3 style={{ 
                                margin: '0 0 0.75rem 0', 
                                color: '#666', 
                                fontSize: '1rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {category}
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {categorySkills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: skill.level ? getLevelColor(skill.level) : '#e0e0e0',
                                            borderRadius: '20px',
                                            fontSize: '0.875rem',
                                            color: '#fff',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <span>{skill.name}</span>
                                        {skill.level && (
                                            <span style={{ 
                                                fontSize: '0.75rem',
                                                opacity: 0.9,
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                padding: '0.125rem 0.375rem',
                                                borderRadius: '10px'
                                            }}>
                                                {skill.level}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleEdit(skill)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                padding: '0.125rem 0.25rem',
                                                fontSize: '0.75rem',
                                                opacity: 0.8
                                            }}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(skill.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                padding: '0.125rem 0.25rem',
                                                fontSize: '0.75rem',
                                                opacity: 0.8
                                            }}
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SkillsSection

