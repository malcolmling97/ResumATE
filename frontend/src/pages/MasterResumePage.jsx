import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExperiencesSection from '../components/ExperiencesSection'
import ProjectsSection from '../components/ProjectsSection'

const MasterResumePage = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('experiences')

    const tabStyle = (isActive) => ({
        flex: 1,
        padding: '0.75rem 1.5rem',
        backgroundColor: isActive ? '#4CAF50' : '#f5f5f5',
        color: isActive ? 'white' : '#666',
        border: 'none',
        borderBottom: isActive ? 'none' : '2px solid #ddd',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s'
    })

    return (
        <div style={{
            maxWidth: '1200px',
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
                <div>
                    <h1 style={{ margin: 0, color: '#333', marginBottom: '0.5rem' }}>
                        Master Resume
                    </h1>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
                        Add your experiences and projects here. This is your master data that can be tailored for specific jobs.
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

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 0,
                marginBottom: '2rem',
                borderBottom: '1px solid #ddd'
            }}>
                <button
                    onClick={() => setActiveTab('experiences')}
                    style={tabStyle(activeTab === 'experiences')}
                >
                    💼 Work Experiences
                </button>
                <button
                    onClick={() => setActiveTab('projects')}
                    style={tabStyle(activeTab === 'projects')}
                >
                    🚀 Projects
                </button>
            </div>

            {/* Content */}
            {activeTab === 'experiences' && <ExperiencesSection />}
            {activeTab === 'projects' && <ProjectsSection />}
        </div>
    )
}

export default MasterResumePage

