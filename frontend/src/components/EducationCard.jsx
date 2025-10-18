import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

const EducationCard = ({ education, actions }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-0">
        <div>
          <CardTitle className="text-lg">{education.title}</CardTitle>
          {education.description && (
            <CardDescription className="mt-1">{education.description}</CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">{actions}</div>
        )}
      </CardHeader>
      <CardContent className="pt-2 flex flex-col gap-1">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {/* Date Range */}
          <span>
            {formatDate(education.start_date)}
            {education.end_date ? ` - ${formatDate(education.end_date)}` : ' - Present'}
          </span>
          {education.grade && (
            <span className="ml-3 px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-600">
              {education.grade}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default EducationCard