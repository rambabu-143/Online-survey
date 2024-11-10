'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save, ChevronDown, ChevronUp, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  type: 'multiple-choice' | 'text-input' | 'rating-scale'
  text: string
  options?: string[]
  required: boolean
  min?: number
  max?: number
}

interface Survey {
  _id?: string
  title: string
  description?: string
  creatorId: string
  status: 'draft' | 'active' | 'closed'
  questions: Question[]
  createdAt: string
  updatedAt: string
  theme?: string
  assignedGroups: string[]
}

interface UserGroup {
  _id: string
  name: string
  description?: string
  members: string[]
}

const statusOptions = [
  { id: "draft", name: "Draft" },
  { id: "active", name: "Active" },
  { id: "closed", name: "Closed" },
] as const

const questionTypes = [
  { id: "multiple-choice", name: "Multiple Choice" },
  { id: "text-input", name: "Text Input" },
  { id: "rating-scale", name: "Rating Scale" },
] as const

export default function SurveyManagement() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssignGroupsDialogOpen, setIsAssignGroupsDialogOpen] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null)
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null)
  const [newSurvey, setNewSurvey] = useState<Survey>({
    title: "",
    description: "",
    creatorId: "", // This should be set to the current user's ID in a real application
    status: "draft",
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedGroups: [],
  })
  const [expandedSurveys, setExpandedSurveys] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSurveys()
    fetchGroups()
  }, [])

  const fetchSurveys = async () => {
    try {
      const response = await fetch("/api/surveys")
      if (!response.ok) throw new Error("Failed to fetch surveys")
      const data: Survey[] = await response.json()
      setSurveys(data)
    } catch (error) {
      console.error("Error fetching surveys:", error)
      toast({ title: "Error", description: "Failed to fetch surveys", variant: "destructive" })
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      if (!response.ok) throw new Error("Failed to fetch groups")
      const data: UserGroup[] = await response.json()
      setGroups(data)
    } catch (error) {
      console.error("Error fetching groups:", error)
      toast({ title: "Error", description: "Failed to fetch groups", variant: "destructive" })
    }
  }

  const handleCreateSurvey = () => {
    setCurrentSurvey(null)
    setNewSurvey({
      title: "",
      description: "",
      creatorId: "",
      status: "draft",
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedGroups: [],
    })
    setIsDialogOpen(true)
  }

  const handleEditSurvey = (survey: Survey) => {
    setCurrentSurvey(survey)
    setNewSurvey({ ...survey })
    setIsDialogOpen(true)
  }

  const handleDeleteSurvey = async (id: string) => {
    try {
      const response = await fetch(`/api/surveys/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete survey")
      setSurveys(surveys.filter((survey) => survey._id !== id))
      toast({ title: "Success", description: "Survey deleted successfully" })
    } catch (error) {
      console.error("Error deleting survey:", error)
      toast({ title: "Error", description: "Failed to delete survey", variant: "destructive" })
    } finally {
      setIsDeleteDialogOpen(false)
      setSurveyToDelete(null)
    }
  }

  const handleSaveSurvey = async () => {
    try {
      const surveyData = { ...newSurvey, updatedAt: new Date().toISOString() }
      const url = currentSurvey ? `/api/surveys/${currentSurvey._id}` : "/api/surveys"
      const method = currentSurvey ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      })

      if (!response.ok) throw new Error("Failed to save survey")

      const savedSurvey = await response.json()
      if (currentSurvey) {
        setSurveys(surveys.map((survey) => (survey._id === savedSurvey._id ? savedSurvey : survey)))
      } else {
        setSurveys([...surveys, savedSurvey])
      }

      setIsDialogOpen(false)
      toast({ title: "Success", description: `Survey ${currentSurvey ? "updated" : "created"} successfully` })
    } catch (error) {
      console.error("Error saving survey:", error)
      toast({ title: "Error", description: "Failed to save survey", variant: "destructive" })
    }
  }

  const handleAssignGroups = async (surveyId: string, groupIds: string[]) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIds }),
      })

      if (!response.ok) throw new Error("Failed to assign groups to survey")

      const updatedSurvey = await response.json()
      setSurveys(surveys.map((survey) => (survey._id === updatedSurvey._id ? updatedSurvey : survey)))
      setIsAssignGroupsDialogOpen(false)
      toast({ title: "Success", description: "Groups assigned to survey successfully" })
    } catch (error) {
      console.error("Error assigning groups to survey:", error)
      toast({ title: "Error", description: "Failed to assign groups to survey", variant: "destructive" })
    }
  }

  const toggleExpandSurvey = (surveyId: string) => {
    setExpandedSurveys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(surveyId)) {
        newSet.delete(surveyId)
      } else {
        newSet.add(surveyId)
      }
      return newSet
    })
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "text-input",
      text: "",
      required: false,
    }
    setNewSurvey({ ...newSurvey, questions: [...newSurvey.questions, newQuestion] })
  }

  const handleUpdateQuestion = (questionId: string, updates: Partial<Question>) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    })
  }

  const handleRemoveQuestion = (questionId: string) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.filter((q) => q.id !== questionId),
    })
  }

  const handleAddOption = (questionId: string) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
          : q
      ),
    })
  }

  const handleUpdateOption = (questionId: string, optionIndex: number, newValue: string) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: (q.options || []).map((opt, index) =>
              index === optionIndex ? newValue : opt
            ),
          }
          : q
      ),
    })
  }

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: (q.options || []).filter((_, index) => index !== optionIndex) }
          : q
      ),
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Survey Management</h1>
          <p className="text-muted-foreground">Create and manage your surveys</p>
        </div>
        <Button onClick={handleCreateSurvey}>
          <Plus className="mr-2 h-4 w-4" /> Create Survey
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <Card key={survey._id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription>{survey.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className={`px-2 py-1 rounded-full ${survey.status === 'active' ? 'bg-green-100 text-green-800' :
                  survey.status === 'closed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                </span>
                <span>•</span>
                <span>{survey.questions.length} questions</span>
                <span>•</span>
                <span>{survey.assignedGroups.length} groups</span>
              </div>
              <Button variant="ghost" className="w-full justify-start" onClick={() => toggleExpandSurvey(survey._id!)}>
                {expandedSurveys.has(survey._id!) ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" /> Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" /> Show Details
                  </>
                )}
              </Button>
              {expandedSurveys.has(survey._id!) && (
                <div className="mt-2 space-y-2 text-sm">
                  <p>Created: {new Date(survey.createdAt).toLocaleDateString()}</p>
                  <p>Updated: {new Date(survey.updatedAt).toLocaleDateString()}</p>
                  <p>Theme: {survey.theme || 'Default'}</p>
                  <div>
                    <p className="font-semibold">Questions:</p>
                    <ul className="list-disc list-inside">
                      {survey.questions.map((question) => (
                        <li key={question.id}>{question.text}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Assigned Groups:</p>
                    <ul className="list-disc list-inside">
                      {survey.assignedGroups.map((groupId) => {
                        const group = groups.find(g => g._id === groupId)
                        return <li key={groupId}>{group ? group.name : 'Unknown Group'}</li>
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => handleEditSurvey(survey)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setCurrentSurvey(survey)
                setIsAssignGroupsDialogOpen(true)
              }}>
                <Users className="mr-2 h-4 w-4" /> Assign Groups
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSurveyToDelete(survey._id!)} className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this survey?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete the survey and all its data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => surveyToDelete && handleDeleteSurvey(surveyToDelete)}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentSurvey ? "Edit Survey" : "Create New Survey"}</DialogTitle>
            <DialogDescription>
              {currentSurvey ? "Edit the details and questions of your survey." : "Create a new survey with questions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="surveyTitle">Survey Title</Label>
                <Input
                  id="surveyTitle"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  placeholder="Enter survey title"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="surveyStatus">Status</Label>
                <Select
                  value={newSurvey.status}
                  onValueChange={(value) => setNewSurvey({ ...newSurvey, status: value as 'draft' | 'active' | 'closed' })}>
                  <SelectTrigger className="w-full mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="surveyDescription">Description</Label>
              <Textarea
                id="surveyDescription"
                value={newSurvey.description}
                onChange={(e) => setNewSurvey({
                  ...newSurvey,
                  description: e.target.value
                })}
                placeholder="Enter survey description"
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Questions</Label>
                <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                  <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {newSurvey.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                          <Input
                            id={`question-${question.id}`}
                            value={question.text}
                            onChange={(e) => handleUpdateQuestion(question.id, { text: e.target.value })}
                            placeholder="Enter question text"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`question-type-${question.id}`}>Type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => handleUpdateQuestion(question.id, { type: value as Question["type"] })}>
                            <SelectTrigger id={`question-type-${question.id}`} className="w-40 mt-1.5">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {questionTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => handleUpdateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveOption(question.id, optionIndex)}
                                className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => handleAddOption(question.id)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Option
                          </Button>
                        </div>
                      )}

                      {question.type === 'rating-scale' && (
                        <div className="space-y-2">
                          <Label>Scale Range</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={question.min || 1}
                              onChange={(e) => handleUpdateQuestion(question.id, { min: parseInt(e.target.value) })}
                              placeholder="Min"
                              className="w-20"
                            />
                            <span>to</span>
                            <Input
                              type="number"
                              value={question.max || 5}
                              onChange={(e) => handleUpdateQuestion(question.id, { max: parseInt(e.target.value) })}
                              placeholder="Max"
                              className="w-20"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required-${question.id}`}
                          checked={question.required}
                          onChange={(e) => handleUpdateQuestion(question.id, { required: e.target.checked })}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label htmlFor={`required-${question.id}`}>Required</Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSurvey}>
              <Save className="mr-2 h-4 w-4" /> Save Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignGroupsDialogOpen} onOpenChange={setIsAssignGroupsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Groups to Survey</DialogTitle>
            <DialogDescription>
              Select the groups you want to assign to this survey.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`group-${group._id}`}
                  checked={currentSurvey?.assignedGroups.includes(group._id)}
                  onChange={(e) => {
                    if (currentSurvey) {
                      const updatedGroups = e.target.checked
                        ? [...currentSurvey.assignedGroups, group._id]
                        : currentSurvey.assignedGroups.filter(id => id !== group._id)
                      setCurrentSurvey({ ...currentSurvey, assignedGroups: updatedGroups })
                    }
                  }}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor={`group-${group._id}`}>{group.name}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAssignGroupsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => currentSurvey && handleAssignGroups(currentSurvey._id!, currentSurvey.assignedGroups)}>
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}