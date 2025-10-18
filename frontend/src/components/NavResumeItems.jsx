import { useState } from "react"
import { FileText, ChevronRight, Trash2 } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const NavResumeItems = ({ resumes, selectedResumeId, onSelectResume, onDeleteResume }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (e, resumeId) => {
    e.stopPropagation() // Prevent triggering onSelectResume
    
    if (!confirm('Are you sure you want to delete this resume?')) {
      return
    }
    
    setDeletingId(resumeId)
    await onDeleteResume(resumeId)
    setDeletingId(null)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupContent>
        <SidebarMenu>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="text-muted-foreground">
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`} 
                  />
                  <span>Resumes</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {resumes.map((resume) => (
                  <SidebarMenuItem key={resume.id} className="group/item relative">
                    <SidebarMenuButton
                      onClick={() => onSelectResume(resume.id)}
                      isActive={selectedResumeId === resume.id}
                      className="pr-8"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{resume.title}</span>
                    </SidebarMenuButton>
                    <button
                      onClick={(e) => handleDelete(e, resume.id)}
                      disabled={deletingId === resume.id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10 text-destructive transition-opacity disabled:opacity-50"
                      title="Delete resume"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </SidebarMenuItem>
                ))}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavResumeItems

