import { useState } from "react"
import { resumeApi, curatedResumesApi } from "../services/api"

/**
 * Custom hook to manage resume state and operations
 * This centralizes resume-related logic and makes it reusable
 */
export const useResumes = (initialResumeId = null) => {
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const [error, setError] = useState(null)

  const selectedResume = resumes.find((r) => r.id === selectedResumeId)

  const selectResume = async (resumeId) => {
    setSelectedResumeId(resumeId)
    
    // Check if we need to load full resume data
    const resume = resumes.find(r => r.id === resumeId)
    if (resume && !resume.fullyLoaded && !resume.isUnsaved) {
      // Load full resume data from API
      setIsLoadingResume(true)
      try {
        const fullResume = await curatedResumesApi.getCuratedResumeById(resumeId)
        
        console.log('Full resume data from API:', fullResume.data)
        console.log('Experiences:', fullResume.data.experiences)
        console.log('Projects:', fullResume.data.projects)
        console.log('Education:', fullResume.data.education)
        console.log('Skills:', fullResume.data.skills)
        console.log('Contact Info:', fullResume.data.contactInfo)
        
        // Transform and update the resume in state
        setResumes(prev => prev.map(r => {
          if (r.id !== resumeId) return r
          
          const transformedResume = {
            ...r,
            jobDescription: fullResume.data.job_description || r.jobDescription,
            contactInfo: fullResume.data.contactInfo || {},
            skills: fullResume.data.skills || [],
            workExperience: fullResume.data.experiences?.map((exp, idx) => ({
              id: exp.id || `exp-${idx}`,
              title: exp.title,
              company: exp.company,
              startDate: exp.startDate || exp.start_date,
              endDate: exp.endDate || exp.end_date,
              bullets: Array.isArray(exp.points) 
                ? exp.points.map(p => typeof p === 'string' ? p : p.content)
                : []
            })) || [],
            projects: fullResume.data.projects?.map((proj, idx) => ({
              id: proj.id || `proj-${idx}`,
              title: proj.title,
              date: proj.date,
              bullets: Array.isArray(proj.points)
                ? proj.points.map(p => typeof p === 'string' ? p : p.content)
                : []
            })) || [],
            education: fullResume.data.education || [],
            fullyLoaded: true
          }
          
          console.log('Transformed resume:', transformedResume)
          return transformedResume
        }))
      } catch (err) {
        console.error('Failed to load full resume details:', err)
        setError('Failed to load resume details')
      } finally {
        setIsLoadingResume(false)
      }
    }
  }

  const createNewResume = () => {
    // Clear selection to show empty state
    setSelectedResumeId(null)
    setError(null)
  }

  const generateResume = async (jobDescription) => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return null
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      const result = await resumeApi.generateResume({ jobDescription })
      
      // Create a new resume object from the generated result
      const newResume = {
        id: `temp-${Date.now()}`, // Temporary ID until saved
        title: `Resume for ${jobDescription.substring(0, 50)}...`,
        jobDescription: jobDescription,
        contactInfo: result.contactInfo,
        skills: result.skills,
        workExperience: result.experiences?.map((exp) => ({
          id: exp.id, // Use actual ID from backend
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          bullets: exp.points?.map(point => 
            typeof point === 'string' ? point : point.content
          ) || []
        })) || [],
        projects: result.projects?.map((proj) => ({
          id: proj.id, // Use actual ID from backend
          title: proj.title,
          date: proj.date,
          bullets: proj.points?.map(point => 
            typeof point === 'string' ? point : point.content
          ) || []
        })) || [],
        education: result.education,
        isUnsaved: true, // Mark as unsaved
        fullyLoaded: true, // Already has all data from generation
        rawGenerated: result // Store raw generated data
      }

      // Add to resumes list
      setResumes(prev => [newResume, ...prev])
      setSelectedResumeId(newResume.id)
      
      return newResume
    } catch (err) {
      setError(err.message || 'Failed to generate resume')
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const saveResume = async (resumeId) => {
    const resume = resumes.find(r => r.id === resumeId)
    if (!resume) return null

    setError(null)

    try {
      const resumeData = {
        title: resume.title,
        jobDescription: resume.jobDescription,
        jobTitle: 'Job Title', // Can be extracted from job description
        jobCompany: 'Company', // Can be extracted from job description
        generationPrompt: resume.jobDescription,
        modelUsed: 'mock', // Will be replaced with actual model when integrated
        generationNotes: 'AI-generated and potentially edited by user',
        contactInfo: resume.contactInfo,
        skills: resume.skills,
        experiences: resume.workExperience?.map(exp => ({
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          points: exp.bullets
        })) || [],
        projects: resume.projects?.map(proj => ({
          title: proj.title,
          date: proj.date,
          points: proj.bullets
        })) || [],
        education: resume.education
      }

      const result = await curatedResumesApi.createCuratedResume(resumeData)
      
      // Update the resume with the saved ID, keeping all data
      const newResumeId = result.data.id
      setResumes(prev => prev.map(r => 
        r.id === resumeId 
          ? { 
              ...r, // Preserve all existing data
              id: newResumeId, 
              isUnsaved: false,
              fullyLoaded: true // Keep data loaded since we just sent it
            }
          : r
      ))
      
      // Update selected resume ID if this was the selected one
      if (selectedResumeId === resumeId) {
        setSelectedResumeId(newResumeId)
      }

      return newResumeId
    } catch (err) {
      setError(err.message || 'Failed to save resume')
      return null
    }
  }

  const updateJobDescription = (resumeId, newDescription) => {
    setResumes((prev) =>
      prev.map((resume) =>
        resume.id === resumeId
          ? { ...resume, jobDescription: newDescription }
          : resume
      )
    )
  }

  const updateResumeItem = (resumeId, itemId, newBullets) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume

        // Update work experience
        const updatedWorkExperience = resume.workExperience?.map((item) =>
          item.id === itemId ? { ...item, bullets: newBullets } : item
        )

        // Update projects
        const updatedProjects = resume.projects?.map((item) =>
          item.id === itemId ? { ...item, bullets: newBullets } : item
        )

        return {
          ...resume,
          workExperience: updatedWorkExperience,
          projects: updatedProjects,
        }
      })
    )
  }

  const updateExperience = (resumeId, index, field, value) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedWorkExperience = [...resume.workExperience]
        updatedWorkExperience[index] = {
          ...updatedWorkExperience[index],
          [field]: value
        }
        return { ...resume, workExperience: updatedWorkExperience }
      })
    )
  }

  const deleteExperience = (resumeId, index) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedWorkExperience = resume.workExperience.filter((_, i) => i !== index)
        return { ...resume, workExperience: updatedWorkExperience }
      })
    )
  }

  const updateProject = (resumeId, index, field, value) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedProjects = [...resume.projects]
        updatedProjects[index] = {
          ...updatedProjects[index],
          [field]: value
        }
        return { ...resume, projects: updatedProjects }
      })
    )
  }

  const deleteProject = (resumeId, index) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedProjects = resume.projects.filter((_, i) => i !== index)
        return { ...resume, projects: updatedProjects }
      })
    )
  }

  const updateEducation = (resumeId, index, field, value) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedEducation = [...resume.education]
        updatedEducation[index] = {
          ...updatedEducation[index],
          [field]: value
        }
        return { ...resume, education: updatedEducation }
      })
    )
  }

  const deleteEducation = (resumeId, index) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedEducation = resume.education.filter((_, i) => i !== index)
        return { ...resume, education: updatedEducation }
      })
    )
  }

  const updateSkill = (resumeId, index, value) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedSkills = [...resume.skills]
        updatedSkills[index] = value
        return { ...resume, skills: updatedSkills }
      })
    )
  }

  const deleteSkill = (resumeId, index) => {
    setResumes((prev) =>
      prev.map((resume) => {
        if (resume.id !== resumeId) return resume
        const updatedSkills = resume.skills.filter((_, i) => i !== index)
        return { ...resume, skills: updatedSkills }
      })
    )
  }

  const regenerateItem = (itemId) => {
    // TODO: Implement AI regeneration
    console.log("Regenerating item:", itemId)
  }

  const loadCuratedResumes = async () => {
    try {
      const result = await curatedResumesApi.getUserCuratedResumes()
      // Only load metadata - full data will be loaded when resume is selected
      const transformedResumes = result.data?.map(resume => ({
        id: resume.id,
        title: resume.title,
        jobTitle: resume.job_title,
        jobCompany: resume.job_company,
        status: resume.status,
        createdAt: resume.created_at,
        isUnsaved: false,
        fullyLoaded: false // Mark as needing full data load
      })) || []
      
      setResumes(transformedResumes)
    } catch (err) {
      console.error('Failed to load curated resumes:', err)
      setError('Failed to load saved resumes')
    }
  }

  const deleteResume = async (resumeId) => {
    setError(null)
    
    try {
      // Check if resume is unsaved (temporary)
      const resume = resumes.find(r => r.id === resumeId)
      if (resume?.isUnsaved) {
        // Just remove from state if unsaved
        setResumes(prev => prev.filter(r => r.id !== resumeId))
        if (selectedResumeId === resumeId) {
          setSelectedResumeId(null)
        }
        return true
      }

      // Otherwise, delete from backend
      await curatedResumesApi.deleteCuratedResume(resumeId)
      
      // Remove from state
      setResumes(prev => prev.filter(r => r.id !== resumeId))
      
      // Clear selection if this was the selected resume
      if (selectedResumeId === resumeId) {
        setSelectedResumeId(null)
      }
      
      return true
    } catch (err) {
      console.error('Failed to delete resume:', err)
      setError(err.message || 'Failed to delete resume')
      return false
    }
  }

  return {
    resumes,
    selectedResume,
    selectedResumeId,
    isGenerating,
    isLoadingResume,
    error,
    selectResume,
    createNewResume,
    generateResume,
    saveResume,
    deleteResume,
    updateJobDescription,
    updateResumeItem,
    updateExperience,
    deleteExperience,
    updateProject,
    deleteProject,
    updateEducation,
    deleteEducation,
    updateSkill,
    deleteSkill,
    regenerateItem,
    loadCuratedResumes,
    setError,
  }
}

