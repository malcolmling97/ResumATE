import { useState } from "react"
import { mockResumes } from "../sample"

/**
 * Custom hook to manage resume state and operations
 * This centralizes resume-related logic and makes it reusable
 */
export const useResumes = (initialResumeId = null) => {
  const [resumes, setResumes] = useState(mockResumes)
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId)

  const selectedResume = resumes.find((r) => r.id === selectedResumeId)

  const selectResume = (resumeId) => {
    setSelectedResumeId(resumeId)
  }

  const createNewResume = () => {
    // Clear selection to show empty state
    setSelectedResumeId(null)
    // TODO: In the future, create a new resume and add to state
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

  const regenerateItem = (itemId) => {
    // TODO: Implement AI regeneration
    console.log("Regenerating item:", itemId)
  }

  return {
    resumes,
    selectedResume,
    selectedResumeId,
    selectResume,
    createNewResume,
    updateJobDescription,
    updateResumeItem,
    regenerateItem,
  }
}

