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

// Generate a tailored resume from job description (mock for now)
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

        // TODO: This will call your FastAPI service
        // For now, fetch the user's master resume and return it with mock selections
        
        const [user, skills, resumeItems] = await Promise.all([
            AuthModel.getUserById(userId),
            skillsModel.getUserSkills(userId),
            resumeItemsModel.getUserResumeItems(userId)
        ])

        // Fetch points for resume items
        const itemsWithPoints = await Promise.all(
            resumeItems.map(async (item) => {
                const points = await resumeItemPointsModel.getResumeItemPoints(item.id, userId)
                return { ...item, points }
            })
        )

        const experiences = itemsWithPoints.filter(item => item.item_type === 'experience')
        const projects = itemsWithPoints.filter(item => item.item_type === 'project')

        // Mock AI response - return user's actual data with IDs
        const mockResume = {
            contactInfo: {
                name: user.name || "John Doe",
                email: user.email,
                phone: user.phone || "(555) 123-4567"
            },
            skills: skills.flatMap(s => s.skills || []).slice(0, 8), // Take first 8 skills
            experiences: experiences.slice(0, 2).map(exp => ({
                id: exp.id, // ← Include ID for reference
                title: exp.title,
                company: exp.organization,
                startDate: exp.start_date || 'Start Date',
                endDate: exp.is_current ? 'Present' : (exp.end_date || 'End Date'),
                is_current: exp.is_current,
                points: exp.points.slice(0, 4).map(p => ({
                    id: p.id, // ← Include original point ID
                    content: p.content
                }))
            })),
            projects: projects.slice(0, 2).map(proj => ({
                id: proj.id, // ← Include ID for reference
                title: proj.title,
                date: proj.start_date || '2023',
                points: proj.points.slice(0, 3).map(p => ({
                    id: p.id, // ← Include original point ID
                    content: p.content
                }))
            })),
            education: [] // Can add education if needed
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        return res.status(200).json(mockResume)

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
