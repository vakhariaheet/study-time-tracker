"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useStudy } from "@/components/study-context"
import { Clock, Target, TrendingUp, Calendar } from "lucide-react"

export function Dashboard() {
  const { subjects, sessions, goals, currentSession, timerTime, isWastedTime } = useStudy()

  // Calculate today's study time (excluding wasted time)
  const today = new Date().toDateString()
  const todaySessions = sessions.filter(
    (session) => new Date(session.startTime).toDateString() === today && session.type !== "wasted",
  )
  const todayTime = todaySessions.reduce((total, session) => total + session.duration, 0)
  const currentSessionTime = currentSession && !isWastedTime ? timerTime : 0
  const totalTodayTime = todayTime + currentSessionTime

  // Calculate today's wasted time
  const todayWastedSessions = sessions.filter(
    (session) => new Date(session.startTime).toDateString() === today && session.type === "wasted",
  )
  const todayWastedTime = todayWastedSessions.reduce((total, session) => total + session.duration, 0)
  const currentWastedTime = currentSession && isWastedTime ? timerTime : 0
  const totalTodayWastedTime = todayWastedTime + currentWastedTime

  // Calculate this week's study time
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekSessions = sessions.filter((session) => new Date(session.startTime) >= weekStart)
  const weekTime = weekSessions.reduce((total, session) => total + session.duration, 0)

  // Calculate study streak
  const calculateStreak = () => {
    const dates = [...new Set(sessions.map((session) => new Date(session.startTime).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )

    let streak = 0
    const today = new Date().toDateString()

    if (dates[0] === today || (dates[0] && totalTodayTime > 0)) {
      streak = 1
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1])
        const currDate = new Date(dates[i])
        const diffTime = prevDate.getTime() - currDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          streak++
        } else {
          break
        }
      }
    }

    return streak
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const dailyGoal = goals.find((goal) => goal.type === "daily")
  const dailyProgress = dailyGoal ? (totalTodayTime / dailyGoal.target) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Track your study progress and stay motivated</p>
      </div>

      {/* Current Session Card */}
      {currentSession && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Current Session
            </CardTitle>
            <CardDescription>{subjects.find((s) => s.id === currentSession.subjectId)?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatTime(timerTime)}</div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTodayTime)}</div>
            {dailyGoal && (
              <div className="mt-2">
                <Progress value={Math.min(dailyProgress, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(dailyProgress)}% of daily goal</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Wasted Today</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatTime(totalTodayWastedTime)}</div>
            <p className="text-xs text-muted-foreground">
              {totalTodayWastedTime > 0 && totalTodayTime > 0
                ? `${Math.round((totalTodayWastedTime / (totalTodayTime + totalTodayWastedTime)) * 100)}% of total time`
                : "Keep it up!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(weekTime + currentSessionTime)}</div>
            <p className="text-xs text-muted-foreground">{weekSessions.length + (currentSession ? 1 : 0)} sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateStreak()}</div>
            <p className="text-xs text-muted-foreground">{calculateStreak() === 1 ? "day" : "days"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Active subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your latest study sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions
              .slice(-5)
              .reverse()
              .map((session) => {
                const subject = subjects.find((s) => s.id === session.subjectId)
                return (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject?.color || "#3b82f6" }} />
                      <div>
                        <p className="font-medium">{subject?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatTime(session.duration)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {session.type}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            {sessions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No study sessions yet. Start your first session!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Overview</CardTitle>
          <CardDescription>Time spent on each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatTime(subject.totalTime)}</p>
                  <p className="text-sm text-muted-foreground">{subject.topics.length} topics</p>
                </div>
              </div>
            ))}
            {subjects.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No subjects created yet. Add your first subject!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
