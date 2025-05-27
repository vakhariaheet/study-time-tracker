"use client"

import { useStudy } from "@/components/study-context"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, X } from "lucide-react"
import { useEffect } from "react"

export function ZenMode() {
  const {
    currentSession,
    isTimerRunning,
    timerTime,
    subjects,
    pauseSession,
    resumeSession,
    stopSession,
    toggleZenMode,
  } = useStudy()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStop = () => {
    stopSession()
    toggleZenMode() // Exit zen mode when session ends
  }

  // Prevent scrolling when in zen mode
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  // Handle escape key to exit zen mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleZenMode()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [toggleZenMode])

  const currentSubject = currentSession ? subjects.find((s) => s.id === currentSession.subjectId) : null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white z-50">
      {/* Exit Button */}
      <Button
        onClick={toggleZenMode}
        variant="ghost"
        size="sm"
        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Subject Name */}
      {currentSubject && (
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentSubject.color }} />
          <span className="text-lg font-medium text-white/90">{currentSubject.name}</span>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="flex flex-col items-center justify-center space-y-12">
        {/* Large Clock */}
        <div className="text-center">
          <div className="text-8xl md:text-9xl lg:text-[12rem] font-mono font-light tracking-wider text-white mb-4">
            {formatTime(timerTime)}
          </div>

          {/* Session Status */}
          <div className="text-xl md:text-2xl text-white/70 font-light">{isTimerRunning ? "Focus Time" : "Paused"}</div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-6">
          {isTimerRunning ? (
            <Button
              onClick={pauseSession}
              size="lg"
              variant="outline"
              className="h-16 w-16 rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white border-2"
            >
              <Pause className="h-8 w-8" />
            </Button>
          ) : (
            <Button
              onClick={resumeSession}
              size="lg"
              variant="outline"
              className="h-16 w-16 rounded-full border-white/30 bg-white/10 hover:bg-white/20 text-white border-2"
            >
              <Play className="h-8 w-8" />
            </Button>
          )}

          <Button
            onClick={handleStop}
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full border-red-400/50 bg-red-500/20 hover:bg-red-500/30 text-red-200 border-2"
          >
            <Square className="h-8 w-8" />
          </Button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/50 text-sm">
          Press <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> to exit zen mode
        </div>
      </div>

      {/* Ambient Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  )
}
