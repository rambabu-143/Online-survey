'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Send } from "lucide-react"

type Question = {
    id: string
    type: 'multiple-choice' | 'text-input' | 'rating-scale'
    text: string
    options?: string[]
    required: boolean
    min?: number
    max?: number
}

type Survey = {
    _id: string
    title: string
    description?: string
    questions: Question[]
}

export default function TakeSurvey({ surveyId, userId }: { surveyId: string; userId?: string }) {
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [answers, setAnswers] = useState<Map<string, string>>(new Map())
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const response = await fetch(`/api/surveys/${surveyId}`)
                const data = await response.json()
                setSurvey(data)
            } catch (error) {
                console.error('Error fetching survey:', error)
            }
        }

        fetchSurvey()
    }, [surveyId])

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(new Map(answers.set(questionId, value)))
    }

    const handleNext = () => {
        if (survey && currentQuestionIndex < survey.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        try {
            const response = {
                surveyId,
                userId,
                answers: Object.fromEntries(answers),
                submittedAt: new Date().toISOString()
            }

            await fetch(`/api/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
            })
            router.push(`/user/surveys/${surveyId}/thank-you`)
        } catch (error) {
            console.error('Error submitting survey:', error)
        }
    }

    if (!survey) {
        return <div>Loading...</div>
    }

    const currentQuestion = survey.questions[currentQuestionIndex]

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{survey.title}</CardTitle>
                <CardDescription>{survey.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of {survey.questions.length}
                    </p>
                </div>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">{currentQuestion.text}</h2>
                    {currentQuestion.type === 'multiple-choice' && (
                        <RadioGroup
                            value={answers.get(currentQuestion.id) || ''}
                            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        >
                            {currentQuestion.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                    {currentQuestion.type === 'text-input' && (
                        <Textarea
                            value={answers.get(currentQuestion.id) || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder="Enter your answer"
                        />
                    )}
                    {currentQuestion.type === 'rating-scale' && (
                        <div className="flex justify-between">
                            {Array.from(
                                { length: (currentQuestion.max || 5) - (currentQuestion.min || 1) + 1 },
                                (_, i) => i + (currentQuestion.min || 1)
                            ).map((value) => (
                                <Button
                                    key={value}
                                    variant={answers.get(currentQuestion.id) === value.toString() ? 'default' : 'outline'}
                                    onClick={() => handleAnswerChange(currentQuestion.id, value.toString())}
                                >
                                    {value}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {currentQuestionIndex === survey.questions.length - 1 ? (
                    <Button onClick={handleSubmit}>
                        Submit <Send className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}