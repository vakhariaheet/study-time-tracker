"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Tables = Database['public']['Tables']

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
  type: "focus" | "break" | "manual" | "wasted"
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

interface StudyContextType {
  subjects: Subject[]
  sessions: StudySession[]
  goals: StudyGoal[]
  currentSession: StudySession | null
  isTimerRunning: boolean
  timerTime: number
  isBreakTime: boolean
  isZenMode: boolean
  isWastedTime: boolean
  addSubject: (subject: Omit<Subject, "id" | "totalTime">) => Promise<void>
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>
  deleteSubject: (id: string) => Promise<void>
  addTopic: (subjectId: string, topic: Omit<Topic, "id" | "totalTime" | "progress">) => Promise<void>
  startSession: (subjectId: string, topicId?: string) => void
  startWastedTimeSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  stopSession: (notes?: string) => Promise<void>
  addManualSession: (session: Omit<StudySession, "id">) => Promise<void>
  setGoal: (goal: Omit<StudyGoal, "id" | "current">) => Promise<void>
  updateGoal: (id: string, updates: Partial<StudyGoal>) => Promise<void>
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
  const [isWastedTime, setIsWastedTime] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Auth effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      // Clear data when user logs out
      setSubjects([])
      setSessions([])
      setGoals([])
    }
  }, [user])

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

  const loadUserData = async () => {
    if (!user) return

    try {
      // Load subjects with topics
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*, topics(*)')
        .eq('user_id', user.id)

      if (subjectsError) throw subjectsError

      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })

      if (sessionsError) throw sessionsError

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)

      if (goalsError) throw goalsError

      // Transform data to match our interfaces
      setSubjects(subjectsData.map(subject => ({
        id: subject.id,
        name: subject.name,
        color: subject.color,
        totalTime: subject.total_time,
        goalTime: subject.goal_time,
        topics: subject.topics.map((topic: Tables['topics']['Row']) => ({
          id: topic.id,
          name: topic.name,
          totalTime: topic.total_time,
          progress: topic.progress
        }))
      })))

      setSessions(sessionsData.map(session => ({
        id: session.id,
        subjectId: session.subject_id,
        topicId: session.topic_id,
        startTime: new Date(session.start_time),
        endTime: session.end_time ? new Date(session.end_time) : undefined,
        duration: session.duration,
        notes: session.notes,
        tags: session.tags,
        type: session.type
      })))

      setGoals(goalsData.map(goal => ({
        id: goal.id,
        type: goal.type,
        target: goal.target,
        current: goal.current,
        subjectId: goal.subject_id
      })))
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const addSubject = async (subject: Omit<Subject, "id" | "totalTime">) => {
    if (!user) return

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: user.id,
        name: subject.name,
        color: subject.color,
        total_time: 0
      })
      .select('*, topics(*)')
      .single()

    if (error) throw error

    const newSubject: Subject = {
      id: data.id,
      name: data.name,
      color: data.color,
      totalTime: data.total_time,
      topics: []
    }

    setSubjects(prev => [...prev, newSubject])
  }

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    if (!user) return

    const { error } = await supabase
      .from('subjects')
      .update({
        name: updates.name,
        color: updates.color,
        total_time: updates.totalTime,
        goal_time: updates.goalTime
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    setSubjects(prev =>
      prev.map(subject =>
        subject.id === id ? { ...subject, ...updates } : subject
      )
    )
  }

  const deleteSubject = async (id: string) => {
    if (!user) return

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    setSubjects(prev => prev.filter(subject => subject.id !== id))
  }

  const addTopic = async (
    subjectId: string,
    topic: Omit<Topic, "id" | "totalTime" | "progress">
  ) => {
    if (!user) return

    const { data, error } = await supabase
      .from('topics')
      .insert({
        subject_id: subjectId,
        name: topic.name,
        total_time: 0,
        progress: 0
      })
      .select()
      .single()

    if (error) throw error

    const newTopic: Topic = {
      id: data.id,
      name: data.name,
      totalTime: data.total_time,
      progress: data.progress
    }

    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId
          ? { ...subject, topics: [...subject.topics, newTopic] }
          : subject
      )
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
    setIsWastedTime(false)
  }

  const startWastedTimeSession = () => {
    const session: StudySession = {
      id: Date.now().toString(),
      subjectId: "wasted-time",
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

  const stopSession = async (notes?: string) => {
    if (!currentSession || !user) return

    const endedSession: StudySession = {
      ...currentSession,
      endTime: new Date(),
      duration: timerTime,
      notes,
    }

    try {
      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: endedSession.subjectId,
          topic_id: endedSession.topicId,
          start_time: endedSession.startTime.toISOString(),
          end_time: endedSession.endTime.toISOString(),
          duration: endedSession.duration,
          type: endedSession.type,
          notes: endedSession.notes,
          tags: endedSession.tags
        })

      if (error) throw error

      // Update subject total time if it's not wasted time
      if (endedSession.type !== "wasted") {
        const { error: updateError } = await supabase.rpc('increment_subject_time', {
          p_subject_id: endedSession.subjectId,
          p_duration: endedSession.duration
        })

        if (updateError) throw updateError

        // Update topic total time if applicable
        if (endedSession.topicId) {
          const { error: topicError } = await supabase.rpc('increment_topic_time', {
            p_topic_id: endedSession.topicId,
            p_duration: endedSession.duration
          })

          if (topicError) throw topicError
        }
      }

      setSessions(prev => [endedSession, ...prev])

      if (endedSession.type !== "wasted") {
        setSubjects(prev =>
          prev.map(subject =>
            subject.id === endedSession.subjectId
              ? { ...subject, totalTime: subject.totalTime + endedSession.duration }
              : subject
          )
        )
      }
    } catch (error) {
      console.error('Error saving session:', error)
    }

    setCurrentSession(null)
    setIsTimerRunning(false)
    setTimerTime(0)
    setIsWastedTime(false)
  }

  const addManualSession = async (session: Omit<StudySession, "id">) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: session.subjectId,
          topic_id: session.topicId,
          start_time: session.startTime.toISOString(),
          end_time: session.endTime?.toISOString(),
          duration: session.duration,
          type: session.type,
          notes: session.notes,
          tags: session.tags
        })
        .select()
        .single()

      if (error) throw error

      const newSession: StudySession = {
        id: data.id,
        subjectId: data.subject_id,
        topicId: data.topic_id,
        startTime: new Date(data.start_time),
        endTime: data.end_time ? new Date(data.end_time) : undefined,
        duration: data.duration,
        notes: data.notes,
        tags: data.tags,
        type: data.type
      }

      setSessions(prev => [newSession, ...prev])

      // Update subject total time
      if (session.type !== "wasted") {
        const { error: updateError } = await supabase.rpc('increment_subject_time', {
          p_subject_id: session.subjectId,
          p_duration: session.duration
        })

        if (updateError) throw updateError

        setSubjects(prev =>
          prev.map(subject =>
            subject.id === session.subjectId
              ? { ...subject, totalTime: subject.totalTime + session.duration }
              : subject
          )
        )
      }
    } catch (error) {
      console.error('Error adding manual session:', error)
    }
  }

  const setGoal = async (goal: Omit<StudyGoal, "id" | "current">) => {
    if (!user) return

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        type: goal.type,
        target: goal.target,
        current: 0,
        subject_id: goal.subjectId
      })
      .select()
      .single()

    if (error) throw error

    const newGoal: StudyGoal = {
      id: data.id,
      type: data.type,
      target: data.target,
      current: data.current,
      subjectId: data.subject_id
    }

    setGoals(prev => [...prev, newGoal])
  }

  const updateGoal = async (id: string, updates: Partial<StudyGoal>) => {
    if (!user) return

    const { error } = await supabase
      .from('goals')
      .update({
        type: updates.type,
        target: updates.target,
        current: updates.current,
        subject_id: updates.subjectId
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    setGoals(prev =>
      prev.map(goal => (goal.id === id ? { ...goal, ...updates } : goal))
    )
  }

  const toggleZenMode = () => {
    setIsZenMode(prev => !prev)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

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
