import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <SidebarTrigger className="hover:bg-gray-100 transition-colors" />
            <div className="flex-1" />
          </div>
          <div className="w-full max-w-none">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
} 