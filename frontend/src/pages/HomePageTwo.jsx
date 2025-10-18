import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Pencil, RotateCw, User } from "lucide-react"
import { mockResumes } from "../sample"
import SidebarLogo from "@/components/SidebarLogo"
import NavActions from "@/components/NavActions"
import NavResumeItems from "@/components/NavResumeItems"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"

const HomePageTwoContent = () => {
  const [selectedResumeId, setSelectedResumeId] = useState("3")
  const [editingItem, setEditingItem] = useState(null)
  const { open, setOpen } = useSidebar()
  const selectedResume = mockResumes.find((r) => r.id === selectedResumeId)

  const handleCopy = async (bullets) => {
    try {
      await navigator.clipboard.writeText(bullets.join('\n'))
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNewResume = () => {
    // TODO: Implement new resume creation
    console.log('Creating new resume...')
  }

  const handleSelectResume = (resumeId) => {
    setSelectedResumeId(resumeId)
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
        collapsible="icon"
      >
        <SidebarHeader 
          onClick={handleSidebarClick}
          className={open ? "cursor-auto [&_button]:cursor-pointer" : "cursor-e-resize [&_button]:cursor-pointer"}
        >
          <SidebarLogo isHovered={open}/>
        </SidebarHeader>
        
        <SidebarContent
          onClick={handleSidebarClick}
          className={open ? "cursor-auto [&_button]:cursor-pointer [&_a]:cursor-pointer" : "cursor-e-resize [&_button]:cursor-pointer [&_a]:cursor-pointer"}
        >
          <NavActions onNewResume={handleNewResume} />
          <NavResumeItems 
            resumes={mockResumes}
            selectedResumeId={selectedResumeId}
            onSelectResume={handleSelectResume}
          />
        </SidebarContent>
        
        <SidebarFooter
          onClick={handleSidebarClick}
          className={open ? "cursor-auto [&_button]:cursor-pointer" : "cursor-e-resize [&_button]:cursor-pointer"}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Profile">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">

          {selectedResume && (
            <div className="space-y-8">
              {/* Job Title */}
              <div>
                <h1 className="text-4xl font-bold text-balance">{selectedResume.title}</h1>
              </div>

              {/* Job Description */}
              <Card className="p-6">
                <Textarea
                  placeholder="Enter job description here..."
                  className="min-h-32 resize-none border-0 p-0 focus-visible:ring-0 text-sm leading-relaxed"
                  defaultValue={selectedResume.jobDescription}
                />
              </Card>

              {/* Work Experience Section */}
              {selectedResume.workExperience.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Work Experience</h2>
                  <div className="space-y-4">
                    {selectedResume.workExperience.map((item) => (
                      <Card key={item.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold">{item.title}</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(item.bullets)}>
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        {editingItem === item.id ? (
                          <div className="space-y-3">
                            {item.bullets.map((bullet, idx) => (
                              <Textarea key={idx} defaultValue={bullet} className="min-h-20 text-sm leading-relaxed" />
                            ))}
                            <div className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => setEditingItem(null)}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {item.bullets.map((bullet, idx) => (
                              <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                                {bullet}
                              </p>
                            ))}
                            <div className="pt-2">
                              <Button variant="outline" size="sm">
                                <RotateCw className="h-4 w-4 mr-2" />
                                Re-generate
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects Section */}
              {selectedResume.projects.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Projects</h2>
                  <div className="space-y-4">
                    {selectedResume.projects.map((item) => (
                      <Card key={item.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold">{item.title}</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(item.bullets)}>
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        {editingItem === item.id ? (
                          <div className="space-y-3">
                            {item.bullets.map((bullet, idx) => (
                              <Textarea key={idx} defaultValue={bullet} className="min-h-20 text-sm leading-relaxed" />
                            ))}
                            <div className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => setEditingItem(null)}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {item.bullets.map((bullet, idx) => (
                              <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                                {bullet}
                              </p>
                            ))}
                            <div className="pt-2">
                              <Button variant="outline" size="sm">
                                <RotateCw className="h-4 w-4 mr-2" />
                                Re-generate
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
          </div>
        </main>
      </SidebarInset>
    </>
  )
}

const HomePageTwo = () => {
  return (
    <SidebarProvider>
      <HomePageTwoContent />
    </SidebarProvider>
  )
}

export default HomePageTwo