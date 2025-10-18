import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '../stores/authStore'
import { resumeItemsApi, educationApi, curatedResumesApi, skillsApi } from '../services/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Pencil, FileText, Download, Plus, X, ChevronDown } from 'lucide-react'
import TopNavBar from '@/components/TopNavBar'
import EducationDialog from '@/components/EducationDialog'
import EducationCard from '@/components/EducationCard'
import SkillDialog from '@/components/SkillDialog'
import SkillsBadge from '@/components/SkillsBadge'
import ExperienceCard from '@/components/ExperienceCard'
import ExperienceDialog from '@/components/ExperienceDialog'

const NewProfilePage = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [workExperiences, setWorkExperiences] = useState([])
  const [projects, setProjects] = useState([])
  const [education, setEducation] = useState([])
  const [skills, setSkills] = useState([])
  const [curatedResumes, setCuratedResumes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [experienceTabValue, setExperienceTabValue] = useState('work')
  const [error, setError] = useState(null)

  // Modal states for Education
  const [educationModalOpen, setEducationModalOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState(null)

  // Modal states for Skills
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)

  // Modal states for Experience (work, projects)
  const [experienceModalOpen, setExperienceModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState(null)
  const [experienceItemType, setExperienceItemType] = useState('experience') // 'experience' or 'project'

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Load work experiences
      const workResponse = await resumeItemsApi.getUserResumeItems('experience')
      setWorkExperiences(workResponse.data?.resume_items || [])
      
      // Load projects
      const projectResponse = await resumeItemsApi.getUserResumeItems('project')
      setProjects(projectResponse.data?.resume_items || [])
      
      // Load education
      const eduResponse = await educationApi.getUserEducation()
      setEducation(eduResponse.data?.education || [])
      
      // Load skills
      const skillsResponse = await skillsApi.getUserSkills()
      setSkills(skillsResponse.data?.skills || [])
      
      // Load curated resumes
      const resumesResponse = await curatedResumesApi.getUserCuratedResumes()
      setCuratedResumes(resumesResponse.data?.curated_resumes || [])
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' GMT+8'
  }

  // Experience handlers
  const handleAddExperience = (type) => {
    setExperienceItemType(type)
    setEditingExperience(null)
    setExperienceModalOpen(true)
  }

  const handleEditExperience = (item, type) => {
    setExperienceItemType(type)
    setEditingExperience(item)
    setExperienceModalOpen(true)
  }

  const handleSaveExperience = async (formData) => {
    try {
      setError(null)
      
      // Extract bullet points from formData
      const { bulletPoints, ...restFormData } = formData
      
      // Prepare data based on item type
      let dataToSend = {
        item_type: experienceItemType,
        title: restFormData.title,
        description: restFormData.description,
        start_date: restFormData.start_date,
        end_date: restFormData.end_date,
        is_current: restFormData.is_current
      }

      // Add type-specific fields
      if (experienceItemType === 'experience') {
        dataToSend = {
          ...dataToSend,
          organization: restFormData.organization,
          location: restFormData.location,
          employment_type: restFormData.employment_type
        }
      } else if (experienceItemType === 'project') {
        const technologiesArray = restFormData.technologies 
          ? restFormData.technologies.split(',').map(t => t.trim()).filter(t => t)
          : null
        dataToSend = {
          ...dataToSend,
          technologies: technologiesArray,
          github_url: restFormData.github_url,
          demo_url: restFormData.demo_url
        }
      }

      let savedItem
      if (editingExperience) {
        savedItem = await resumeItemsApi.updateResumeItem(editingExperience.id, dataToSend)
        
        // For editing, we need to handle bullet points separately
        // First, get existing points and remove any that aren't in the new list
        const existingPoints = editingExperience.points || []
        const existingContents = existingPoints.map(p => p.content)
        
        // Delete removed points
        for (const point of existingPoints) {
          if (!bulletPoints.includes(point.content)) {
            await resumeItemsApi.deleteResumeItemPoint(point.id)
          }
        }
        
        // Add new points
        for (let i = 0; i < bulletPoints.length; i++) {
          if (!existingContents.includes(bulletPoints[i])) {
            await resumeItemsApi.createResumeItemPoint({
              resume_item_id: editingExperience.id,
              content: bulletPoints[i],
              display_order: i
            })
          }
        }
      } else {
        // Create new resume item
        savedItem = await resumeItemsApi.createResumeItem(dataToSend)
        
        // Add bullet points if any
        if (bulletPoints && bulletPoints.length > 0) {
          for (let i = 0; i < bulletPoints.length; i++) {
            await resumeItemsApi.createResumeItemPoint({
              resume_item_id: savedItem.data.resume_item.id,
              content: bulletPoints[i],
              display_order: i
            })
          }
        }
      }
      
      await loadAllData()
      setExperienceModalOpen(false)
    } catch (error) {
      console.error('Failed to save experience:', error)
      setError(`Failed to save ${experienceItemType}: ${error.message}`)
      alert(`Failed to save ${experienceItemType}: ${error.message}`)
    }
  }

  const handleDeleteExperience = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}? All bullet points will also be deleted.`)) {
      return
    }
    try {
      await resumeItemsApi.deleteResumeItem(id)
      await loadAllData()
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
    }
  }

  // Inline editing handlers for ExperienceCard
  const handleUpdateExperienceField = async (itemId, field, value) => {
    try {
      const updateData = { [field]: value }
      await resumeItemsApi.updateResumeItem(itemId, updateData)
      await loadAllData()
    } catch (error) {
      console.error(`Failed to update ${field}:`, error)
      alert(`Failed to update ${field}: ${error.message}`)
    }
  }

  const handleUpdateBulletPoint = async (pointId, content) => {
    try {
      await resumeItemsApi.updateResumeItemPoint(pointId, { content })
      await loadAllData()
    } catch (error) {
      console.error('Failed to update bullet point:', error)
      alert(`Failed to update bullet point: ${error.message}`)
    }
  }

  const handleAddBulletPoint = async (itemId, content) => {
    try {
      // Get current points to determine the next display_order
      const item = [...workExperiences, ...projects].find(i => i.id === itemId)
      const nextOrder = item?.points?.length || 0
      
      await resumeItemsApi.createResumeItemPoint({
        resume_item_id: itemId,
        content,
        display_order: nextOrder
      })
      await loadAllData()
    } catch (error) {
      console.error('Failed to add bullet point:', error)
      alert(`Failed to add bullet point: ${error.message}`)
    }
  }

  const handleDeleteBulletPoint = async (pointId) => {
    if (!window.confirm('Are you sure you want to delete this bullet point?')) {
      return
    }
    try {
      await resumeItemsApi.deleteResumeItemPoint(pointId)
      await loadAllData()
    } catch (error) {
      console.error('Failed to delete bullet point:', error)
      alert(`Failed to delete bullet point: ${error.message}`)
    }
  }

  const filteredResumes = curatedResumes.filter(resume =>
    resume.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Education handlers
  const handleAddEducation = () => {
    setEditingEducation(null)
    setEducationModalOpen(true)
  }

  const handleEditEducation = (edu) => {
    setEditingEducation(edu)
    setEducationModalOpen(true)
  }

  const handleSaveEducation = async (formData) => {
    try {
      setError(null)
      if (editingEducation) {
        await educationApi.updateEducation(editingEducation.id, formData)
      } else {
        await educationApi.createEducation(formData)
      }
      await loadAllData()
      setEducationModalOpen(false)
    } catch (error) {
      console.error('Failed to save education:', error)
      setError(`Failed to save education: ${error.message}`)
      alert(`Failed to save education: ${error.message}`)
    }
  }

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) {
      return
    }
    try {
      await educationApi.deleteEducation(id)
      await loadAllData()
    } catch (error) {
      console.error('Failed to delete education:', error)
    }
  }

  // Skills handlers
  const handleAddSkill = () => {
    setEditingSkill(null)
    setSkillModalOpen(true)
  }

  const handleEditSkill = (skill) => {
    setEditingSkill(skill)
    setSkillModalOpen(true)
  }

  const handleSaveSkill = async (formData) => {
    try {
      setError(null)
      if (editingSkill) {
        await skillsApi.updateSkill(editingSkill.id, formData)
      } else {
        await skillsApi.createSkill(formData)
      }
      await loadAllData()
      setSkillModalOpen(false)
    } catch (error) {
      console.error('Failed to save skill:', error)
      setError(`Failed to save skill: ${error.message}`)
      alert(`Failed to save skill: ${error.message}`)
    }
  }

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return
    }
    try {
      await skillsApi.deleteSkill(id)
      await loadAllData()
    } catch (error) {
      console.error('Failed to delete skill:', error)
    }
  }

  const groupSkillsByCategory = () => {
    const grouped = {}
    skills.forEach(skill => {
      const category = skill.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(skill)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-sky-background">
      {/* Top Navigation Bar */}
      <TopNavBar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-none m-8 mr-0 p-6 flex flex-col gap-6 glass-container rounded-2xl">
        {/* Profile Card */}
        <Card className="p-6 text-center shadow-sm gap-0">
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={user?.profile_picture || '/api/placeholder/128/128'}
                alt={user?.name || 'Profile'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-1">{user?.name || 'Username'}</h3>
          <p className="text-sm text-gray-600 mb-1">Product Associate</p>
          <p className="text-sm text-gray-500 mb-2">@ OrbitOne Technologies</p>
          <p className="text-xs text-gray-600 mb-1">{user?.email || 'email@example.com'} | +65 8123 4567</p>
          <div className="mt-4 inline-block">
            <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Job-hunting
            </span>
          </div>
        </Card>

        {/* New Resume Button */}
        <Button 
          onClick={() => navigate('/generate-resume')}
          className="w-full justify-start gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
        >
          <Pencil className="w-4 h-4" />
          New Resume
        </Button>

        {/* Search Resumes */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Resumes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Past Resumes */}
        <div className="flex-1 overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Past Resumes</h4>
          <div className="space-y-2">
            {filteredResumes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No past resumes</p>
            ) : (
              filteredResumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => navigate('/generate-resume')}
                  className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                >
                  <p className="font-medium text-sm text-gray-900">
                    {resume.company_name}, {resume.job_title}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto"> 
          {/* Content Area */}
          <div className="p-8 flex flex-col gap-6 max-w-6xl">
          {/* Resume Information Header */}
          <section className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Resume Information</h2>
            <div className="glass-container rounded-2xl p-4">
              <Card className="p-6 bg-white rounded-xl shadow border border-gray-100 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Resume version</h2>
                    <p className="text-sm text-gray-500 mb-3">
                      Last updated: {formatDateTime(lastUpdated)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          {/* Education Experience */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Education</h2>
              <div className="flex gap-3">
                <Button onClick={handleAddEducation}>
                  <Plus className="w-4 h-4"/>
                  Add Education
                </Button>
                <EducationDialog
                  open={educationModalOpen}
                  onOpenChange={setEducationModalOpen}
                  education={editingEducation}
                  onSave={handleSaveEducation}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl p-4 glass-container">
              {education.length === 0 ? (
                <Card className="p-8 text-center bg-transparent shadow-none border-0">
                  <p className="text-gray-500">No education entries added yet</p>
                </Card>
              ) : (
                education.map((edu) => (
                  <EducationCard
                    key={edu.id}
                    education={edu}
                    actions={
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditEducation(edu)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteEducation(edu.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </section>

          {/* Master Experience Bank */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Experience Bank</h2>
              <div className="flex gap-3">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default">
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleAddExperience('experience')}>
                      Add Work Experience
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleAddExperience('project')}>
                      Add Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ExperienceDialog
                  open={experienceModalOpen}
                  onOpenChange={setExperienceModalOpen}
                  item={editingExperience}
                  onSave={handleSaveExperience}
                  itemType={experienceItemType}
                />
              </div>
            </div>

            <div className="glass-container rounded-2xl p-4">     
            <Tabs value={experienceTabValue} onValueChange={setExperienceTabValue} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-transparent shadow-sm rounded-lg">
                <TabsTrigger value="work">Work Experience</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>

              <TabsContent value="work" className="space-y-4 rounded-2xl">
                {workExperiences.length === 0 ? (
                  <Card className="p-6 bg-white rounded-xl shadow border border-gray-100 backdrop-blur-sm text-center">
                    <p className="text-gray-500">No work experiences added yet</p>
                  </Card>
                ) : (
                  workExperiences.map((exp) => (
                    <ExperienceCard 
                      key={exp.id} 
                      item={exp}
                      mode="inline"
                      onUpdate={(field, value) => handleUpdateExperienceField(exp.id, field, value)}
                      onUpdateBulletPoint={handleUpdateBulletPoint}
                      onAddBulletPoint={(content) => handleAddBulletPoint(exp.id, content)}
                      onDeleteBulletPoint={handleDeleteBulletPoint}
                      onDelete={() => handleDeleteExperience(exp.id, 'experience')}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="projects" className="space-y-4 rounded-2xl">
                {projects.length === 0 ? (
                  <Card className="p-6 bg-white rounded-xl shadow border border-gray-100 backdrop-blur-sm text-center">
                    <p className="text-gray-500">No projects added yet</p>
                  </Card>
                ) : (
                  projects.map((project) => (
                    <ExperienceCard 
                      key={project.id} 
                      item={project}
                      mode="inline"
                      onUpdate={(field, value) => handleUpdateExperienceField(project.id, field, value)}
                      onUpdateBulletPoint={handleUpdateBulletPoint}
                      onAddBulletPoint={(content) => handleAddBulletPoint(project.id, content)}
                      onDeleteBulletPoint={handleDeleteBulletPoint}
                      onDelete={() => handleDeleteExperience(project.id, 'project')}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
            </div>
          </section>

          {/* Skills */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
              <div className="flex gap-3">
                <Button variant="default" onClick={handleAddSkill}>
                  <Plus className="w-4 h-4" />
                  Add Skill
                </Button>
                <SkillDialog
                  open={skillModalOpen}
                  onOpenChange={setSkillModalOpen}
                  skill={editingSkill}
                  onSave={handleSaveSkill}
                />
              </div>
            </div>

            <div className="space-y-4 glass-container rounded-2xl">
              {skills.length === 0 ? (
                <Card className="p-8 text-center bg-transparent shadow-none border-0">
                  <p className="text-gray-500">No skills added yet</p>
                </Card>
              ) : (
                <Card className="p-6 bg-transparent shadow-none border-0">
                  <div className="flex flex-wrap gap-6">
                    {Object.entries(groupSkillsByCategory()).map(([category, categorySkills]) => (
                      <div key={category} className="flex-shrink-0">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          {category}:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills.map((skill) => (
                            <SkillsBadge
                              key={skill.id}
                              skill={skill}
                              onEdit={handleEditSkill}
                              onDelete={handleDeleteSkill}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NewProfilePage

