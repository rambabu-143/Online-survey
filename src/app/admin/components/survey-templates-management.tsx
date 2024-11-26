'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Plus, Edit, Trash2, Save, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface Question {
  id: string
  type: 'multiple-choice' | 'text-input' | 'rating-scale' | 'dropdown' | 'slider'
  text: string
  options?: string[]
  required: boolean
  min?: number
  max?: number
}

interface SurveyTemplate {
  _id?: string
  title: string
  description?: string
  questions: Question[]
  createdAt: string
}

const questionTypes = [
  { id: "multiple-choice", name: "Multiple Choice" },
  { id: "text-input", name: "Text Input" },
  { id: "rating-scale", name: "Rating Scale" },
  { id: "dropdown", name: "Dropdown" },
  { id: "slider", name: "Slider" },
] as const

export default function SurveyTemplateManagement() {
  const [templates, setTemplates] = useState<SurveyTemplate[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<SurveyTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState<SurveyTemplate>({
    title: "",
    description: "",
    questions: [],
    createdAt: new Date().toISOString(),
  })
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()
  const [showExistingDialog, setShowExistingDialog] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates")
      if (!response.ok) throw new Error("Failed to fetch survey templates")
      const data: SurveyTemplate[] = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("Error fetching survey templates:", error)
      toast({ title: "Error", description: "Failed to fetch survey templates", variant: "destructive" })
    }
  }

  const handleCreateTemplate = () => {
    setCurrentTemplate(null)
    setNewTemplate({
      title: "",
      description: "",
      questions: [],
      createdAt: new Date().toISOString(),
    })
    setIsDialogOpen(true)
  }

  const handleEditTemplate = (template: SurveyTemplate) => {
    setCurrentTemplate(template)
    setNewTemplate({ ...template })
    setIsDialogOpen(true)
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete survey template")
      setTemplates(templates.filter((template) => template._id !== id))
      toast({ title: "Success", description: "Survey template deleted successfully", variant: 'success' })
    } catch (error) {
      console.error("Error deleting survey template:", error)
      toast({ title: "Error", description: "Failed to delete survey template", variant: "destructive" })
    } finally {
      setIsDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handleSaveTemplate = async () => {

    if (!newTemplate.title.trim()) {
      toast({ title: "Error", description: "Please enter a survey title", variant: "destructive" })
      return
    }

    const existingSurvey = templates.find(
      template => template.title === newTemplate.title && template.description === newTemplate.description
    )

    if (existingSurvey && !currentTemplate) {
      setShowExistingDialog(true)
      return
    }
    try {
      const templateData = { ...newTemplate, createdAt: new Date().toISOString() }
      const url = currentTemplate ? `/api/templates/${currentTemplate._id}` : "/api/templates"
      const method = currentTemplate ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      })

      if (!response.ok) throw new Error("Failed to save survey template")

      const savedTemplate = await response.json()
      if (currentTemplate) {
        setTemplates(templates.map((template) => (template._id === savedTemplate._id ? savedTemplate : template)))
      } else {
        setTemplates([...templates, savedTemplate])
      }

      setIsDialogOpen(false)
      toast({ title: "Success", description: `Survey template ${currentTemplate ? "updated" : "created"} successfully`, variant: "success" })
    } catch (error) {
      console.error("Error saving survey template:", error)
      toast({ title: "Error", description: "Failed to save survey template", variant: "destructive" })
    }
  }

  const handleUseTemplate = async (template: SurveyTemplate) => {
    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${template.title} - ${new Date().toLocaleDateString()}`,
          description: template.description,
          creatorId: session?.user?.id,
          status: "draft",
          questions: template.questions,
          assignedGroups: [],
          theme: "default",
        }),
      })

      if (!response.ok) throw new Error("Failed to create survey from template")

      const newSurvey = await response.json()
      toast({ title: "Success", description: `New survey created from template: ${template.title}`, variant: "success" })
      router.push(`/admin/survey-management`)
    } catch (error) {
      console.error("Error creating survey from template:", error)
      toast({ title: "Error", description: "Failed to create survey from template", variant: "destructive" })
    }
  }

  const toggleExpandTemplate = (templateId: string) => {
    setExpandedTemplates((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(templateId)) {
        newSet.delete(templateId)
      } else {
        newSet.add(templateId)
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
    setNewTemplate({ ...newTemplate, questions: [...newTemplate.questions, newQuestion] })
  }

  const handleUpdateQuestion = (questionId: string, updates: Partial<Question>) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    })
  }

  const handleRemoveQuestion = (questionId: string) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.filter((q) => q.id !== questionId),
    })
  }

  const handleAddOption = (questionId: string) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
          : q
      ),
    })
  }

  const handleUpdateOption = (questionId: string, optionIndex: number, newValue: string) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.map((q) =>
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
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: (q.options || []).filter((_, index) => index !== optionIndex) }
          : q
      ),
    })
  }


  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Survey Template Management</h1>
          <p className="text-muted-foreground">Create and manage your survey templates</p>
        </div>
        <Button onClick={handleCreateTemplate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template._id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{template.questions.length} questions</span>
              </div>
              <Button variant="ghost" className="w-full justify-start" onClick={() => toggleExpandTemplate(template._id!)}>
                {expandedTemplates.has(template._id!) ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" /> Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" /> Show Details
                  </>
                )}
              </Button>
              {expandedTemplates.has(template._id!) && (
                <div className="mt-2 space-y-2 text-sm">
                  <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                  <div>
                    <p className="font-semibold">Questions:</p>
                    <ul className="list-disc list-inside">
                      {template.questions.map((question) => (
                        <li key={question.id}>{question.text}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between border-t pt-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleUseTemplate(template)}>
                <Copy className="mr-2 h-4 w-4" /> Use Template
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setTemplateToDelete(template._id!)} className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete this template?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete the survey template.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}>Delete</Button>
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
            <DialogTitle>{currentTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
            <DialogDescription>
              {currentTemplate ? "Edit the details and questions of your survey template." : "Create a new survey template with questions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="templateTitle">Template Title</Label>
              <Input
                id="templateTitle"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                placeholder="Enter template title"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({
                  ...newTemplate,
                  description: e.target.value
                })}
                placeholder="Enter template description"
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between
items-center mb-2">
                <Label>Questions</Label>
                <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                  <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {newTemplate.questions.map((question, index) => (
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
                      <div className="flex flex-col sm:flex-row items-start gap-3">
                        <div className="flex-1 w-full">
                          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                          <Input
                            id={`question-${question.id}`}
                            value={question.text}
                            onChange={(e) => handleUpdateQuestion(question.id, { text: e.target.value })}
                            placeholder="Enter question text"
                            className="mt-1.5"
                          />
                        </div>
                        <div className="w-full sm:w-auto">
                          <Label htmlFor={`question-type-${question.id}`}>Type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => handleUpdateQuestion(question.id, { type: value as Question["type"] })}>
                            <SelectTrigger id={`question-type-${question.id}`} className="w-full sm:w-40 mt-1.5">
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

                      {(question.type === 'multiple-choice' || question.type === 'dropdown') && (
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

                      {(question.type === 'rating-scale' || question.type === 'slider') && (
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

                      {question.type === 'slider' && (
                        <div className="mt-2">
                          <Label>Preview</Label>
                          <Slider
                            defaultValue={[question.min || 1]}
                            max={question.max || 5}
                            min={question.min || 1}
                            step={1}
                          />
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
            <Button onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" /> Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExistingDialog} onOpenChange={setShowExistingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Survey Already Exists</DialogTitle>
            <DialogDescription>
              A Template with the same title and description already exists. Please modify your survey details and try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowExistingDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

