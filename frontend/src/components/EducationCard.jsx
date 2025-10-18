import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

const EducationCard = ({ education, actions, mode, onUpdate, onDelete }) => {
  // Handle both data structures:
  // 1. Master resume: { title, description, start_date, end_date, grade }
  // 2. Generated resume: { degree, institution, year, graduationDate }
  
  const title = education.degree || education.title || 'No degree specified'
  const description = education.institution || education.description || 'No institution specified'
  
  // Handle date display
  const getDateDisplay = () => {
    // If we have year or graduationDate (from generated resume)
    if (education.year) {
      return education.year
    }
    if (education.graduationDate) {
      return education.graduationDate
    }
    
    // If we have start_date/end_date (from master resume)
    if (education.start_date || education.end_date) {
      const startDisplay = education.start_date ? formatDate(education.start_date) : ''
      const endDisplay = education.end_date ? formatDate(education.end_date) : 'Present'
      return education.start_date ? `${startDisplay} - ${endDisplay}` : endDisplay
    }
    
    return null
  }

  const dateDisplay = getDateDisplay()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-0">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">{actions}</div>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex-shrink-0 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        )}
      </CardHeader>
      <CardContent className="pt-2 flex flex-col gap-1">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {/* Date Range */}
          {dateDisplay && <span>{dateDisplay}</span>}
          {education.grade && (
            <span className="ml-3 px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-600">
              {education.grade}
            </span>
          )}
          {education.gpa && (
            <span className="ml-3 px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-600">
              GPA: {education.gpa}
            </span>
          )}
          {education.location && (
            <span className="text-xs text-gray-500">
              {education.location}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default EducationCard