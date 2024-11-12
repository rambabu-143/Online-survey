"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GripVertical, Plus, X, Save, LayoutTemplate } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface Question {
  id: string
  type: "multiple-choice" | "text-input" | "rating-scale"
  text: string
  options?: string[]
  required: boolean
  min?: number
  max?: number
}

interface ISurvey {
  title: string
  description?: string
  creatorId: string
  status: "draft" | "active" | "closed"
  questions: Question[]
  assignedGroups: string[] // Assuming we're using string IDs for simplicity
  theme?: string
}

export default function SurveyBuilder() {
  const { data: session, status } = useSession()
  const [survey, setSurvey] = useState<ISurvey>({
    title: "",
    description: "",
    creatorId: "",
    status: "draft",
    questions: [],
    assignedGroups: [],
    theme: ""
  })
  const [activeTab, setActiveTab] = useState("builder")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setSurvey(prevSurvey => ({
        ...prevSurvey,
        creatorId: session.user.id as string
      }))
    }
  }, [status, session])

  const addQuestion = (type: "text-input" | "multiple-choice" | "rating-scale") => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type,
      text: "",
      options: type === "multiple-choice" ? ["Option 1"] : undefined,
      required: false,
      ...(type === "rating-scale" && { min: 1, max: 5 }),
    }
    setSurvey({ ...survey, questions: [...survey.questions, newQuestion] })
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    })
  }

  const removeQuestion = (id: string) => {
    setSurvey({
      ...survey,
      questions: survey.questions.filter((q) => q.id !== id)
    })
  }

  const handlePublish = async () => {
    if (!survey.title.trim()) {
      toast({ title: "Error", description: "Please enter a survey title", variant: "destructive" })
      return
    }

    if (survey.questions.length === 0) {
      toast({ title: "Error", description: "Please add at least one question", variant: "destructive" })
      return
    }

    if (!survey.creatorId) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...survey,
          status: "active" // Change status to active when publishing
        }),
      })

      if (!response.ok) throw new Error("Failed to create survey")

      const createdSurvey = await response.json()
      toast({ title: "Success", description: "Survey published successfully!", variant: "success" })
      router.push("/admin/survey-management")
    } catch (error) {
      console.error("Error creating survey:", error)
      toast({
        title: "Error",
        description: "Failed to publish survey. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAsTemplate = async () => {
    if (!survey.title.trim()) {
      toast({ title: "Error", description: "Please enter a survey title", variant: "destructive" })
      return
    }

    if (!survey.creatorId) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(survey),
      })

      if (!response.ok) throw new Error("Failed to save template")

      const template = await response.json()
      toast({ title: "Success", description: "Survey saved as template successfully!", variant: "success" })
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderQuestion = (question: Question) => (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <GripVertical className="mr-2 cursor-move text-gray-400 hidden sm:block" />
          <CardTitle className="flex-grow w-full sm:w-auto ">
            <Input
              value={question.text}
              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
              placeholder="Enter question text"
              className="font-semibold text-lg"
            />
          </CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={question.type}
              onValueChange={(value: "text-input" | "multiple-choice" | "rating-scale") =>
                updateQuestion(question.id, { type: value })
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-input">Text Input</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="rating-scale">Rating Scale</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {question.type === "multiple-choice" && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[index] = e.target.value
                      updateQuestion(question.id, { options: newOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index)
                      updateQuestion(question.id, { options: newOptions })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [
                    ...(question.options || []),
                    `Option ${question.options?.length || 0 + 1}`,
                  ]
                  updateQuestion(question.id, { options: newOptions })
                }}
              >
                Add Option
              </Button>
            </div>
          )}
          {question.type === "rating-scale" && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                type="number"
                value={question.min}
                onChange={(e) => updateQuestion(question.id, { min: Number(e.target.value) })}
                placeholder="Min"
              />
              <Input
                type="number"
                value={question.max}
                onChange={(e) => updateQuestion(question.id, { max: Number(e.target.value) })}
                placeholder="Max"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex items-center space-x-2">
            <Switch
              id={`required-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
            />
            <Label htmlFor={`required-${question.id}`}>Required</Label>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )

  const renderPreview = () => (
    <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-inner">
      <h2 className="text-3xl font-bold text-gray-800">{survey.title || "Untitled Survey"}</h2>
      {survey.description && <p className="text-gray-600 mt-2">{survey.description}</p>}
      {survey.questions.map((question) => (
        <Card key={question.id} className="mb-4 bg-white">
          <CardContent className="pt-6">
            <p className="font-semibold text-lg mb-2">{question.text || "Untitled Question"}</p>
            {question.type === "text-input" && (
              <Input placeholder="Your answer..." className="mt-2" />
            )}
            {question.type === "multiple-choice" && (
              <div className="space-y-2 mt-2">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input type="radio" id={`option-${index}`} name={`question-${question.id}`} className="h-4 w-4" />
                    <label htmlFor={`option-${index}`} className="text-sm text-gray-700">{option}</label>
                  </div>
                ))}
              </div>
            )}
            {question.type === "rating-scale" && (
              <div className="mt-2 flex flex-wrap gap-4">
                {Array.from(
                  { length: (question.max || 5) - (question.min || 1) + 1 },
                  (_, i) => (
                    <label key={i} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        className="h-4 w-4 mb-1"
                      />
                      <span className="text-sm text-gray-600">{(question.min || 1) + i}</span>
                    </label>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return <div>Please sign in to create a survey.</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="space-y-4">
        <Input
          value={survey.title}
          onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
          placeholder="Enter survey title"
          className="text-3xl font-bold"
        />
        <Textarea
          value={survey.description}
          onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
          placeholder="Enter survey description (optional)"
          className="text-lg"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="builder" className="w-1/2">Builder</TabsTrigger>
          <TabsTrigger value="preview" className="w-1/2">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="builder">
          <div className="space-y-4">
            {survey.questions.map(renderQuestion)}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => addQuestion("text-input")} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Text Input
              </Button>
              <Button onClick={() => addQuestion("multiple-choice")} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Multiple Choice
              </Button>
              <Button onClick={() => addQuestion("rating-scale")} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Rating Scale
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preview">{renderPreview()}</TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handlePublish} className="w-full sm:w-1/2" size="lg">
          <Save className="mr-2 h-5 w-5" />
          Publish Survey
        </Button>
        <Button onClick={handleSaveAsTemplate} className="w-full sm:w-1/2" size="lg" variant="outline">
          <LayoutTemplate className="mr-2 h-5 w-5" />
          Save as Template
        </Button>
      </div>
    </div>
  )
}