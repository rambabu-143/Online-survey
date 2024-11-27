'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface Survey {
    _id: string
    title: string
    status: 'draft' | 'active' | 'closed'
    questions: {
        id: string
        text: string
        type: string
        options?: string[]
    }[]
}

interface Response {
    _id: string
    surveyId: string
    userId?: string
    username: string
    answers: { [key: string]: string }
    submittedAt: string
}

interface AggregatedResponse {
    surveyId: string
    surveyTitle: string
    totalResponses: number
    averageAnswers: number
    responseDistribution: { [key: string]: number }
}

interface ExtendedJsPDF extends jsPDF {
    autoTable: (options: any) => void
}

export default function SurveyAnalytics() {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [responses, setResponses] = useState<Response[]>([])
    const [aggregatedResponses, setAggregatedResponses] = useState<AggregatedResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const [surveysRes, responsesRes] = await Promise.all([
                    fetch('/api/surveys'),
                    fetch('/api/responses')
                ])
                if (!surveysRes.ok || !responsesRes.ok) throw new Error('Failed to fetch data')
                const surveysData: Survey[] = await surveysRes.json()
                const responsesData: Response[] = await responsesRes.json()
                setSurveys(surveysData)
                setResponses(responsesData)
                const aggregated = aggregateResponses(surveysData, responsesData)
                setAggregatedResponses(aggregated)
                if (aggregated.length > 0) {
                    setSelectedSurvey(aggregated[0].surveyId)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load survey data. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const aggregateResponses = (surveys: Survey[], responses: Response[]): AggregatedResponse[] => {
        const aggregated: { [key: string]: AggregatedResponse } = {}

        surveys.forEach(survey => {
            aggregated[survey._id] = {
                surveyId: survey._id,
                surveyTitle: survey.title,
                totalResponses: 0,
                averageAnswers: 0,
                responseDistribution: {}
            }
        })

        responses.forEach(response => {
            if (aggregated[response.surveyId]) {
                aggregated[response.surveyId].totalResponses++
                aggregated[response.surveyId].averageAnswers += Object.keys(response.answers).length

                Object.keys(response.answers).forEach(questionId => {
                    if (!aggregated[response.surveyId].responseDistribution[questionId]) {
                        aggregated[response.surveyId].responseDistribution[questionId] = 0
                    }
                    aggregated[response.surveyId].responseDistribution[questionId]++
                })
            }
        })

        return Object.values(aggregated).map(item => ({
            ...item,
            averageAnswers: item.averageAnswers / item.totalResponses || 0
        }))
    }

    const exportToPDF = () => {
        const doc = new jsPDF('p', 'pt', 'a4') as ExtendedJsPDF
        const selectedData = aggregatedResponses.find(r => r.surveyId === selectedSurvey)
        const selectedSurveyData = surveys.find(s => s._id === selectedSurvey)
        const selectedResponses = responses.filter(r => r.surveyId === selectedSurvey)

        if (selectedData && selectedSurveyData) {
            // Add header
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text(`Survey Analytics - ${selectedData.surveyTitle}`, 40, 40)

            // Add summary information
            doc.setFontSize(12)
            doc.setTextColor(80, 80, 80)
            doc.text(`Total Responses: ${selectedData.totalResponses}`, 40, 70)
            doc.text(`Average Answers per Response: ${selectedData.averageAnswers.toFixed(2)}`, 40, 90)

            // Add Questions and Answers Summary
            doc.setFontSize(16)
            doc.setTextColor(40, 40, 40)
            doc.text('Questions and Answers Summary', 40, 120)

            const questionData = selectedSurveyData.questions.map((question, index) => [
                `${index + 1}. ${question.text}`,
                selectedData.responseDistribution[question.id] || 0
            ])

            doc.autoTable({
                startY: 140,
                head: [['Question', 'Number of Answers']],
                body: questionData,
                styles: { fontSize: 10, cellPadding: 5 },
                headStyles: { fillColor: [66, 139, 202], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            })

            // Add Detailed User Responses
            doc.addPage()
            doc.setFontSize(16)
            doc.setTextColor(40, 40, 40)
            doc.text('Detailed User Responses', 40, 40)

            const userResponsesData = selectedResponses.flatMap(response =>
                Object.entries(response.answers).map(([questionId, answer]) => {
                    const question = selectedSurveyData.questions.find(q => q.id === questionId)
                    return [
                        response.username,
                        question ? question.text : 'Unknown Question',
                        answer,
                        new Date(response.submittedAt).toLocaleString()
                    ]
                })
            )

            doc.autoTable({
                startY: 60,
                head: [['Username', 'Question', 'Answer', 'Submitted At']],
                body: userResponsesData,
                styles: { fontSize: 8, cellPadding: 5 },
                headStyles: { fillColor: [66, 139, 202], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            })

            // Add chart
            if (chartRef.current) {
                doc.addPage()
                doc.setFontSize(16)
                doc.setTextColor(40, 40, 40)
                doc.text('Response Distribution Chart', 40, 40)

                const canvas = document.createElement('canvas')
                canvas.width = chartRef.current.offsetWidth
                canvas.height = chartRef.current.offsetHeight
                const ctx = canvas.getContext('2d')

                if (ctx) {
                    const chartNode = chartRef.current.querySelector('svg')
                    if (chartNode) {
                        const svgString = new XMLSerializer().serializeToString(chartNode)
                        const img = new Image()
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0)
                            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 40, 60, 500, 300)
                            doc.save(`survey_analytics_${selectedData?.surveyTitle}.pdf`)
                        }
                        img.src = 'data:image/svg+xml;base64,' + btoa(svgString)
                    }
                }
            } else {
                doc.save(`survey_analytics_${selectedData?.surveyTitle}.pdf`)
            }
        }
    }

    const exportToCSV = () => {
        const selectedData = aggregatedResponses.find(r => r.surveyId === selectedSurvey)
        const selectedSurveyData = surveys.find(s => s._id === selectedSurvey)
        const selectedResponses = responses.filter(r => r.surveyId === selectedSurvey)

        if (selectedData && selectedSurveyData) {
            let csvContent = "data:text/csv;charset=utf-8,"
            csvContent += "Username,Question,Answer,Submitted At\n"
            selectedResponses.forEach(response => {
                Object.entries(response.answers).forEach(([questionId, answer]) => {
                    const question = selectedSurveyData.questions.find(q => q.id === questionId)
                    csvContent += `"${response.username}","${question ? question.text : 'Unknown Question'}","${answer}","${new Date(response.submittedAt).toLocaleString()}"\n`
                })
            })

            const encodedUri = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", encodedUri)
            link.setAttribute("download", `survey_analytics_${selectedData.surveyTitle}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const selectedData = aggregatedResponses.find(r => r.surveyId === selectedSurvey)
    const chartData = selectedData ? Object.entries(selectedData.responseDistribution).map(([questionId, count]) => {
        const question = surveys.find(s => s._id === selectedSurvey)?.questions.find(q => q.id === questionId)
        return {
            question: question ? question.text : questionId,
            count
        }
    }) : []

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Survey Responses Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <p className="text-4xl font-bold">{responses.length}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Unique Surveys</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <p className="text-4xl font-bold">{surveys.length}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Avg Answers per Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <p className="text-4xl font-bold">
                                {(responses.reduce((sum, response) => sum + Object.keys(response.answers).length, 0) / responses.length || 0).toFixed(2)}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Survey Selection and Export</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Select value={selectedSurvey || ''} onValueChange={setSelectedSurvey}>
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Select Survey" />
                            </SelectTrigger>
                            <SelectContent>
                                {aggregatedResponses
                                    .filter(response => surveys.find(s => s._id === response.surveyId)?.status === 'active')
                                    .map((response) => (
                                        <SelectItem key={response.surveyId} value={response.surveyId}>
                                            {response.surveyTitle}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        <Button onClick={exportToPDF}>Export to PDF</Button>
                        <Button onClick={exportToCSV}>Export to CSV</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Response Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : (
                        <div ref={chartRef}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="question" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Response Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Survey</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead>Number of Answers</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {responses.map((response) => (
                                        <TableRow key={response._id}>
                                            <TableCell>{aggregatedResponses.find(r => r.surveyId === response.surveyId)?.surveyTitle || response.surveyId}</TableCell>
                                            <TableCell>{response.username}</TableCell>
                                            <TableCell>{new Date(response.submittedAt).toLocaleString()}</TableCell>
                                            <TableCell>{Object.keys(response.answers).length}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

