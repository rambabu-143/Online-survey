'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id: number
  text: string
  type: "text-input" | "rating-scale" | "multiple-choice"
}

interface Template {
  _id?: string
  id: number
  title: string
  name: string
  description: string
  questions: Question[]
}

const questionTypes = [
  { id: "text-input", name: "text-input" },
  { id: "rating-scale", name: "rating-scale" },
  { id: "multiple-choice", name: "multiple-choice" },
] as const

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState<Template>({
    id: Date.now(),
    title: "",
    name: "",
    description: "",
    questions: [],
  })
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates")
        if (!response.ok) throw new Error("Failed to fetch templates")
        const data: Template[] = await response.json()
        setTemplates(data)
      } catch (error) {
        console.error("Error fetching templates:", error)
      }
    }

    fetchTemplates()
  }, [])

  const handleCreateTemplate = () => {
    setCurrentTemplate(null)
    setNewTemplate({
      id: Date.now(),
      title: "",
      name: "",
      description: "",
      questions: [],
    })
    setIsDialogOpen(true)
  }

  const handleEditTemplate = (template: Template) => {
    setCurrentTemplate(template)
    setNewTemplate({ ...template })
    setIsDialogOpen(true)
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete template")
      setTemplates(templates.filter((template) => template._id !== id))
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        ...newTemplate,
        title: newTemplate.name, // Set title to be the same as name
      }

      if (currentTemplate) {
        const response = await fetch(`/api/templates/${currentTemplate._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateData),
        })
        if (!response.ok) throw new Error("Failed to update template")
        const updatedTemplate = await response.json()
        setTemplates(
          templates.map((template) =>
            template._id === currentTemplate._id ? updatedTemplate : template
          )
        )
      } else {
        const response = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateData),
        })
        if (!response.ok) throw new Error("Failed to create template")
        const newTemplateData = await response.json()
        setTemplates([...templates, newTemplateData])
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving template:", error)
    }
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: newTemplate.questions.length > 0 ? newTemplate.questions[newTemplate.questions.length - 1].id + 1 : 1,
      text: "",
      type: "text-input",
    }
    setNewTemplate({
      ...newTemplate,
      questions: [...newTemplate.questions, newQuestion],
    })
  }

  const handleUpdateQuestion = (questionId: number, updates: Partial<Question>) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    })
  }

  const handleRemoveQuestion = (questionId: number) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.filter((q) => q.id !== questionId),
    })
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

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Survey Templates</h1>
          <p className="text-muted-foreground">Create and manage survey templates</p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template._id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{template.title || template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{template.questions.length} questions</span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => toggleExpandTemplate(template._id!)}
              >
                {expandedTemplates.has(template._id!) ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" /> Hide Questions
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" /> Show Questions
                  </>
                )}
              </Button>
              {expandedTemplates.has(template._id!) && (
                <ul className="mt-2 space-y-2">
                  {template.questions.map((question, index) => (
                    <li key={question.id} className="text-sm">
                      {index + 1}. {question.text}
                      <span className="text-muted-foreground ml-1">({question.type})</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteTemplate(template._id!)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{currentTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
            <DialogDescription>
              {currentTemplate
                ? "Edit the details and questions of your survey template."
                : "Create a new survey template with questions for future use."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value, title: e.target.value })}
                placeholder="Enter template name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Enter template description"
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
              <div className="space-y-3">
                {newTemplate.questions.map((question) => (
                  <div key={question.id} className="flex items-start gap-3">
                    <Input
                      value={question.text}
                      onChange={(e) =>
                        handleUpdateQuestion(question.id, { text: e.target.value })
                      }
                      placeholder="Enter question text"
                      className="flex-1"
                    />
                    <Select
                      value={question.type}
                      onValueChange={(value) =>
                        handleUpdateQuestion(question.id, { type: value as Question["type"] })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          {question.type ? questionTypes.find(type => type.id === question.type)?.name : "Select Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}