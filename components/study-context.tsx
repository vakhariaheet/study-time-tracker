"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// Add a new session type to the StudySession interface
export interface StudySession {
  id: string
  subjectId: string
  topicId?: string
  startTime: Date
  endTime?: Date
  duration: number
  notes?: string
  tags: string[]
  type: "focus" | "break" | "manual" | "wasted" // Add "wasted" type
}

export interface Subject {
  id: string
  name: string
  color: string
  topics: Topic[]
  totalTime: number
  goalTime?: number
}

export interface Topic {
  id: string
  name: string
  totalTime: number
  progress: number
}

export interface StudyGoal {
  id: string
  type: "daily" | "weekly" | "monthly"
  target: number
  current: number
  subjectId?: string
}

// Add wasted time tracking to the context interface
interface StudyContextType {
  subjects: Subject[]
  sessions: StudySession[]
  goals: StudyGoal[]
  currentSession: StudySession | null
  isTimerRunning: boolean
  timerTime: number
  isBreakTime: boolean
  isZenMode: boolean
  isWastedTime: boolean // Add this
  addSubject: (subject: Omit<Subject, "id" | "totalTime">) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void
  addTopic: (subjectId: string, topic: Omit<Topic, "id" | "totalTime" | "progress">) => void
  startSession: (subjectId: string, topicId?: string) => void
  startWastedTimeSession: () => void // Add this
  pauseSession: () => void
  resumeSession: () => void
  stopSession: (notes?: string) => void
  addManualSession: (session: Omit<StudySession, "id">) => void
  setGoal: (goal: Omit<StudyGoal, "id" | "current">) => void
  updateGoal: (id: string, updates: Partial<StudyGoal>) => void
  toggleZenMode: () => void
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerTime, setTimerTime] = useState(0)
  const [isBreakTime, setIsBreakTime] = useState(false)
  const [isZenMode, setIsZenMode] = useState(false)
  // Add isWastedTime state
  const [isWastedTime, setIsWastedTime] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem("study-subjects")
    const savedSessions = localStorage.getItem("study-sessions")
    const savedGoals = localStorage.getItem("study-goals")

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects))
    if (savedSessions) setSessions(JSON.parse(savedSessions))
    if (savedGoals) setGoals(JSON.parse(savedGoals))
  }, [])

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("study-subjects", JSON.stringify(subjects))
  }, [subjects])

  useEffect(() => {
    localStorage.setItem("study-sessions", JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem("study-goals", JSON.stringify(goals))
  }, [goals])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Auth effect
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const addSubject = (subject: Omit<Subject, "id" | "totalTime">) => {
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
      totalTime: 0,
    }
    setSubjects((prev) => [...prev, newSubject])
  }

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((subject) => (subject.id === id ? { ...subject, ...updates } : subject)))
  }

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id))
  }

  const addTopic = (subjectId: string, topic: Omit<Topic, "id" | "totalTime" | "progress">) => {
    const newTopic: Topic = {
      ...topic,
      id: Date.now().toString(),
      totalTime: 0,
      progress: 0,
    }
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId ? { ...subject, topics: [...subject.topics, newTopic] } : subject,
      ),
    )
  }

  const startSession = (subjectId: string, topicId?: string) => {
    const session: StudySession = {
      id: Date.now().toString(),
      subjectId,
      topicId,
      startTime: new Date(),
      duration: 0,
      tags: [],
      type: "focus",
    }
    setCurrentSession(session)
    setIsTimerRunning(true)
    setTimerTime(0)
  }

  // Add the startWastedTimeSession function
  const startWastedTimeSession = () => {
    const session: StudySession = {
      id: Date.now().toString(),
      subjectId: "wasted-time", // Special ID for wasted time
      startTime: new Date(),
      duration: 0,
      tags: [],
      type: "wasted",
    }
    setCurrentSession(session)
    setIsTimerRunning(true)
    setTimerTime(0)
    setIsWastedTime(true)
  }

  const pauseSession = () => {
    setIsTimerRunning(false)
  }

  const resumeSession = () => {
    setIsTimerRunning(true)
  }

  // Update the stopSession function to handle wasted time
  const stopSession = (notes?: string) => {
    if (currentSession) {
      const endedSession: StudySession = {
        ...currentSession,
        endTime: new Date(),
        duration: timerTime,
        notes,
      }

      setSessions((prev) => [...prev, endedSession])

      // Only update subject total time if it's not wasted time
      if (currentSession.type !== "wasted") {
        setSubjects((prev) =>
          prev.map((subject) =>
            subject.id === currentSession.subjectId
              ? { ...subject, totalTime: subject.totalTime + timerTime }
              : subject,
          ),
        )

        // Update topic total time if applicable
        if (currentSession.topicId) {
          setSubjects((prev) =>
            prev.map((subject) =>
              subject.id === currentSession.subjectId
                ? {
                    ...subject,
                    topics: subject.topics.map((topic) =>
                      topic.id === currentSession.topicId
                        ? { ...topic, totalTime: topic.totalTime + timerTime }
                        : topic,
                    ),
                  }
                : subject,
            ),
          )
        }
      }
    }

    setCurrentSession(null)
    setIsTimerRunning(false)
    setTimerTime(0)
    setIsWastedTime(false)
  }

  const addManualSession = (session: Omit<StudySession, "id">) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
    }
    setSessions((prev) => [...prev, newSession])

    // Update subject total time
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === session.subjectId ? { ...subject, totalTime: subject.totalTime + session.duration } : subject,
      ),
    )
  }

  const setGoal = (goal: Omit<StudyGoal, "id" | "current">) => {
    const newGoal: StudyGoal = {
      ...goal,
      id: Date.now().toString(),
      current: 0,
    }
    setGoals((prev) => [...prev, newGoal])
  }

  const updateGoal = (id: string, updates: Partial<StudyGoal>) => {
    setGoals((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)))
  }

  const toggleZenMode = () => {
    setIsZenMode((prev) => !prev)
  }

  // Add isWastedTime and startWastedTimeSession to the context value
  return (
    <StudyContext.Provider
      value={{
        subjects,
        sessions,
        goals,
        currentSession,
        isTimerRunning,
        timerTime,
        isBreakTime,
        isZenMode,
        isWastedTime,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        startSession,
        startWastedTimeSession,
        pauseSession,
        resumeSession,
        stopSession,
        addManualSession,
        setGoal,
        updateGoal,
        toggleZenMode,
        user,
        isLoading: isAuthLoading,
        signOut,
      }}
    >
      {children}
    </StudyContext.Provider>
  )
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (context === undefined) {
    throw new Error("useStudy must be used within a StudyProvider")
  }
  return context
}
