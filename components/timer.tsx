"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useStudy } from "@/components/study-context"
import { Play, Pause, Square, Coffee, Clock, Eye } from "lucide-react"

export function Timer() {
  const {
    subjects,
    currentSession,
    isTimerRunning,
    timerTime,
    isBreakTime,
    isWastedTime,
    startSession,
    startWastedTimeSession,
    pauseSession,
    resumeSession,
    stopSession,
    toggleZenMode,
    sessions,
  } = useStudy()

  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [sessionNotes, setSessionNotes] = useState("")
  const [pomodoroMode, setPomodoroMode] = useState(false)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    if (selectedSubject) {
      startSession(selectedSubject, selectedTopic || undefined)
    }
  }

  const handleStop = () => {
    stopSession(sessionNotes)
    setSessionNotes("")
  }

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject)
  const availableTopics = selectedSubjectData?.topics || []

  // Pomodoro logic
  const pomodoroTarget = pomodoroMode ? (isBreakTime ? 300 : 1500) : null // 5 min break, 25 min focus
  const pomodoroProgress = pomodoroTarget ? (timerTime / pomodoroTarget) * 100 : 0
  const isPomodoroComplete = pomodoroTarget && timerTime >= pomodoroTarget

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Study Timer</h2>
        <p className="text-muted-foreground">Track your study sessions with focus and break intervals</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timer Display */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {isWastedTime ? "Time Wasted Tracker" : isBreakTime ? "Break Time" : "Study Timer"}
            </CardTitle>
            {currentSession && (
              <CardDescription>
                {isWastedTime
                  ? "Tracking unproductive time"
                  : subjects.find((s) => s.id === currentSession.subjectId)?.name}
                {currentSession.topicId && !isWastedTime && (
                  <> • {availableTopics.find((t) => t.id === currentSession.topicId)?.name}</>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-mono font-bold mb-4 ${isWastedTime ? "text-red-500" : "text-primary"}`}>
                {formatTime(timerTime)}
              </div>

              {pomodoroMode && pomodoroTarget && (
                <div className="space-y-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(pomodoroProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isBreakTime ? "Break" : "Focus"} session: {Math.round(pomodoroProgress)}%
                  </p>
                  {isPomodoroComplete && (
                    <Badge variant="secondary" className="animate-pulse">
                      {isBreakTime ? "Break Complete!" : "Focus Complete!"}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              {!currentSession ? (
                <div className="flex flex-col gap-2">
                  <Button onClick={handleStart} disabled={!selectedSubject} size="lg" className="gap-2">
                    <Play className="h-4 w-4" />
                    Start Study Session
                  </Button>
                  <Button onClick={startWastedTimeSession} variant="destructive" size="lg" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Start Wasted Time
                  </Button>
                </div>
              ) : (
                <>
                  {isTimerRunning ? (
                    <Button onClick={pauseSession} variant="outline" size="lg" className="gap-2">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeSession} size="lg" className="gap-2">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                  )}
                  <Button onClick={handleStop} variant="destructive" size="lg" className="gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                  {!isWastedTime && (
                    <Button onClick={toggleZenMode} variant="outline" size="lg" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Zen Mode
                    </Button>
                  )}
                </>
              )}
            </div>

            {currentSession && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Session Notes</label>
                  <Textarea
                    placeholder="Add notes about this study session..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Session Setup</CardTitle>
            <CardDescription>Configure your study session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!!currentSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSubject && availableTopics.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic (Optional)</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!!currentSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-topic">No specific topic</SelectItem>
                    {availableTopics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                <div>
                  <p className="font-medium">Pomodoro Mode</p>
                  <p className="text-sm text-muted-foreground">25 min focus, 5 min break</p>
                </div>
              </div>
              <Button
                variant={pomodoroMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPomodoroMode(!pomodoroMode)}
                disabled={!!currentSession}
              >
                {pomodoroMode ? "On" : "Off"}
              </Button>
            </div>

            {subjects.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No subjects available.</p>
                <p className="text-sm">Create a subject first to start tracking time.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress - Dynamic */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {sessions.filter(
                  (session) =>
                    new Date(session.startTime).toDateString() === new Date().toDateString() &&
                    session.type !== "wasted",
                ).length + (currentSession && !isWastedTime ? 1 : 0)}
              </p>
              <p className="text-sm text-muted-foreground">Study Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatTime(
                  sessions
                    .filter(
                      (session) =>
                        new Date(session.startTime).toDateString() === new Date().toDateString() &&
                        session.type !== "wasted",
                    )
                    .reduce((total, session) => total + session.duration, 0) +
                    (currentSession && !isWastedTime ? timerTime : 0),
                )}
              </p>
              <p className="text-sm text-muted-foreground">Study Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {formatTime(
                  sessions
                    .filter(
                      (session) =>
                        new Date(session.startTime).toDateString() === new Date().toDateString() &&
                        session.type === "wasted",
                    )
                    .reduce((total, session) => total + session.duration, 0) +
                    (currentSession && isWastedTime ? timerTime : 0),
                )}
              </p>
              <p className="text-sm text-muted-foreground">Time Wasted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {(() => {
                  const todayStudySessions = sessions.filter(
                    (session) =>
                      new Date(session.startTime).toDateString() === new Date().toDateString() &&
                      session.type !== "wasted",
                  )
                  const totalSessions = todayStudySessions.length + (currentSession && !isWastedTime ? 1 : 0)
                  const totalTime =
                    todayStudySessions.reduce((total, session) => total + session.duration, 0) +
                    (currentSession && !isWastedTime ? timerTime : 0)
                  const avgTime = totalSessions > 0 ? totalTime / totalSessions : 0
                  return formatTime(avgTime)
                })()}
              </p>
              <p className="text-sm text-muted-foreground">Avg Study Session</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
