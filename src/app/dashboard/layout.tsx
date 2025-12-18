import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
} 