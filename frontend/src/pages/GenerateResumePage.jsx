import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeApi, curatedResumesApi } from '../services/api'
import TopNavBar from '@/components/TopNavBar'
import FeedbackVideoButton from '@/components/FeedbackVideoButton'
import { useAuthStore } from '@/stores/authStore'

const GenerateResumePage = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [jobDescription, setJobDescription] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedResume, setGeneratedResume] = useState(null)
    const [error, setError] = useState(null)
    const [editingSection, setEditingSection] = useState(null) // 'skill-X', 'exp-X', 'proj-X', etc.
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [savedResumeId, setSavedResumeId] = useState(null)

    const handleGenerate = async () => {
        if (!jobDescription.trim()) {
            setError('Please enter a job description')
            return
        }

        setIsGenerating(true)
        setError(null)
        
        try {
            const result = await resumeApi.generateResume({ jobDescription })
            setGeneratedResume(result)
        } catch (err) {
            setError(err.message || 'Failed to generate resume')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleReset = () => {
        setJobDescription('')
        setGeneratedResume(null)
        setError(null)
        setEditingSection(null)
        setSaveSuccess(false)
        setSavedResumeId(null)
    }

    const handleSaveResume = async () => {
        if (!generatedResume) return

        setIsSaving(true)
        setError(null)
        setSaveSuccess(false)

        try {
            console.log('Saving resume...')
            const resumeData = {
                title: `Resume for ${jobDescription.substring(0, 50)}...`,
                jobDescription: jobDescription,
                jobTitle: 'Job Title', // Can be extracted from job description
                jobCompany: 'Company', // Can be extracted from job description
                generationPrompt: jobDescription,
                modelUsed: 'mock', // Will be replaced with actual model when integrated
                generationNotes: 'AI-generated and potentially edited by user',
                contactInfo: generatedResume.contactInfo,
                skills: generatedResume.skills,
                experiences: generatedResume.experiences,
                projects: generatedResume.projects,
                education: generatedResume.education
            }

            console.log('Resume data to save:', resumeData)
            const result = await curatedResumesApi.createCuratedResume(resumeData)
            console.log('Save result:', result)
            
            setSavedResumeId(result.data.id)
            setSaveSuccess(true)

            // Auto-hide success message after 5 seconds
            setTimeout(() => setSaveSuccess(false), 5000)
        } catch (err) {
            console.error('Save error:', err)
            setError(err.message || 'Failed to save resume')
        } finally {
            setIsSaving(false)
        }
    }

    // Skills editing functions
    const handleDeleteSkill = (index) => {
        const newSkills = [...generatedResume.skills]
        newSkills.splice(index, 1)
        setGeneratedResume({ ...generatedResume, skills: newSkills })
    }

    const handleEditSkill = (index, newValue) => {
        const newSkills = [...generatedResume.skills]
        newSkills[index] = newValue
        setGeneratedResume({ ...generatedResume, skills: newSkills })
    }

    // Experience editing functions
    const handleDeleteExperience = (index) => {
        const newExperiences = [...generatedResume.experiences]
        newExperiences.splice(index, 1)
        setGeneratedResume({ ...generatedResume, experiences: newExperiences })
    }

    const handleEditExperience = (index, field, value) => {
        const newExperiences = [...generatedResume.experiences]
        newExperiences[index][field] = value
        setGeneratedResume({ ...generatedResume, experiences: newExperiences })
    }

    const handleDeleteExperiencePoint = (expIndex, pointIndex) => {
        const newExperiences = [...generatedResume.experiences]
        newExperiences[expIndex].points.splice(pointIndex, 1)
        setGeneratedResume({ ...generatedResume, experiences: newExperiences })
    }

    const handleEditExperiencePoint = (expIndex, pointIndex, value) => {
        const newExperiences = [...generatedResume.experiences]
        newExperiences[expIndex].points[pointIndex] = value
        setGeneratedResume({ ...generatedResume, experiences: newExperiences })
    }

    // Project editing functions
    const handleDeleteProject = (index) => {
        const newProjects = [...generatedResume.projects]
        newProjects.splice(index, 1)
        setGeneratedResume({ ...generatedResume, projects: newProjects })
    }

    const handleEditProject = (index, field, value) => {
        const newProjects = [...generatedResume.projects]
        newProjects[index][field] = value
        setGeneratedResume({ ...generatedResume, projects: newProjects })
    }

    const handleDeleteProjectPoint = (projIndex, pointIndex) => {
        const newProjects = [...generatedResume.projects]
        newProjects[projIndex].points.splice(pointIndex, 1)
        setGeneratedResume({ ...generatedResume, projects: newProjects })
    }

    const handleEditProjectPoint = (projIndex, pointIndex, value) => {
        const newProjects = [...generatedResume.projects]
        newProjects[projIndex].points[pointIndex] = value
        setGeneratedResume({ ...generatedResume, projects: newProjects })
    }

    // Education editing functions
    const handleDeleteEducation = (index) => {
        const newEducation = [...generatedResume.education]
        newEducation.splice(index, 1)
        setGeneratedResume({ ...generatedResume, education: newEducation })
    }

    const handleEditEducation = (index, field, value) => {
        const newEducation = [...generatedResume.education]
        newEducation[index][field] = value
        setGeneratedResume({ ...generatedResume, education: newEducation })
    }

    return (
        <>
            <TopNavBar />
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '2rem',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#333', marginBottom: '0.5rem' }}>
                            Generate Tailored Resume
                        </h1>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
                            Paste a job description and we'll generate a customized resume from your master resume
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f5f5f5',
                            color: '#333',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        ← Back to Profile
                    </button>
                </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: generatedResume ? '1fr 1fr' : '1fr',
                gap: '2rem'
            }}>
                {/* Job Description Input Section */}
                <div>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '2rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{
                            margin: '0 0 1rem 0',
                            fontSize: '1.25rem',
                            color: '#333'
                        }}>
                            Job Description
                        </h2>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            disabled={isGenerating}
                            style={{
                                width: '100%',
                                minHeight: '400px',
                                padding: '1rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '0.95rem',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                marginBottom: '1rem'
                            }}
                        />
                        
                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#fee',
                                color: '#c33',
                                borderRadius: '4px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !jobDescription.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: isGenerating || !jobDescription.trim() ? '#ccc' : '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isGenerating || !jobDescription.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            >
                                {isGenerating ? '🔄 Generating...' : '✨ Generate Resume'}
                            </button>
                            
                            {generatedResume && (
                                <button
                                    onClick={handleReset}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#f5f5f5',
                                        color: '#333',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Generated Resume Display Section */}
                {generatedResume && (
                    <div>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '2rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '1.25rem',
                                    color: '#333'
                                }}>
                                    Generated Resume
                                </h2>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {savedResumeId && (
                                        <FeedbackVideoButton 
                                            userId={user?.id}
                                            jobDescription={jobDescription}
                                            variant="outline"
                                            size="sm"
                                        />
                                    )}
                                    <button
                                        onClick={handleSaveResume}
                                        disabled={isSaving}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: isSaving ? '#ccc' : '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: isSaving ? 'not-allowed' : 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {isSaving ? '💾 Saving...' : '💾 Save Resume'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Placeholder for download functionality
                                            alert('Download functionality will be implemented when the backend is ready')
                                        }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        📥 Download PDF
                                    </button>
                                </div>
                            </div>

                            {saveSuccess && (
                                <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#d4edda',
                                    color: '#155724',
                                    borderRadius: '4px',
                                    marginBottom: '1rem',
                                    fontSize: '0.9rem'
                                }}>
                                    ✓ Resume saved successfully! ID: {savedResumeId}
                                </div>
                            )}

                            {/* Resume Content */}
                            <div style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '2rem',
                                backgroundColor: '#fafafa',
                                minHeight: '500px'
                            }}>
                                {/* Contact Information */}
                                {generatedResume.contactInfo && (
                                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.75rem', color: '#333' }}>
                                            {generatedResume.contactInfo.name}
                                        </h3>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                            {generatedResume.contactInfo.email} | {generatedResume.contactInfo.phone}
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                {generatedResume.skills && generatedResume.skills.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ 
                                            margin: '0 0 0.75rem 0', 
                                            fontSize: '1.1rem', 
                                            color: '#333',
                                            borderBottom: '2px solid #4CAF50',
                                            paddingBottom: '0.25rem'
                                        }}>
                                            SKILLS
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {generatedResume.skills.map((skill, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    backgroundColor: '#f0f0f0',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {editingSection === `skill-${idx}` ? (
                                                        <input
                                                            type="text"
                                                            value={skill}
                                                            onChange={(e) => handleEditSkill(idx, e.target.value)}
                                                            onBlur={() => setEditingSection(null)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    setEditingSection(null)
                                                                    e.target.blur()
                                                                }
                                                            }}
                                                            autoFocus
                                                            style={{
                                                                border: '1px solid #4CAF50',
                                                                padding: '0.25rem',
                                                                fontSize: '0.9rem',
                                                                borderRadius: '2px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <span style={{ color: '#555' }}>{skill}</span>
                                                            <button
                                                                onClick={() => setEditingSection(`skill-${idx}`)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '0 0.25rem',
                                                                    fontSize: '0.8rem'
                                                                }}
                                                                title="Edit skill"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSkill(idx)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '0 0.25rem',
                                                                    fontSize: '0.8rem',
                                                                    color: '#c33'
                                                                }}
                                                                title="Delete skill"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience */}
                                {generatedResume.experiences && generatedResume.experiences.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ 
                                            margin: '0 0 0.75rem 0', 
                                            fontSize: '1.1rem', 
                                            color: '#333',
                                            borderBottom: '2px solid #4CAF50',
                                            paddingBottom: '0.25rem'
                                        }}>
                                            EXPERIENCE
                                        </h4>
                                        {generatedResume.experiences.map((exp, idx) => (
                                            <div key={idx} style={{ 
                                                marginBottom: '1.5rem',
                                                padding: '1rem',
                                                backgroundColor: '#f9f9f9',
                                                borderRadius: '4px',
                                                position: 'relative'
                                            }}>
                                                <button
                                                    onClick={() => handleDeleteExperience(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        background: '#fee',
                                                        border: '1px solid #c33',
                                                        color: '#c33',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem'
                                                    }}
                                                    title="Delete experience"
                                                >
                                                    🗑️ Delete
                                                </button>
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', paddingRight: '5rem' }}>
                                                    {editingSection === `exp-title-${idx}` ? (
                                                        <input
                                                            type="text"
                                                            value={exp.title}
                                                            onChange={(e) => handleEditExperience(idx, 'title', e.target.value)}
                                                            onBlur={() => setEditingSection(null)}
                                                            onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                                                            autoFocus
                                                            style={{
                                                                fontSize: '1rem',
                                                                fontWeight: 'bold',
                                                                border: '1px solid #4CAF50',
                                                                padding: '0.25rem',
                                                                borderRadius: '2px',
                                                                flex: 1
                                                            }}
                                                        />
                                                    ) : (
                                                        <strong 
                                                            style={{ fontSize: '1rem', color: '#333', cursor: 'pointer' }}
                                                            onClick={() => setEditingSection(`exp-title-${idx}`)}
                                                            title="Click to edit"
                                                        >
                                                            {exp.title} ✏️
                                                        </strong>
                                                    )}
                                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                                        {exp.startDate} - {exp.endDate}
                                                    </span>
                                                </div>
                                                
                                                {editingSection === `exp-company-${idx}` ? (
                                                    <input
                                                        type="text"
                                                        value={exp.company}
                                                        onChange={(e) => handleEditExperience(idx, 'company', e.target.value)}
                                                        onBlur={() => setEditingSection(null)}
                                                        onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                                                        autoFocus
                                                        style={{
                                                            marginBottom: '0.5rem',
                                                            fontStyle: 'italic',
                                                            border: '1px solid #4CAF50',
                                                            padding: '0.25rem',
                                                            borderRadius: '2px',
                                                            width: '100%'
                                                        }}
                                                    />
                                                ) : (
                                                    <div 
                                                        style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: '#666', cursor: 'pointer' }}
                                                        onClick={() => setEditingSection(`exp-company-${idx}`)}
                                                        title="Click to edit"
                                                    >
                                                        {exp.company} ✏️
                                                    </div>
                                                )}
                                                
                                                {exp.points && exp.points.length > 0 && (
                                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#555', fontSize: '0.9rem' }}>
                                                        {exp.points.map((point, pIdx) => {
                                                                            const pointContent = typeof point === 'string' ? point : point.content
                                                                            return (
                                                            <li key={pIdx} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                {editingSection === `exp-point-${idx}-${pIdx}` ? (
                                                                    <textarea
                                                                        value={pointContent}
                                                                        onChange={(e) => handleEditExperiencePoint(idx, pIdx, e.target.value)}
                                                                        onBlur={() => setEditingSection(null)}
                                                                        autoFocus
                                                                        style={{
                                                                            flex: 1,
                                                                            border: '1px solid #4CAF50',
                                                                            padding: '0.25rem',
                                                                            borderRadius: '2px',
                                                                            fontSize: '0.9rem',
                                                                            fontFamily: 'inherit',
                                                                            resize: 'vertical',
                                                                            minHeight: '3rem'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <span 
                                                                            style={{ flex: 1, cursor: 'pointer' }}
                                                                            onClick={() => setEditingSection(`exp-point-${idx}-${pIdx}`)}
                                                                            title="Click to edit"
                                                                        >
                                                                            {pointContent}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleDeleteExperiencePoint(idx, pIdx)}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                color: '#c33',
                                                                                fontSize: '0.9rem',
                                                                                padding: 0
                                                                            }}
                                                                            title="Delete bullet point"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Projects */}
                                {generatedResume.projects && generatedResume.projects.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ 
                                            margin: '0 0 0.75rem 0', 
                                            fontSize: '1.1rem', 
                                            color: '#333',
                                            borderBottom: '2px solid #4CAF50',
                                            paddingBottom: '0.25rem'
                                        }}>
                                            PROJECTS
                                        </h4>
                                        {generatedResume.projects.map((project, idx) => (
                                            <div key={idx} style={{ 
                                                marginBottom: '1.5rem',
                                                padding: '1rem',
                                                backgroundColor: '#f9f9f9',
                                                borderRadius: '4px',
                                                position: 'relative'
                                            }}>
                                                <button
                                                    onClick={() => handleDeleteProject(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        background: '#fee',
                                                        border: '1px solid #c33',
                                                        color: '#c33',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem'
                                                    }}
                                                    title="Delete project"
                                                >
                                                    🗑️ Delete
                                                </button>
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', paddingRight: '5rem' }}>
                                                    {editingSection === `proj-title-${idx}` ? (
                                                        <input
                                                            type="text"
                                                            value={project.title}
                                                            onChange={(e) => handleEditProject(idx, 'title', e.target.value)}
                                                            onBlur={() => setEditingSection(null)}
                                                            onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                                                            autoFocus
                                                            style={{
                                                                fontSize: '1rem',
                                                                fontWeight: 'bold',
                                                                border: '1px solid #4CAF50',
                                                                padding: '0.25rem',
                                                                borderRadius: '2px',
                                                                flex: 1
                                                            }}
                                                        />
                                                    ) : (
                                                        <strong 
                                                            style={{ fontSize: '1rem', color: '#333', cursor: 'pointer' }}
                                                            onClick={() => setEditingSection(`proj-title-${idx}`)}
                                                            title="Click to edit"
                                                        >
                                                            {project.title} ✏️
                                                        </strong>
                                                    )}
                                                    {project.date && (
                                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                                            {project.date}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {project.points && project.points.length > 0 && (
                                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#555', fontSize: '0.9rem' }}>
                                                        {project.points.map((point, pIdx) => {
                                                                            const pointContent = typeof point === 'string' ? point : point.content
                                                                            return (
                                                            <li key={pIdx} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                {editingSection === `proj-point-${idx}-${pIdx}` ? (
                                                                    <textarea
                                                                        value={pointContent}
                                                                        onChange={(e) => handleEditProjectPoint(idx, pIdx, e.target.value)}
                                                                        onBlur={() => setEditingSection(null)}
                                                                        autoFocus
                                                                        style={{
                                                                            flex: 1,
                                                                            border: '1px solid #4CAF50',
                                                                            padding: '0.25rem',
                                                                            borderRadius: '2px',
                                                                            fontSize: '0.9rem',
                                                                            fontFamily: 'inherit',
                                                                            resize: 'vertical',
                                                                            minHeight: '3rem'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <span 
                                                                            style={{ flex: 1, cursor: 'pointer' }}
                                                                            onClick={() => setEditingSection(`proj-point-${idx}-${pIdx}`)}
                                                                            title="Click to edit"
                                                                        >
                                                                            {pointContent}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleDeleteProjectPoint(idx, pIdx)}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                color: '#c33',
                                                                                fontSize: '0.9rem',
                                                                                padding: 0
                                                                            }}
                                                                            title="Delete bullet point"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Education */}
                                {generatedResume.education && generatedResume.education.length > 0 && (
                                    <div>
                                        <h4 style={{ 
                                            margin: '0 0 0.75rem 0', 
                                            fontSize: '1.1rem', 
                                            color: '#333',
                                            borderBottom: '2px solid #4CAF50',
                                            paddingBottom: '0.25rem'
                                        }}>
                                            EDUCATION
                                        </h4>
                                        {generatedResume.education.map((edu, idx) => (
                                            <div key={idx} style={{ 
                                                marginBottom: '1rem',
                                                padding: '1rem',
                                                backgroundColor: '#f9f9f9',
                                                borderRadius: '4px',
                                                position: 'relative'
                                            }}>
                                                <button
                                                    onClick={() => handleDeleteEducation(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        background: '#fee',
                                                        border: '1px solid #c33',
                                                        color: '#c33',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem'
                                                    }}
                                                    title="Delete education"
                                                >
                                                    🗑️ Delete
                                                </button>
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '5rem' }}>
                                                    <div style={{ flex: 1 }}>
                                                        {editingSection === `edu-degree-${idx}` ? (
                                                            <input
                                                                type="text"
                                                                value={edu.degree || ''}
                                                                onChange={(e) => handleEditEducation(idx, 'degree', e.target.value)}
                                                                onBlur={() => setEditingSection(null)}
                                                                onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                                                                autoFocus
                                                                style={{
                                                                    fontSize: '1rem',
                                                                    fontWeight: 'bold',
                                                                    border: '1px solid #4CAF50',
                                                                    padding: '0.25rem',
                                                                    borderRadius: '2px',
                                                                    width: '100%',
                                                                    marginBottom: '0.25rem'
                                                                }}
                                                            />
                                                        ) : (
                                                            <strong 
                                                                style={{ fontSize: '1rem', color: '#333', cursor: 'pointer', display: 'block' }}
                                                                onClick={() => setEditingSection(`edu-degree-${idx}`)}
                                                                title="Click to edit"
                                                            >
                                                                {edu.degree || 'No degree specified'} ✏️
                                                            </strong>
                                                        )}
                                                        
                                                        {editingSection === `edu-institution-${idx}` ? (
                                                            <input
                                                                type="text"
                                                                value={edu.institution || ''}
                                                                onChange={(e) => handleEditEducation(idx, 'institution', e.target.value)}
                                                                onBlur={() => setEditingSection(null)}
                                                                onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                                                                autoFocus
                                                                style={{
                                                                    fontStyle: 'italic',
                                                                    fontSize: '0.9rem',
                                                                    border: '1px solid #4CAF50',
                                                                    padding: '0.25rem',
                                                                    borderRadius: '2px',
                                                                    width: '100%'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div 
                                                                style={{ fontStyle: 'italic', color: '#666', fontSize: '0.9rem', cursor: 'pointer' }}
                                                                onClick={() => setEditingSection(`edu-institution-${idx}`)}
                                                                title="Click to edit"
                                                            >
                                                                {edu.institution || 'No institution specified'} ✏️
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {(edu.year || edu.graduationDate) && (
                                                        editingSection === `edu-year-${idx}` ? (
                                                            <input
                                                                type="text"
                                                                value={edu.year || edu.graduationDate || ''}
                                                                onChange={(e) => handleEditEducation(idx, 'year', e.target.value)}
                                                                onBlur={() => setEditingSection(null)}
                                                                onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                                                                autoFocus
                                                                style={{
                                                                    fontSize: '0.85rem',
                                                                    border: '1px solid #4CAF50',
                                                                    padding: '0.25rem',
                                                                    borderRadius: '2px',
                                                                    width: '80px'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span 
                                                                style={{ fontSize: '0.85rem', color: '#666', cursor: 'pointer' }}
                                                                onClick={() => setEditingSection(`edu-year-${idx}`)}
                                                                title="Click to edit"
                                                            >
                                                                {edu.year || edu.graduationDate} ✏️
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </>
    )
}

export default GenerateResumePage

