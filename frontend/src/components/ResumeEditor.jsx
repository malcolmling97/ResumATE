import { useState } from "react"
import { Save, Download, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import ExperienceCard from "@/components/ExperienceCard"
import EducationCard from "@/components/EducationCard"
import SkillsBadge from "@/components/SkillsBadge"
import FeedbackVideoButton from "@/components/FeedbackVideoButton"
import { useAuthStore } from "@/stores/authStore"

const TailoredResumeEditor = ({ 
  resume, 
  onJobDescriptionChange, 
  onItemSave, 
  onItemRegenerate,
  onSaveResume,
  isUnsaved = false,
  onUpdateExperience,
  onDeleteExperience,
  onUpdateProject,
  onDeleteProject,
  onUpdateEducation,
  onDeleteEducation,
  onUpdateSkill,
  onDeleteSkill,
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { user } = useAuthStore()

  if (!resume) return null

  // Debug logging
  console.log('ResumeEditor - Full resume object:', resume)
  console.log('ResumeEditor - workExperience:', resume.workExperience)
  console.log('ResumeEditor - projects:', resume.projects)
  console.log('ResumeEditor - education:', resume.education)
  console.log('ResumeEditor - skills:', resume.skills)

  const handleSave = async () => {
    if (!onSaveResume) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await onSaveResume()
      setSaveSuccess(true)
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save resume:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    // Placeholder for download functionality
    alert('Download functionality will be implemented when the backend is ready')
  }

  // Transform workExperience data to match ExperienceCard expectations
  const transformExperienceForCard = (exp) => ({
    ...exp,
    organization: exp.company,
    start_date: exp.startDate,
    end_date: exp.endDate,
    is_current: exp.endDate === 'Present' || !exp.endDate,
    points: exp.bullets?.map((bullet, idx) => ({
      id: `${exp.id}-bullet-${idx}`,
      content: typeof bullet === 'string' ? bullet : bullet.content
    })) || []
  })

  // Transform project data to match ExperienceCard expectations
  const transformProjectForCard = (proj) => ({
    ...proj,
    organization: proj.date || '',
    start_date: proj.date,
    end_date: proj.date,
    is_current: false,
    points: proj.bullets?.map((bullet, idx) => ({
      id: `${proj.id}-bullet-${idx}`,
      content: typeof bullet === 'string' ? bullet : bullet.content
    })) || []
  })

  // Handler for updating bullet points
  const handleUpdateBulletPoint = (expIndex, pointId, newContent) => {
    const exp = resume.workExperience[expIndex]
    const newBullets = exp.bullets.map((bullet, idx) => {
      const bulletId = `${exp.id}-bullet-${idx}`
      return bulletId === pointId ? newContent : bullet
    })
    onItemSave?.(exp.id, newBullets)
  }

  const handleAddBulletPoint = (expIndex, newContent) => {
    const exp = resume.workExperience[expIndex]
    const newBullets = [...(exp.bullets || []), newContent]
    onItemSave?.(exp.id, newBullets)
  }

  const handleDeleteBulletPoint = (expIndex, pointId) => {
    const exp = resume.workExperience[expIndex]
    const pointIndex = parseInt(pointId.split('-bullet-')[1])
    const newBullets = exp.bullets.filter((_, idx) => idx !== pointIndex)
    onItemSave?.(exp.id, newBullets)
  }

  const handleUpdateProjectBulletPoint = (projIndex, pointId, newContent) => {
    const proj = resume.projects[projIndex]
    const newBullets = proj.bullets.map((bullet, idx) => {
      const bulletId = `${proj.id}-bullet-${idx}`
      return bulletId === pointId ? newContent : bullet
    })
    onItemSave?.(proj.id, newBullets)
  }

  const handleAddProjectBulletPoint = (projIndex, newContent) => {
    const proj = resume.projects[projIndex]
    const newBullets = [...(proj.bullets || []), newContent]
    onItemSave?.(proj.id, newBullets)
  }

  const handleDeleteProjectBulletPoint = (projIndex, pointId) => {
    const proj = resume.projects[projIndex]
    const pointIndex = parseInt(pointId.split('-bullet-')[1])
    const newBullets = proj.bullets.filter((_, idx) => idx !== pointIndex)
    onItemSave?.(proj.id, newBullets)
  }

  // Normalize skills data - ensure they're objects with name property
  const normalizeSkill = (skill) => {
    if (typeof skill === 'string') {
      return { name: skill, level: null }
    }
    return skill
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="space-y-8">
        {/* Header with Title and Actions */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-balance">{resume.title}</h1>
            {isUnsaved && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠ Unsaved resume - Click "Save Resume" to persist your changes
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {saveSuccess && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm">
                <Check className="h-4 w-4" />
                Saved!
              </div>
            )}
            <FeedbackVideoButton 
              userId={user?.id}
              jobDescription={resume.jobDescription}
              variant="outline" 
              size="sm"
            />
            <Button 
              variant="default" 
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Resume'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Job Description */}
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Job Description</h3>
          <Textarea
            placeholder="Enter job description here..."
            className="min-h-32 max-h-64 resize-none border-0 p-0 focus-visible:ring-0 text-sm leading-relaxed overflow-y-auto"
            defaultValue={resume.jobDescription}
            onChange={(e) => onJobDescriptionChange?.(resume.id, e.target.value)}
          />
        </Card>

        {/* Contact Info */}
        {resume.contactInfo && (
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Contact Information</h3>
            <div>
              <p className="text-xl font-bold">{resume.contactInfo.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {resume.contactInfo.email} | {resume.contactInfo.phone}
              </p>
            </div>
          </Card>
        )}


        {/* Education Section */}
        {resume.education && Array.isArray(resume.education) && resume.education.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Education</h3>
            <div className="space-y-4">
              {resume.education.map((edu, idx) => (
                <EducationCard
                  key={idx}
                  education={edu}
                  mode="inline"
                  onUpdate={(field, value) => onUpdateEducation?.(idx, field, value)}
                  onDelete={() => onDeleteEducation?.(idx)}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Work Experience Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Work Experience</h3>
          {resume.workExperience && resume.workExperience.length > 0 ? (
            <div className="space-y-4">
              {resume.workExperience.map((exp, idx) => (
                <ExperienceCard
                  key={exp.id}
                  item={transformExperienceForCard(exp)}
                  mode="inline"
                  onUpdate={(field, value) => {
                    // Map ExperienceCard field names to resume field names
                    const fieldMap = {
                      'organization': 'company',
                      'start_date': 'startDate',
                      'end_date': 'endDate'
                    }
                    const mappedField = fieldMap[field] || field
                    onUpdateExperience?.(idx, mappedField, value)
                  }}
                  onDelete={() => onDeleteExperience?.(idx)}
                  onUpdateBulletPoint={(pointId, newContent) => handleUpdateBulletPoint(idx, pointId, newContent)}
                  onAddBulletPoint={(newContent) => handleAddBulletPoint(idx, newContent)}
                  onDeleteBulletPoint={(pointId) => handleDeleteBulletPoint(idx, pointId)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No work experience items found. This resume may not have been saved with experience data.</p>
          )}
        </Card>

        {/* Projects Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Projects</h3>
          {resume.projects && resume.projects.length > 0 ? (
            <div className="space-y-4">
              {resume.projects.map((proj, idx) => (
                <ExperienceCard
                  key={proj.id}
                  item={transformProjectForCard(proj)}
                  mode="inline"
                  onUpdate={(field, value) => {
                    // Map ExperienceCard field names to project field names
                    if (field === 'title') {
                      onUpdateProject?.(idx, 'title', value)
                    } else if (field === 'start_date' || field === 'end_date') {
                      onUpdateProject?.(idx, 'date', value)
                    }
                  }}
                  onDelete={() => onDeleteProject?.(idx)}
                  onUpdateBulletPoint={(pointId, newContent) => handleUpdateProjectBulletPoint(idx, pointId, newContent)}
                  onAddBulletPoint={(newContent) => handleAddProjectBulletPoint(idx, newContent)}
                  onDeleteBulletPoint={(pointId) => handleDeleteProjectBulletPoint(idx, pointId)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No project items found. This resume may not have been saved with project data.</p>
          )}
        </Card>


        {/* Skills */}
        {resume.skills && Array.isArray(resume.skills) && resume.skills.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, idx) => {
                const normalizedSkill = normalizeSkill(skill)
                return (
                  <SkillsBadge
                    key={idx}
                    skill={normalizedSkill}
                    onEdit={(updatedSkill) => onUpdateSkill?.(idx, updatedSkill.name || updatedSkill)}
                    onDelete={() => onDeleteSkill?.(idx)}
                  />
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TailoredResumeEditor

