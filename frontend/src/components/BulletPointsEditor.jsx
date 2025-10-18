import { useState } from 'react'
import { resumeItemsApi } from '../services/api'

const BulletPointsEditor = ({ resumeItemId, points = [], onPointsUpdate }) => {
    const [isAdding, setIsAdding] = useState(false)
    const [editingPointId, setEditingPointId] = useState(null)
    const [newPointContent, setNewPointContent] = useState('')
    const [error, setError] = useState(null)

    const handleAddPoint = () => {
        setNewPointContent('')
        setIsAdding(true)
        setEditingPointId(null)
        setError(null)
    }

    const handleEditPoint = (point) => {
        setNewPointContent(point.content)
        setEditingPointId(point.id)
        setIsAdding(false)
        setError(null)
    }

    const handleSavePoint = async () => {
        if (!newPointContent.trim()) {
            setError('Bullet point cannot be empty')
            return
        }

        try {
            if (editingPointId) {
                await resumeItemsApi.updateResumeItemPoint(editingPointId, {
                    content: newPointContent,
                    display_order: 0
                })
            } else {
                await resumeItemsApi.createResumeItemPoint({
                    resume_item_id: resumeItemId,
                    content: newPointContent,
                    display_order: points.length
                })
            }
            setNewPointContent('')
            setIsAdding(false)
            setEditingPointId(null)
            setError(null)
            onPointsUpdate()
        } catch (err) {
            setError(err.message || 'Failed to save bullet point')
        }
    }

    const handleDeletePoint = async (pointId) => {
        if (!window.confirm('Are you sure you want to delete this bullet point?')) {
            return
        }

        try {
            await resumeItemsApi.deleteResumeItemPoint(pointId)
            onPointsUpdate()
        } catch (err) {
            setError(err.message || 'Failed to delete bullet point')
        }
    }

    const handleCancel = () => {
        setIsAdding(false)
        setEditingPointId(null)
        setNewPointContent('')
        setError(null)
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, color: '#555', fontSize: '0.95rem', fontWeight: '600' }}>
                    Bullet Points ({points.length})
                </h4>
                {!isAdding && !editingPointId && (
                    <button
                        onClick={handleAddPoint}
                        style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                        }}
                    >
                        + Add Point
                    </button>
                )}
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    marginBottom: '0.75rem',
                    fontSize: '0.75rem'
                }}>
                    {error}
                </div>
            )}

            {(isAdding || editingPointId) && (
                <div style={{
                    backgroundColor: '#f9fff9',
                    border: '1px solid #4CAF50',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '0.75rem'
                }}>
                    <textarea
                        value={newPointContent}
                        onChange={(e) => setNewPointContent(e.target.value)}
                        placeholder="Enter your achievement or responsibility..."
                        style={{
                            width: '100%',
                            minHeight: '60px',
                            padding: '0.5rem',
                            fontSize: '0.875rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={handleSavePoint}
                            style={{
                                padding: '0.375rem 1rem',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '500'
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '0.375rem 1rem',
                                backgroundColor: '#f5f5f5',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {points.length === 0 && !isAdding && !editingPointId ? (
                <p style={{ color: '#999', fontSize: '0.875rem', fontStyle: 'italic', margin: '0.5rem 0' }}>
                    No bullet points yet. Add your key achievements and responsibilities.
                </p>
            ) : (
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {points.map((point) => (
                        <li
                            key={point.id}
                            style={{
                                marginBottom: '0.5rem',
                                color: '#444',
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <span style={{ flex: 1, paddingRight: '1rem' }}>{point.content}</span>
                                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                    <button
                                        onClick={() => handleEditPoint(point)}
                                        style={{
                                            padding: '0.15rem 0.5rem',
                                            backgroundColor: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeletePoint(point.id)}
                                        style={{
                                            padding: '0.15rem 0.5rem',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default BulletPointsEditor

