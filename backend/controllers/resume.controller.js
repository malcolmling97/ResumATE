import resumeItemsModel from "../models/resumeItems.model.js"
import resumeItemPointsModel from "../models/resumeItemPoints.model.js"
import skillsModel from "../models/skills.model.js"
import educationModel from "../models/education.model.js"
import AuthModel from "../models/auth.model.js"

// Get user's complete master resume
export const getMasterResume = async (req, res) => {
    try {
        const userId = req.user.id

        // Fetch all master resume data
        const [user, skills, education, resumeItems] = await Promise.all([
            AuthModel.getUserById(userId),
            skillsModel.getUserSkills(userId),
            educationModel.getUserEducation(userId),
            resumeItemsModel.getUserResumeItems(userId)
        ])

        // Fetch bullet points for each resume item
        const itemsWithPoints = await Promise.all(
            resumeItems.map(async (item) => {
                const points = await resumeItemPointsModel.getResumeItemPoints(item.id, userId)
                return {
                    ...item,
                    points: points.map(p => ({
                        id: p.id,
                        content: p.content,
                        display_order: p.display_order,
                        usage_count: p.usage_count
                    }))
                }
            })
        )

        // Organize by type
        const experiences = itemsWithPoints.filter(item => item.item_type === 'experience')
        const projects = itemsWithPoints.filter(item => item.item_type === 'project')

        const masterResume = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                about: user.about
            },
            skills: skills.map(s => ({
                id: s.id,
                category: s.category,
                skills: s.skills
            })),
            education: education.map(e => ({
                id: e.id,
                institution: e.institution,
                degree: e.degree,
                field_of_study: e.field_of_study,
                start_date: e.start_date,
                end_date: e.end_date,
                grade: e.grade,
                activities: e.activities,
                description: e.description
            })),
            experiences,
            projects
        }

        return res.status(200).json({
            success: true,
            data: masterResume
        })
    } catch (error) {
        console.error('Error fetching master resume:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch master resume',
            error: error.message
        })
    }
}

// Generate a tailored resume from job description using FastAPI AI service
export const generateResume = async (req, res) => {
    try {
        const { jobDescription } = req.body
        const userId = req.user.id

        if (!jobDescription) {
            return res.status(400).json({
                success: false,
                message: 'Job description is required'
            })
        }

        // Get FastAPI URL from environment or use default
        const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'
        
        console.log(`Calling FastAPI service at ${FASTAPI_URL}/api/generate-full-resume`)

        // Call FastAPI service for AI-powered resume generation
        const fastApiResponse = await fetch(`${FASTAPI_URL}/api/generate-full-resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                job_description: jobDescription
            })
        })

        if (!fastApiResponse.ok) {
            const errorText = await fastApiResponse.text()
            console.error('FastAPI error response:', errorText)
            throw new Error(`FastAPI service error: ${fastApiResponse.status} - ${errorText}`)
        }

        const aiGeneratedResume = await fastApiResponse.json()
        
        console.log('Successfully generated resume via FastAPI')
        console.log('AI-selected skills:', aiGeneratedResume.skills)

        // Fetch the user's resume items to map IDs
        const resumeItems = await resumeItemsModel.getUserResumeItems(userId)

        // Fetch points for resume items
        const itemsWithPoints = await Promise.all(
            resumeItems.map(async (item) => {
                const points = await resumeItemPointsModel.getResumeItemPoints(item.id, userId)
                return { ...item, points }
            })
        )

        // Map AI-generated experiences back to database IDs
        const experiencesWithIds = aiGeneratedResume.experiences.map(exp => {
            const matchingItem = itemsWithPoints.find(item => 
                item.item_type === 'experience' && 
                item.title === exp.title &&
                item.organization === exp.company
            )
            
            return {
                id: matchingItem?.id || `exp-${Date.now()}-${Math.random()}`,
                title: exp.title,
                company: exp.company,
                startDate: exp.startDate,
                endDate: exp.endDate,
                points: exp.points.map((point, idx) => {
                    const matchingPoint = matchingItem?.points.find(p => p.content === point)
                    return {
                        id: matchingPoint?.id || `point-${Date.now()}-${idx}`,
                        content: point
                    }
                })
            }
        })

        // Map AI-generated projects back to database IDs
        const projectsWithIds = aiGeneratedResume.projects.map(proj => {
            const matchingItem = itemsWithPoints.find(item => 
                item.item_type === 'project' && 
                item.title === proj.title
            )
            
            return {
                id: matchingItem?.id || `proj-${Date.now()}-${Math.random()}`,
                title: proj.title,
                date: proj.date,
                points: proj.points.map((point, idx) => {
                    const matchingPoint = matchingItem?.points.find(p => p.content === point)
                    return {
                        id: matchingPoint?.id || `point-${Date.now()}-${idx}`,
                        content: point
                    }
                })
            }
        })

        // Return AI-generated resume with skills from AI response
        return res.status(200).json({
            contactInfo: aiGeneratedResume.contactInfo,
            skills: aiGeneratedResume.skills, // ← Skills come from AI, not database
            experiences: experiencesWithIds,
            projects: projectsWithIds,
            education: aiGeneratedResume.education
        })

    } catch (error) {
        console.error('Error generating resume:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to generate resume',
            error: error.message
        })
    }
}

export default {
    getMasterResume,
    generateResume
}
