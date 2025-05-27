import { supabase } from "./supabase"
import type { Subject, Topic, StudySession, StudyGoal } from "@/components/study-context"

export interface DatabaseSubject {
  id: string
  user_id: string
  name: string
  color: string
  total_time: number
  goal_time?: number
  created_at: string
  updated_at: string
}

export interface DatabaseTopic {
  id: string
  subject_id: string
  name: string
  total_time: number
  progress: number
  created_at: string
  updated_at: string
}

export interface DatabaseSession {
  id: string
  user_id: string
  subject_id: string
  topic_id?: string
  start_time: string
  end_time?: string
  duration: number
  notes?: string
  tags: string[]
  session_type: "focus" | "break" | "manual" | "wasted"
  created_at: string
  updated_at: string
}

export interface DatabaseGoal {
  id: string
  user_id: string
  goal_type: "daily" | "weekly" | "monthly"
  target: number
  current_progress: number
  subject_id?: string
  created_at: string
  updated_at: string
}

// Subject operations
export const subjectService = {
  async getAll(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from("subjects")
      .select(`
        *,
        topics (*)
      `)
      .order("created_at", { ascending: true })

    if (error) throw error

    return data.map((subject: any) => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      totalTime: subject.total_time,
      goalTime: subject.goal_time,
      topics: subject.topics.map((topic: any) => ({
        id: topic.id,
        name: topic.name,
        totalTime: topic.total_time,
        progress: topic.progress,
      })),
    }))
  },

  async create(subject: Omit<Subject, "id" | "totalTime">): Promise<Subject> {
    const { data, error } = await supabase
      .from("subjects")
      .insert({
        name: subject.name,
        color: subject.color,
        goal_time: subject.goalTime,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      totalTime: data.total_time,
      goalTime: data.goal_time,
      topics: [],
    }
  },

  async update(id: string, updates: Partial<Subject>): Promise<void> {
    const { error } = await supabase
      .from("subjects")
      .update({
        name: updates.name,
        color: updates.color,
        total_time: updates.totalTime,
        goal_time: updates.goalTime,
      })
      .eq("id", id)

    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("subjects").delete().eq("id", id)
    if (error) throw error
  },
}

// Topic operations
export const topicService = {
  async create(subjectId: string, topic: Omit<Topic, "id" | "totalTime" | "progress">): Promise<Topic> {
    const { data, error } = await supabase
      .from("topics")
      .insert({
        subject_id: subjectId,
        name: topic.name,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      totalTime: data.total_time,
      progress: data.progress,
    }
  },

  async update(id: string, updates: Partial<Topic>): Promise<void> {
    const { error } = await supabase
      .from("topics")
      .update({
        name: updates.name,
        total_time: updates.totalTime,
        progress: updates.progress,
      })
      .eq("id", id)

    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("topics").delete().eq("id", id)
    if (error) throw error
  },
}

// Session operations
export const sessionService = {
  async getAll(): Promise<StudySession[]> {
    const { data, error } = await supabase.from("study_sessions").select("*").order("start_time", { ascending: false })

    if (error) throw error

    return data.map((session: DatabaseSession) => ({
      id: session.id,
      subjectId: session.subject_id,
      topicId: session.topic_id,
      startTime: new Date(session.start_time),
      endTime: session.end_time ? new Date(session.end_time) : undefined,
      duration: session.duration,
      notes: session.notes,
      tags: session.tags,
      type: session.session_type,
    }))
  },

  async create(session: Omit<StudySession, "id">): Promise<StudySession> {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        subject_id: session.subjectId,
        topic_id: session.topicId,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime?.toISOString(),
        duration: session.duration,
        notes: session.notes,
        tags: session.tags,
        session_type: session.type,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      duration: data.duration,
      notes: data.notes,
      tags: data.tags,
      type: data.session_type,
    }
  },

  async update(id: string, updates: Partial<StudySession>): Promise<void> {
    const { error } = await supabase
      .from("study_sessions")
      .update({
        subject_id: updates.subjectId,
        topic_id: updates.topicId,
        start_time: updates.startTime?.toISOString(),
        end_time: updates.endTime?.toISOString(),
        duration: updates.duration,
        notes: updates.notes,
        tags: updates.tags,
        session_type: updates.type,
      })
      .eq("id", id)

    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("study_sessions").delete().eq("id", id)
    if (error) throw error
  },
}

// Goal operations
export const goalService = {
  async getAll(): Promise<StudyGoal[]> {
    const { data, error } = await supabase.from("study_goals").select("*").order("created_at", { ascending: true })

    if (error) throw error

    return data.map((goal: DatabaseGoal) => ({
      id: goal.id,
      type: goal.goal_type,
      target: goal.target,
      current: goal.current_progress,
      subjectId: goal.subject_id,
    }))
  },

  async create(goal: Omit<StudyGoal, "id" | "current">): Promise<StudyGoal> {
    const { data, error } = await supabase
      .from("study_goals")
      .insert({
        goal_type: goal.type,
        target: goal.target,
        subject_id: goal.subjectId,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      type: data.goal_type,
      target: data.target,
      current: data.current_progress,
      subjectId: data.subject_id,
    }
  },

  async update(id: string, updates: Partial<StudyGoal>): Promise<void> {
    const { error } = await supabase
      .from("study_goals")
      .update({
        goal_type: updates.type,
        target: updates.target,
        current_progress: updates.current,
        subject_id: updates.subjectId,
      })
      .eq("id", id)

    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("study_goals").delete().eq("id", id)
    if (error) throw error
  },
}

// Profile operations
export const profileService = {
  async get() {
    const { data, error } = await supabase.from("profiles").select("*").single()
    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async upsert(profile: { full_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase.from("profiles").upsert(profile).select().single()

    if (error) throw error
    return data
  },
}
