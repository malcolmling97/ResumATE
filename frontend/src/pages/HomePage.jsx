import React from 'react'
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
} from "@/components/ui/sidebar"

const HomePage = () => {
  const [selectedResumeId, setSelectedResumeId] = useState("3")
  const [editingItem, setEditingItem] = useState(null)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
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

  return (
    <SidebarProvider>
      <Sidebar 
        collapsible="icon"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <SidebarHeader>
          <SidebarLogo isHovered={isSidebarHovered} />
        </SidebarHeader>
        
        <SidebarContent>
          <NavActions onNewResume={handleNewResume} />
          <NavResumeItems 
            resumes={mockResumes}
            selectedResumeId={selectedResumeId}
            onSelectResume={handleSelectResume}
          />
        </SidebarContent>
        
        <SidebarFooter>
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
    </SidebarProvider>
  )
}

export default HomePage