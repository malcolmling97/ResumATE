import { useState } from "react"
import TailoredResumeEditor from "@/components/ResumeEditor"
import { sampleGeneratedResume } from "@/sample-generated-resume"

/**
 * Standalone demo page for ResumeEditor component
 * This page loads sample data directly without any API calls
 * Useful for UI development and testing
 */
const ResumeEditorDemo = () => {
  const [resume, setResume] = useState(sampleGeneratedResume)

  const handleJobDescriptionChange = (id, value) => {
    console.log('Job description changed:', value)
    setResume(prev => ({ ...prev, jobDescription: value }))
  }

  const handleItemSave = (itemId, editedBullets) => {
    console.log('Item saved:', itemId, editedBullets)
    setResume(prev => {
      const updatedWorkExperience = prev.workExperience?.map((item) =>
        item.id === itemId ? { ...item, bullets: editedBullets } : item
      )
      const updatedProjects = prev.projects?.map((item) =>
        item.id === itemId ? { ...item, bullets: editedBullets } : item
      )
      return {
        ...prev,
        workExperience: updatedWorkExperience,
        projects: updatedProjects,
      }
    })
  }

  const handleSaveResume = async () => {
    console.log('Saving resume:', resume)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Resume saved (demo mode)')
  }

  const handleUpdateExperience = (index, field, value) => {
    console.log('Update experience:', index, field, value)
    setResume(prev => {
      const updatedWorkExperience = [...prev.workExperience]
      updatedWorkExperience[index] = {
        ...updatedWorkExperience[index],
        [field]: value
      }
      return { ...prev, workExperience: updatedWorkExperience }
    })
  }

  const handleDeleteExperience = (index) => {
    console.log('Delete experience:', index)
    setResume(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateProject = (index, field, value) => {
    console.log('Update project:', index, field, value)
    setResume(prev => {
      const updatedProjects = [...prev.projects]
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      }
      return { ...prev, projects: updatedProjects }
    })
  }

  const handleDeleteProject = (index) => {
    console.log('Delete project:', index)
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateEducation = (index, field, value) => {
    console.log('Update education:', index, field, value)
    setResume(prev => {
      const updatedEducation = [...prev.education]
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      }
      return { ...prev, education: updatedEducation }
    })
  }

  const handleDeleteEducation = (index) => {
    console.log('Delete education:', index)
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateSkill = (index, value) => {
    console.log('Update skill:', index, value)
    setResume(prev => {
      const updatedSkills = [...prev.skills]
      updatedSkills[index] = value
      return { ...prev, skills: updatedSkills }
    })
  }

  const handleDeleteSkill = (index) => {
    console.log('Delete skill:', index)
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const handleItemRegenerate = (itemId) => {
    console.log('Regenerate item:', itemId)
    alert('Regenerate functionality (demo mode)')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-amber-800">
            🧪 <strong>Demo Mode:</strong> Using sample data - No API calls are made
          </p>
        </div>
      </div>

      {/* Editor */}
      <TailoredResumeEditor
        resume={resume}
        onJobDescriptionChange={handleJobDescriptionChange}
        onItemSave={handleItemSave}
        onItemRegenerate={handleItemRegenerate}
        onSaveResume={handleSaveResume}
        isUnsaved={true}
        onUpdateExperience={handleUpdateExperience}
        onDeleteExperience={handleDeleteExperience}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onUpdateEducation={handleUpdateEducation}
        onDeleteEducation={handleDeleteEducation}
        onUpdateSkill={handleUpdateSkill}
        onDeleteSkill={handleDeleteSkill}
      />
    </div>
  )
}

export default ResumeEditorDemo

