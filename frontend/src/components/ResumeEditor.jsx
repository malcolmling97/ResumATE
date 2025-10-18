import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import ResumeItemCard from "./ResumeItemCard"

const TailoredResumeEditor = ({ resume, onJobDescriptionChange, onItemSave, onItemRegenerate }) => {
  if (!resume) return null

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="space-y-8">
        {/* Job Title */}
        <div>
          <h1 className="text-4xl font-bold text-balance">{resume.title}</h1>
        </div>

        {/* Job Description */}
        <Card className="p-6">
          <Textarea
            placeholder="Enter job description here..."
            className="min-h-32 resize-none border-0 p-0 focus-visible:ring-0 text-sm leading-relaxed"
            defaultValue={resume.jobDescription}
            onChange={(e) => onJobDescriptionChange?.(resume.id, e.target.value)}
          />
        </Card>

        {/* Work Experience Section */}
        {resume.workExperience?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Work Experience</h2>
            <div className="space-y-4">
              {resume.workExperience.map((item) => (
                <ResumeItemCard
                  key={item.id}
                  item={item}
                  onSave={onItemSave}
                  onRegenerate={onItemRegenerate}
                />
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {resume.projects?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            <div className="space-y-4">
              {resume.projects.map((item) => (
                <ResumeItemCard
                  key={item.id}
                  item={item}
                  onSave={onItemSave}
                  onRegenerate={onItemRegenerate}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default TailoredResumeEditor

