"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { useStudy } from "@/components/study-context"
import { Calendar, Clock, TrendingUp, Target } from "lucide-react"

export function Analytics() {
  const { subjects, sessions, goals } = useStudy()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Prepare data for charts
  const subjectData = subjects.map((subject) => ({
    name: subject.name,
    time: Math.round(subject.totalTime / 60), // Convert to minutes
    color: subject.color,
    sessions: sessions.filter((s) => s.subjectId === subject.id).length,
  }))

  // Daily study time for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  // Update Analytics to include wasted time data
  // Add wasted time to method data
  const methodData = [
    { name: "Focus Sessions", value: sessions.filter((s) => s.type === "focus").length, color: "#3b82f6" },
    { name: "Break Sessions", value: sessions.filter((s) => s.type === "break").length, color: "#10b981" },
    { name: "Manual Entries", value: sessions.filter((s) => s.type === "manual").length, color: "#f59e0b" },
    { name: "Wasted Time", value: sessions.filter((s) => s.type === "wasted").length, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  // Update daily data to separate study time and wasted time
  const dailyData = last7Days.map((date) => {
    const dayStr = date.toDateString()
    const daySessions = sessions.filter((session) => new Date(session.startTime).toDateString() === dayStr)
    const studyTime = daySessions
      .filter((session) => session.type !== "wasted")
      .reduce((sum, session) => sum + session.duration, 0)
    const wastedTime = daySessions
      .filter((session) => session.type === "wasted")
      .reduce((sum, session) => sum + session.duration, 0)

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      studyTime: Math.round(studyTime / 60), // Convert to minutes
      wastedTime: Math.round(wastedTime / 60), // Convert to minutes
      sessions: daySessions.filter((session) => session.type !== "wasted").length,
    }
  })

  // Calculate statistics
  const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0)
  const averageSessionLength = sessions.length > 0 ? totalStudyTime / sessions.length : 0
  const totalSessions = sessions.length
  const mostStudiedSubject = subjects.reduce(
    (max, subject) => (subject.totalTime > (max?.totalTime || 0) ? subject : max),
    null,
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Insights into your study patterns and progress</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalStudyTime)}</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Study sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Session</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(averageSessionLength)}</div>
            <p className="text-xs text-muted-foreground">Per study session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Subject</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostStudiedSubject?.name || "None"}</div>
            <p className="text-xs text-muted-foreground">
              {mostStudiedSubject ? formatTime(mostStudiedSubject.totalTime) : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Study Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Study Time</CardTitle>
            <CardDescription>Your study time over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Update the chart configuration to include wasted time */}
            <ChartContainer
              config={{
                studyTime: {
                  label: "Study Time (minutes)",
                  color: "hsl(var(--chart-1))",
                },
                wastedTime: {
                  label: "Wasted Time (minutes)",
                  color: "hsl(var(--destructive))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="studyTime" fill="var(--color-studyTime)" name="Study Time" />
                  <Bar dataKey="wastedTime" fill="var(--color-wastedTime)" name="Wasted Time" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Time by Subject</CardTitle>
            <CardDescription>Distribution of study time across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                time: {
                  label: "Study Time (minutes)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    dataKey="time"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}m`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Detailed breakdown by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectData.map((subject) => (
              <div key={subject.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">{subject.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatTime(subject.time * 60)}</p>
                  <p className="text-sm text-muted-foreground">
                    {subject.sessions > 0 ? formatTime((subject.time * 60) / subject.sessions) : "0m"} avg
                  </p>
                </div>
              </div>
            ))}
            {subjectData.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No study data available yet. Start tracking your study sessions!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Method Distribution */}
      {methodData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Study Methods</CardTitle>
            <CardDescription>How you prefer to study</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Sessions",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value">
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
