import { useState } from "react"
import { FileText, ChevronRight } from "lucide-react"
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

const NavResumeItems = ({ resumes, selectedResumeId, onSelectResume }) => {
  const [isOpen, setIsOpen] = useState(true)

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
                  <SidebarMenuItem key={resume.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectResume(resume.id)}
                      isActive={selectedResumeId === resume.id}
                    >
                      <FileText className="h-4 w-4" />
                      <span>{resume.title}</span>
                    </SidebarMenuButton>
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

