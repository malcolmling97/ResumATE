import { useState } from "react"
import { FileText, Sparkles, Loader2, FlaskConical } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const CreateNewTailoredResumeInset = ({ onGenerate, onLoadSample, isGenerating, error }) => {
  const [jobDescription, setJobDescription] = useState('')

  const handleGenerate = () => {
    if (jobDescription.trim() && onGenerate) {
      onGenerate(jobDescription)
    }
  }

  const handleKeyDown = (e) => {
    // Allow Ctrl/Cmd + Enter to submit
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

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
          <p className="text-sm text-muted-foreground">
            Paste a job description and we'll generate a customized resume from your master resume
          </p>
        </div>

        {/* Textarea for job url or job description */}
        <div className="flex flex-col w-full items-center gap-2 justify-center my-4">
          <Textarea 
            placeholder="Paste job description or enter job url (Ctrl/Cmd + Enter to submit)"
            className="min-h-48 resize-y flex-1 w-full rounded-md"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          
          {error && (
            <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="default" 
            className="flex w-full rounded-md gap-2"
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescription.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Tailor Resume
              </>
            )}
          </Button>

          {/* Development/Testing option */}
          {onLoadSample && (
            <div className="w-full relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or for testing
                </span>
              </div>
            </div>
          )}

          {onLoadSample && (
            <Button 
              type="button" 
              variant="outline" 
              className="flex w-full rounded-md gap-2"
              onClick={onLoadSample}
              disabled={isGenerating}
            >
              <FlaskConical className="h-4 w-4" />
              Load Sample Resume (No API Call)
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateNewTailoredResumeInset

