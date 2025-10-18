import React from 'react'
import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { User, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TopNavBar = () => {
  const navigate = useNavigate()

  return (
    <header className="bg-white sticky top-0 z-50 flex h-14 shrink-0 items-center border-b px-6">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif">resum<span className="text-sky-700">ate</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/generate-resume')}>
            <FileText className="h-4 w-4" />
            Tailor Resume
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/new-profile')} className="h-8 w-8">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default TopNavBar