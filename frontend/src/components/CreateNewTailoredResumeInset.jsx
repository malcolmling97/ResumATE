import { FileText, Sparkles } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const CreateNewTailoredResumeInset = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-var(--header-height))] px-4 w-full">
      <div className="text-center space-y-4 max-w-2xl w-full">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <FileText className="h-16 w-16 text-muted-foreground/50" />
            <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Tailor your resume for your dream job
          </h1>
        </div>

        {/* Textarea for job url or job description */}
        <div className="flex flex-col w-full items-center gap-2 justify-center my-4">
          <Textarea 
            placeholder="Paste job description or enter job url"
            className="min-h-24 resize-y flex-1 w-full rounded-md"
          />
          <Button type="submit" variant="outline" className="flex flex-1 w-full rounded-md h-full">
            Tailor
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateNewTailoredResumeInset

