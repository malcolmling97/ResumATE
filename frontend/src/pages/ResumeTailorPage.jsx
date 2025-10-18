import { PanelLeft } from "lucide-react"
import NavActions from "@/components/NavActions"
import NavResumeItems from "@/components/NavResumeItems"
import CreateNewTailoredResumeInset from "@/components/CreateNewTailoredResumeInset"
import TailoredResumeEditor from "@/components/ResumeEditor"
import { useResumes } from "@/hooks/useResumes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"
import TopNavBar from "@/components/TopNavBar"

const ResumeTailorContent = () => {
  const { open, setOpen, toggleSidebar } = useSidebar()
  const {
    resumes,
    selectedResume,
    selectedResumeId,
    selectResume,
    createNewResume,
    updateJobDescription,
    updateResumeItem,
    regenerateItem,
  } = useResumes(null) // Start with no resume selected

  const handleItemSave = (itemId, editedBullets) => {
    if (selectedResumeId) {
      updateResumeItem(selectedResumeId, itemId, editedBullets)
    }
  }

  const handleSidebarClick = (e) => {
    // Only expand if not clicking on a button or interactive element
    if (!open) {
      const target = e.target
      // Check if the clicked element or any parent is a button
      const isButton = target.closest('button, a, [role="button"]')
      if (!isButton) {
        setOpen(true)
      }
    }
  }

  return (
    <>
      <Sidebar 
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        collapsible="icon"
      >
        <SidebarContent
          onClick={handleSidebarClick}
          className={
            open
              ? "py-2 cursor-auto [&_button]:cursor-pointer [&_a]:cursor-pointer"
              : "py-2 cursor-e-resize [&_button]:cursor-pointer [&_a]:cursor-pointer"
          }
        >
          <NavActions onNewResume={createNewResume} />
          <NavResumeItems 
            resumes={resumes}
            selectedResumeId={selectedResumeId}
            onSelectResume={selectResume}
          />
        </SidebarContent>
        
        <SidebarFooter
          onClick={handleSidebarClick}
          className={open ? "cursor-auto [&_button]:cursor-pointer" : "cursor-e-resize [&_button]:cursor-pointer"}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleSidebar} tooltip="Toggle Sidebar">
                <PanelLeft className="h-4 w-4" />
                <span className=''>Collapse Sidebar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="flex-1 overflow-y-auto">
          {selectedResume ? (
            <TailoredResumeEditor
              resume={selectedResume}
              onJobDescriptionChange={updateJobDescription}
              onItemSave={handleItemSave}
              onItemRegenerate={regenerateItem}
            />
          ) : (
            <CreateNewTailoredResumeInset />
          )}
        </main>
      </SidebarInset>
    </>
  )
}

const ResumeTailorPage = () => {
  return (
    <div className="[--header-height:theme(spacing.14)] h-screen">
      <SidebarProvider className="flex flex-col h-full">
        <TopNavBar className="bg-background sticky top-0 z-50 flex w-full items-center border-b"/>
        <div className="flex flex-1 overflow-hidden">
          <ResumeTailorContent />
        </div>
      </SidebarProvider>
    </div>
  )
}

export default ResumeTailorPage