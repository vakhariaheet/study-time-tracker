"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { StudyProvider, useStudy } from "@/components/study-context"
import { Dashboard } from "@/components/dashboard"
import { Timer } from "@/components/timer"
import { Subjects } from "@/components/subjects"
import { Analytics } from "@/components/analytics"
import { Settings } from "@/components/settings"
import { useState } from "react"
import { ZenMode } from "@/components/zen-mode"
import { AuthForm } from "@/components/auth/auth-form"

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "timer":
        return <Timer />
      case "subjects":
        return <Subjects />
      case "analytics":
        return <Analytics />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <StudyProvider>
      <ZenModeWrapper>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Study Tracker</h1>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{renderContent()}</div>
          </SidebarInset>
        </SidebarProvider>
      </ZenModeWrapper>
    </StudyProvider>
  )
}

function ZenModeWrapper({ children }: { children: React.ReactNode }) {
  const { isZenMode, currentSession, user, isLoading } = useStudy()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (isZenMode && currentSession) {
    return <ZenMode />
  }

  return <>{children}</>
}
