import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const SkillCard = ({ skill }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-0">
        <div>
          <CardTitle className="text-lg">{skill.name}</CardTitle>
          {skill.category && (
            <CardDescription className="mt-1">{skill.category}</CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">{actions}</div>
        )}
      </CardHeader>
    </Card>
  )
}

export default SkillCard