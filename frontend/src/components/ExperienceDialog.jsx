import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

const ExperienceDialog = ({ open, onOpenChange, item, onSave, itemType }) => {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    location: '',
    employment_type: 'Full-time',
    description: '',
    technologies: '',
    github_url: '',
    demo_url: '',
    start_date: '',
    end_date: '',
    is_current: false
  })

  const [bulletPoints, setBulletPoints] = useState([])
  const [newBulletPoint, setNewBulletPoint] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingInlineIndex, setEditingInlineIndex] = useState(null)
  const [tempEditValue, setTempEditValue] = useState('')

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        organization: item.organization || '',
        location: item.location || '',
        employment_type: item.employment_type || 'Full-time',
        description: item.description || '',
        technologies: item.technologies ? item.technologies.join(', ') : '',
        github_url: item.github_url || '',
        demo_url: item.demo_url || '',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        is_current: item.is_current || false
      })
      // Load existing bullet points if editing
      setBulletPoints(item.points ? item.points.map(p => p.content) : [])
    } else {
      setFormData({
        title: '',
        organization: '',
        location: '',
        employment_type: 'Full-time',
        description: '',
        technologies: '',
        github_url: '',
        demo_url: '',
        start_date: '',
        end_date: '',
        is_current: false
      })
      setBulletPoints([])
    }
    setNewBulletPoint('')
    setEditingIndex(null)
    setEditingInlineIndex(null)
    setTempEditValue('')
  }, [item, open])

  const handleSubmit = () => {
    onSave({ ...formData, bulletPoints })
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleAddBulletPoint = () => {
    if (newBulletPoint.trim()) {
      if (editingIndex !== null) {
        // Edit existing bullet point
        const updated = [...bulletPoints]
        updated[editingIndex] = newBulletPoint.trim()
        setBulletPoints(updated)
        setEditingIndex(null)
      } else {
        // Add new bullet point
        setBulletPoints([...bulletPoints, newBulletPoint.trim()])
      }
      setNewBulletPoint('')
    }
  }

  const handleEditBulletPoint = (index) => {
    setNewBulletPoint(bulletPoints[index])
    setEditingIndex(index)
  }

  const handleDeleteBulletPoint = (index) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index))
    if (editingInlineIndex === index) {
      setEditingInlineIndex(null)
      setTempEditValue('')
    }
  }

  const handleCancelEdit = () => {
    setNewBulletPoint('')
    setEditingIndex(null)
  }

  const handleInlineEditClick = (index) => {
    setEditingInlineIndex(index)
    setTempEditValue(bulletPoints[index])
  }

  const handleInlineEditSave = (index) => {
    if (tempEditValue.trim()) {
      const updated = [...bulletPoints]
      updated[index] = tempEditValue.trim()
      setBulletPoints(updated)
    }
    setEditingInlineIndex(null)
    setTempEditValue('')
  }

  const handleInlineEditCancel = () => {
    setEditingInlineIndex(null)
    setTempEditValue('')
  }

  const handleInlineEditKeyDown = (e, index) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleInlineEditSave(index)
    } else if (e.key === 'Escape') {
      handleInlineEditCancel()
    }
  }

  const getDialogTitle = () => {
    if (item) {
      switch (itemType) {
        case 'experience': return 'Edit Experience'
        case 'project': return 'Edit Project'
        case 'achievement': return 'Edit Achievement'
        default: return 'Edit Item'
      }
    } else {
      switch (itemType) {
        case 'experience': return 'Add Experience'
        case 'project': return 'Add Project'
        case 'achievement': return 'Add Achievement'
        default: return 'Add Item'
      }
    }
  }

  const getDialogDescription = () => {
    switch (itemType) {
      case 'experience': return 'Add your work experience details.'
      case 'project': return 'Add your project details.'
      case 'achievement': return 'Add your achievement details.'
      default: return 'Fill in the details below.'
    }
  }

  const getTitleLabel = () => {
    switch (itemType) {
      case 'experience': return 'Job Title'
      case 'project': return 'Project Name'
      case 'achievement': return 'Achievement Title'
      default: return 'Title'
    }
  }

  const getTitlePlaceholder = () => {
    switch (itemType) {
      case 'experience': return 'e.g. Senior Software Engineer'
      case 'project': return 'e.g. E-commerce Platform'
      case 'achievement': return 'e.g. First Place in Hackathon'
      default: return 'Enter title'
    }
  }

  const getOrganizationPlaceholder = () => {
    switch (itemType) {
      case 'experience': return 'e.g. Google'
      case 'achievement': return 'e.g. TechCon 2024'
      default: return 'Enter organization'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Title Field - Common to all types */}
          <div className="grid gap-2">
            <Label htmlFor="title">{getTitleLabel()} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={getTitlePlaceholder()}
            />
          </div>

          {/* Experience-specific fields */}
          {itemType === 'experience' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="organization">Company/Organization *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder={getOrganizationPlaceholder()}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employment-type">Employment Type</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                >
                  <SelectTrigger id="employment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Project-specific fields */}
          {itemType === 'project' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="technologies">Technologies</Label>
                <Input
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="e.g. React, Node.js, PostgreSQL (comma-separated)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="github-url">GitHub URL</Label>
                  <Input
                    id="github-url"
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="demo-url">Demo URL</Label>
                  <Input
                    id="demo-url"
                    type="url"
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </>
          )}

          {/* Achievement-specific fields */}
          {itemType === 'achievement' && (
            <div className="grid gap-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder={getOrganizationPlaceholder()}
              />
            </div>
          )}

          {/* Description - Common to all types */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          {/* Date fields - Common to all types */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={formData.is_current}
              />
            </div>
          </div>

          {/* Is Current Checkbox - Common to all types */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-current"
              checked={formData.is_current}
              onChange={(e) => setFormData({ 
                ...formData, 
                is_current: e.target.checked,
                end_date: e.target.checked ? '' : formData.end_date 
              })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is-current" className="text-sm font-normal cursor-pointer">
              {itemType === 'experience' ? 'Current Position' : itemType === 'project' ? 'Ongoing Project' : 'Ongoing'}
            </Label>
          </div>

          {/* Bullet Points Section */}
          <div className="border-t pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Bullet Points ({bulletPoints.length})</Label>
            </div>
            
            {/* Add/Edit Bullet Point Input */}
            <div className="space-y-2 mb-3">
              <Textarea
                value={newBulletPoint}
                onChange={(e) => setNewBulletPoint(e.target.value)}
                placeholder="Enter a key achievement or responsibility..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleAddBulletPoint()
                  }
                }}
              />
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleAddBulletPoint}
                  disabled={!newBulletPoint.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {editingIndex !== null ? 'Update' : 'Add'} Point
                </Button>
                {editingIndex !== null && (
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* List of Bullet Points */}
            {bulletPoints.length > 0 ? (
              <ul className="space-y-2">
                {bulletPoints.map((point, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 p-2 rounded border bg-gray-50"
                  >
                    {editingInlineIndex === index ? (
                      <>
                        <Textarea
                          value={tempEditValue}
                          onChange={(e) => setTempEditValue(e.target.value)}
                          onBlur={() => handleInlineEditSave(index)}
                          onKeyDown={(e) => handleInlineEditKeyDown(e, index)}
                          autoFocus
                          className="flex-1 min-h-[60px] text-sm"
                          placeholder="Enter bullet point content (Enter to save, Shift+Enter for new line)..."
                        />
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteBulletPoint(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span 
                          className="text-sm flex-1 pt-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                          onClick={() => handleInlineEditClick(index)}
                        >
                          • {point}
                        </span>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteBulletPoint(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No bullet points added yet.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExperienceDialog

