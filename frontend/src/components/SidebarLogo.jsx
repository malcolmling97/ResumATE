import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SidebarLogo = ({ isHovered = false }) => {
  const { toggleSidebar, state } = useSidebar()

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 relative"
            >
              <div 
                className={`flex h-full w-full items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity duration-200 ${
                  state !== "expanded" && isHovered ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <span className="text-sm font-bold">R</span>
              </div>
              <PanelLeft 
                className={`h-4 w-4 absolute inset-0 m-auto transition-opacity duration-200 ${
                  state !== "expanded" && isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" hidden={state === "expanded"}>
            Open sidebar
          </TooltipContent>
        </Tooltip>
        {state === "expanded" && (<span className="font-semibold">Resumate</span>)}
      </div>
      {state === "expanded" && (<SidebarTrigger />)}
    </div>
  )
}

export default SidebarLogo

