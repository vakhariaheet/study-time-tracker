"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useStudy } from "@/components/study-context"
import { Plus, BookOpen, Clock, Target, Trash2 } from "lucide-react"

const colorOptions = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6366f1",
]

export function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject, addTopic } = useStudy()
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [isAddingTopic, setIsAddingTopic] = useState<string | null>(null)
  const [newSubject, setNewSubject] = useState({ name: "", color: colorOptions[0] })
  const [newTopic, setNewTopic] = useState("")

  const handleAddSubject = () => {
    if (newSubject.name.trim()) {
      addSubject({
        name: newSubject.name,
        color: newSubject.color,
        topics: [],
      })
      setNewSubject({ name: "", color: colorOptions[0] })
      setIsAddingSubject(false)
    }
  }

  const handleAddTopic = (subjectId: string) => {
    if (newTopic.trim()) {
      addTopic(subjectId, { name: newTopic })
      setNewTopic("")
      setIsAddingTopic(null)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
          <p className="text-muted-foreground">Manage your study subjects and topics</p>
        </div>
        <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Create a new subject to organize your study sessions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  placeholder="e.g., Mathematics, History, Programming"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newSubject.color === color ? "border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSubject((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingSubject(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubject}>Add Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSubject(subject.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(subject.totalTime)}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {subject.topics.length} topics
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Goal Progress */}
              {subject.goalTime && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Goal Progress
                    </span>
                    <span>{Math.round((subject.totalTime / subject.goalTime) * 100)}%</span>
                  </div>
                  <Progress value={(subject.totalTime / subject.goalTime) * 100} className="h-2" />
                </div>
              )}

              {/* Topics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Topics</h4>
                  <Dialog
                    open={isAddingTopic === subject.id}
                    onOpenChange={(open) => setIsAddingTopic(open ? subject.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Topic to {subject.name}</DialogTitle>
                        <DialogDescription>Create a new topic to track specific areas of study.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="topic-name">Topic Name</Label>
                          <Input
                            id="topic-name"
                            placeholder="e.g., Algebra, World War II, React Hooks"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingTopic(null)}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleAddTopic(subject.id)}>Add Topic</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-1">
                  {subject.topics.length > 0 ? (
                    subject.topics.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between text-sm">
                        <span>{topic.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatTime(topic.totalTime)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No topics yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {subjects.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No subjects yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first subject to start organizing your study sessions.
              </p>
              <Button onClick={() => setIsAddingSubject(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Subject
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
