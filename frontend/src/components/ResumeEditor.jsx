import { useState } from "react"
import { Save, Download, Check, Trash2, Edit2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const [editingField, setEditingField] = useState(null) // 'exp-title-0', 'proj-title-1', etc.

  if (!resume) return null

  // Debug logging
  console.log('ResumeEditor - Full resume object:', resume)
  console.log('ResumeEditor - workExperience:', resume.workExperience)
  console.log('ResumeEditor - projects:', resume.projects)
  console.log('ResumeEditor - education:', resume.education)
  console.log('ResumeEditor - skills:', resume.skills)

  // Helper function to format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return ''
    
    // Convert to string if it's not
    const dateString = String(dateValue)
    
    // If already in a good format, return as is
    if (dateString.toLowerCase() === 'present' || dateString.toLowerCase() === 'current') {
      return 'Present'
    }
    
    // If it's just a year (4 digits), return as is
    if (/^\d{4}$/.test(dateString)) {
      return dateString
    }
    
    // Try to parse and format the date
    try {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }
    } catch (e) {
      // If parsing fails, return original
      return dateString
    }
    
    // If not a valid date, return as is
    return dateString
  }

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
            className="min-h-32 resize-none border-0 p-0 focus-visible:ring-0 text-sm leading-relaxed"
            defaultValue={resume.jobDescription}
            onChange={(e) => onJobDescriptionChange?.(resume.id, e.target.value)}
          />
        </Card>

        {/* Contact Info */}
        {resume.contactInfo && (
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Contact Information</h3>
            <div className="text-center">
              <p className="text-2xl font-bold">{resume.contactInfo.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {resume.contactInfo.email} | {resume.contactInfo.phone}
              </p>
            </div>
          </Card>
        )}

        {/* Skills */}
        {resume.skills && Array.isArray(resume.skills) && resume.skills.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                >
                  {editingField === `skill-${idx}` ? (
                    <Input
                      value={skill}
                      onChange={(e) => onUpdateSkill?.(idx, e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingField(null)
                        }
                      }}
                      autoFocus
                      className="h-6 w-32 text-sm"
                    />
                  ) : (
                    <>
                      <span>{skill}</span>
                      <button
                        onClick={() => setEditingField(`skill-${idx}`)}
                        className="hover:text-primary"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeleteSkill?.(idx)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
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
                <div key={exp.id} className="relative p-4 bg-secondary/30 rounded-md">
                  <button
                    onClick={() => onDeleteExperience?.(idx)}
                    className="absolute top-2 right-2 p-1 hover:bg-destructive/10 text-destructive rounded"
                    title="Delete experience"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  <div className="mb-3 pr-8">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <div className="flex-1 min-w-0">
                        {editingField === `exp-title-${idx}` ? (
                          <Input
                            value={exp.title}
                            onChange={(e) => onUpdateExperience?.(idx, 'title', e.target.value)}
                            onBlur={() => setEditingField(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                            autoFocus
                            className="font-semibold text-base h-8"
                          />
                        ) : (
                          <h4
                            className="font-semibold text-base cursor-pointer hover:text-primary inline-flex items-center gap-2"
                            onClick={() => setEditingField(`exp-title-${idx}`)}
                          >
                            {exp.title}
                            <Edit2 className="h-3 w-3" />
                          </h4>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </span>
                    </div>

                    {editingField === `exp-company-${idx}` ? (
                      <Input
                        value={exp.company}
                        onChange={(e) => onUpdateExperience?.(idx, 'company', e.target.value)}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                        autoFocus
                        className="text-sm italic h-7"
                      />
                    ) : (
                      <p
                        className="text-sm italic text-muted-foreground cursor-pointer hover:text-primary inline-flex items-center gap-1"
                        onClick={() => setEditingField(`exp-company-${idx}`)}
                      >
                        {exp.company}
                        <Edit2 className="h-3 w-3" />
                      </p>
                    )}
                  </div>

                  <ul className="space-y-1.5 ml-4">
                    {exp.bullets?.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-sm text-muted-foreground list-disc">
                        {editingField === `exp-bullet-${idx}-${bIdx}` ? (
                          <Textarea
                            value={bullet}
                            onChange={(e) => {
                              const newBullets = [...exp.bullets]
                              newBullets[bIdx] = e.target.value
                              onItemSave?.(exp.id, newBullets)
                            }}
                            onBlur={() => setEditingField(null)}
                            autoFocus
                            className="min-h-16 text-sm mt-1"
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary"
                            onClick={() => setEditingField(`exp-bullet-${idx}-${bIdx}`)}
                          >
                            {bullet}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
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
                <div key={proj.id} className="relative p-4 bg-secondary/30 rounded-md">
                  <button
                    onClick={() => onDeleteProject?.(idx)}
                    className="absolute top-2 right-2 p-1 hover:bg-destructive/10 text-destructive rounded"
                    title="Delete project"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  <div className="mb-3 pr-8">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <div className="flex-1 min-w-0">
                        {editingField === `proj-title-${idx}` ? (
                          <Input
                            value={proj.title}
                            onChange={(e) => onUpdateProject?.(idx, 'title', e.target.value)}
                            onBlur={() => setEditingField(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                            autoFocus
                            className="font-semibold text-base h-8"
                          />
                        ) : (
                          <h4
                            className="font-semibold text-base cursor-pointer hover:text-primary inline-flex items-center gap-2"
                            onClick={() => setEditingField(`proj-title-${idx}`)}
                          >
                            {proj.title}
                            <Edit2 className="h-3 w-3" />
                          </h4>
                        )}
                      </div>
                      {proj.date && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatDate(proj.date)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-1.5 ml-4">
                    {proj.bullets?.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-sm text-muted-foreground list-disc">
                        {editingField === `proj-bullet-${idx}-${bIdx}` ? (
                          <Textarea
                            value={bullet}
                            onChange={(e) => {
                              const newBullets = [...proj.bullets]
                              newBullets[bIdx] = e.target.value
                              onItemSave?.(proj.id, newBullets)
                            }}
                            onBlur={() => setEditingField(null)}
                            autoFocus
                            className="min-h-16 text-sm mt-1"
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary"
                            onClick={() => setEditingField(`proj-bullet-${idx}-${bIdx}`)}
                          >
                            {bullet}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No project items found. This resume may not have been saved with project data.</p>
          )}
        </Card>

        {/* Education Section */}
        {resume.education && Array.isArray(resume.education) && resume.education.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Education</h3>
            <div className="space-y-4">
              {resume.education.map((edu, idx) => {
                // Handle case where edu might not have all fields
                const degree = edu?.degree || edu?.title || 'Education Entry'
                const institution = edu?.institution || ''
                const year = edu?.year || edu?.end_date || ''
                
                return (
                <div key={idx} className="relative p-4 bg-secondary/30 rounded-md">
                  <button
                    onClick={() => onDeleteEducation?.(idx)}
                    className="absolute top-2 right-2 p-1 hover:bg-destructive/10 text-destructive rounded"
                    title="Delete education"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  <div className="flex justify-between items-start gap-4 pr-8">
                    <div className="flex-1 min-w-0">
                      {editingField === `edu-degree-${idx}` ? (
                        <Input
                          value={degree}
                          onChange={(e) => onUpdateEducation?.(idx, 'degree', e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                          autoFocus
                          className="font-semibold text-base mb-1 h-8"
                        />
                      ) : (
                        <h4
                          className="font-semibold text-base cursor-pointer hover:text-primary inline-flex items-center gap-2 mb-1"
                          onClick={() => setEditingField(`edu-degree-${idx}`)}
                        >
                          {degree}
                          <Edit2 className="h-3 w-3" />
                        </h4>
                      )}

                      {institution && (
                        editingField === `edu-institution-${idx}` ? (
                          <Input
                            value={institution}
                            onChange={(e) => onUpdateEducation?.(idx, 'institution', e.target.value)}
                            onBlur={() => setEditingField(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                            autoFocus
                            className="text-sm italic h-7"
                          />
                        ) : (
                          <p
                            className="text-sm italic text-muted-foreground cursor-pointer hover:text-primary inline-flex items-center gap-1"
                            onClick={() => setEditingField(`edu-institution-${idx}`)}
                          >
                            {institution}
                            <Edit2 className="h-3 w-3" />
                          </p>
                        )
                      )}
                    </div>

                    {year && (
                      editingField === `edu-year-${idx}` ? (
                        <Input
                          value={year}
                          onChange={(e) => onUpdateEducation?.(idx, 'year', e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                          autoFocus
                          className="w-24 flex-shrink-0 h-7 text-sm"
                        />
                      ) : (
                        <span
                          className="text-xs text-muted-foreground cursor-pointer hover:text-primary whitespace-nowrap flex-shrink-0"
                          onClick={() => setEditingField(`edu-year-${idx}`)}
                        >
                          {formatDate(year)}
                        </span>
                      )
                    )}
                  </div>
                </div>
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

