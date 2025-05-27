"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStudy } from "@/components/study-context"
import { Download, Upload, Trash2, Target, Moon, Sun } from "lucide-react"
import { UserProfile } from "@/components/auth/user-profile"

export function Settings() {
  const { goals, setGoal, updateGoal, subjects, sessions, user } = useStudy()
  const [dailyGoal, setDailyGoal] = useState("")
  const [weeklyGoal, setWeeklyGoal] = useState("")
  const [monthlyGoal, setMonthlyGoal] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [pomodoroLength, setPomodoroLength] = useState("25")
  const [breakLength, setBreakLength] = useState("5")
  const [isLoading, setIsLoading] = useState(false)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const handleSetDailyGoal = async () => {
    if (dailyGoal) {
      const minutes = Number.parseInt(dailyGoal)
      if (minutes > 0) {
        setIsLoading(true)
        try {
          await setGoal({
            type: "daily",
            target: minutes * 60, // Convert to seconds
          })
          setDailyGoal("")
        } catch (error) {
          console.error("Error setting daily goal:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  const handleSetWeeklyGoal = async () => {
    if (weeklyGoal) {
      const hours = Number.parseInt(weeklyGoal)
      if (hours > 0) {
        setIsLoading(true)
        try {
          await setGoal({
            type: "weekly",
            target: hours * 3600, // Convert to seconds
          })
          setWeeklyGoal("")
        } catch (error) {
          console.error("Error setting weekly goal:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  const handleSetMonthlyGoal = async () => {
    if (monthlyGoal) {
      const hours = Number.parseInt(monthlyGoal)
      if (hours > 0) {
        setIsLoading(true)
        try {
          await setGoal({
            type: "monthly",
            target: hours * 3600, // Convert to seconds
          })
          setMonthlyGoal("")
        } catch (error) {
          console.error("Error setting monthly goal:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  const exportData = () => {
    const data = {
      subjects,
      sessions,
      goals,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `study-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      // Note: In a real app, you'd want to implement a proper data clearing function
      // that removes data from Supabase as well
      localStorage.clear()
      window.location.reload()
    }
  }

  const currentDailyGoal = goals.find((g) => g.type === "daily")
  const currentWeeklyGoal = goals.find((g) => g.type === "weekly")
  const currentMonthlyGoal = goals.find((g) => g.type === "monthly")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Customize your study tracking experience</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Profile */}
        {user && (
          <div className="lg:col-span-2">
            <UserProfile user={user} />
          </div>
        )}

        {/* Study Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Goals
            </CardTitle>
            <CardDescription>Set daily, weekly, and monthly study targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Daily Goal</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Minutes per day"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    type="number"
                  />
                  <Button onClick={handleSetDailyGoal} size="sm" disabled={isLoading}>
                    Set
                  </Button>
                </div>
                {currentDailyGoal && (
                  <p className="text-sm text-muted-foreground">
                    Current: {formatTime(currentDailyGoal.target)} per day
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Weekly Goal</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Hours per week"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    type="number"
                  />
                  <Button onClick={handleSetWeeklyGoal} size="sm" disabled={isLoading}>
                    Set
                  </Button>
                </div>
                {currentWeeklyGoal && (
                  <p className="text-sm text-muted-foreground">
                    Current: {formatTime(currentWeeklyGoal.target)} per week
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Monthly Goal</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Hours per month"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                    type="number"
                  />
                  <Button onClick={handleSetMonthlyGoal} size="sm" disabled={isLoading}>
                    Set
                  </Button>
                </div>
                {currentMonthlyGoal && (
                  <p className="text-sm text-muted-foreground">
                    Current: {formatTime(currentMonthlyGoal.target)} per month
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Timer Settings</CardTitle>
            <CardDescription>Customize your Pomodoro timer intervals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Focus Session Length</Label>
              <Select value={pomodoroLength} onValueChange={setPomodoroLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Break Length</Label>
              <Select value={breakLength} onValueChange={setBreakLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>App Preferences</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when sessions end</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Backup, restore, or clear your study data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button onClick={exportData} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
              <Button onClick={clearAllData} variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Export your data regularly to keep a backup. Clearing data cannot be undone.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>App Statistics</CardTitle>
          <CardDescription>Overview of your study tracking data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{subjects.length}</p>
              <p className="text-sm text-muted-foreground">Total Subjects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Study Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatTime(sessions.reduce((sum, session) => sum + session.duration, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Total Study Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
