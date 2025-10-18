import { FileText } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const NavResumeItems = ({ resumes, selectedResumeId, onSelectResume }) => {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Resumes</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {resumes.map((resume) => (
            <SidebarMenuItem key={resume.id}>
              <SidebarMenuButton
                onClick={() => onSelectResume(resume.id)}
                isActive={selectedResumeId === resume.id}
                tooltip={resume.title}
              >
                <FileText className="h-4 w-4" />
                <span>{resume.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavResumeItems

