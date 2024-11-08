'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Save, ChevronDown, ChevronUp, FileText } from "lucide-react"

interface Question {
  id: string
  type: "multiple-choice" | "text-input" | "rating-scale"
  text: string
  options?: string[]
  required: boolean
  min?: number
  max?: number
}

interface Template {
  _id?: string
  title: string
  description?: string
  questions: Question[]
  createdAt?: Date
}

const questionTypes = [
  { id: "text-input", name: "Text Input" },
  { id: "rating-scale", name: "Rating Scale" },
  { id: "multiple-choice", name: "Multiple Choice" },
] as const

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState<Template>({
    title: "",
    description: "",
    questions: [],
  })
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates")
        if (!response.ok) throw new Error("Failed to fetch templates")
        const data: Template[] = await response.json()
        setTemplates(data)
      } catch (error) {
        console.error("Error fetching templates:", error)
        toast({
          title: "Error",
          description: "Failed to fetch templates. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchTemplates()
  }, [toast])

  const handleCreateTemplate = () => {
    setCurrentTemplate(null)
    setNewTemplate({
      title: "",
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
      toast({
        title: "Template Deleted",
        description: "The template has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete the template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveTemplate = async () => {
    try {
      if (currentTemplate) {
        const response = await fetch(`/api/templates/${currentTemplate._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTemplate),
        })
        if (!response.ok) throw new Error("Failed to update template")
        const updatedTemplate = await response.json()
        setTemplates(
          templates.map((template) =>
            template._id === currentTemplate._id ? updatedTemplate : template
          )
        )
        toast({
          title: "Template Updated",
          description: "The template has been successfully updated.",
        })
      } else {
        const response = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTemplate),
        })
        if (!response.ok) throw new Error("Failed to create template")
        const newTemplateData = await response.json()
        setTemplates([...templates, newTemplateData])
        toast({
          title: "Template Created",
          description: "A new template has been successfully created.",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save the template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "text-input",
      required: false,
    }
    setNewTemplate({
      ...newTemplate,
      questions: [...newTemplate.questions, newQuestion],
    })
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

  const handleAddOption = (questionId: string) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), ""] }
          : q
      ),
    })
  }

  const handleUpdateOption = (questionId: string, optionIndex: number, value: string) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: q.options?.map((opt, index) =>
              index === optionIndex ? value : opt
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
          ? {
            ...q,
            options: q.options?.filter((_, index) => index !== optionIndex),
          }
          : q
      ),
    })
  }

  const handleUseTemplate = async (template: Template) => {
    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Survey based on ${template.title}`,
          description: template.description,
          questions: template.questions,
        }),
      })
      if (!response.ok) throw new Error("Failed to create survey from template")
      const newSurvey = await response.json()
      toast({
        title: "Survey Created",
        description: `A new survey has been created based on the "${template.title}" template.`,
      })
    } catch (error) {
      console.error("Error creating survey from template:", error)
      toast({
        title: "Error",
        description: "Failed to create a survey from the template. Please try again.",
        variant: "destructive",
      })
    }
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
              <CardTitle>{template.title}</CardTitle>
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
                onClick={() => handleUseTemplate(template)}
                className="text-primary hover:text-primary"
              >
                <FileText className="mr-2 h-4 w-4" /> Use Template
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
                  <div key={question.id} className="space-y-2 border p-3 rounded-md">
                    <div className="flex items-start gap-3">
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${question.id}`}
                        checked={question.required}
                        onCheckedChange={(checked) =>
                          handleUpdateQuestion(question.id, { required: checked as boolean })
                        }
                      />
                      <Label htmlFor={`required-${question.id}`}>Required</Label>
                    </div>
                    {question.type === "rating-scale" && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={question.min || ""}
                          onChange={(e) =>
                            handleUpdateQuestion(question.id, { min: parseInt(e.target.value) })
                          }
                          className="w-20"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={question.max || ""}
                          onChange={(e) =>
                            handleUpdateQuestion(question.id, { max: parseInt(e.target.value) })
                          }
                          className="w-20"
                        />
                      </div>
                    )}
                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        {question.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) =>
                                handleUpdateOption(question.id, index, e.target.value)
                              }
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOption(question.id, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(question.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Option
                        </Button>
                      </div>
                    )}
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