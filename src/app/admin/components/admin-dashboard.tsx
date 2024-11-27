'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, PlusCircleIcon, UsersIcon } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface Survey {
  _id: string;
  title: string;
  description?: string;
  creatorId: string;
  status: 'draft' | 'active' | 'closed';
  questions: {
    id: string;
    type: 'multiple-choice' | 'text-input' | 'rating-scale';
    text: string;
    options?: string[];
    required: boolean;
    min?: number;
    max?: number;
  }[];
  assignedGroups: string[];
  createdAt: string;
  updatedAt: string;
  theme?: string;
}

interface Response {
  _id: string;
  surveyId: string;
  userId?: string;
  answers?: Map<string, string>;
  submittedAt: string;
  completionTime?: number; // in seconds
}

interface AdminDashboardProps {
  surveys: Survey[];
  responses: Response[];
}

export default function AdminDashboard({ surveys, responses }: AdminDashboardProps) {
  const [surveyData, setSurveyData] = useState<{ name: string; total: number; active: number }[]>([])
  const [responseData, setResponseData] = useState<{ name: string; responses: number }[]>([])
  const [activeSurveys, setActiveSurveys] = useState<Survey[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<string>('')
  const [averageResponseTimes, setAverageResponseTimes] = useState<{ name: string; time: number }[]>([])
  const [leaderboard, setLeaderboard] = useState<{ name: string; count: number }[]>([])
  const [surveyInsights, setSurveyInsights] = useState<{
    totalResponses: number;
    completionRate: number;
    averageTime: number;
  }>({ totalResponses: 0, completionRate: 0, averageTime: 0 })

  useEffect(() => {
    // Filter active surveys
    const filteredActiveSurveys = surveys.filter(survey => survey.status === 'active')
    setActiveSurveys(filteredActiveSurveys)

    // Set the first active survey as the default selected survey
    if (filteredActiveSurveys.length > 0 && !selectedSurvey) {
      setSelectedSurvey(filteredActiveSurveys[0]._id)
    }

    // Process survey data
    const processedSurveyData = surveys.reduce((acc, survey) => {
      const month = new Date(survey.createdAt).toLocaleString('default', { month: 'short' })
      const existingMonth = acc.find(item => item.name === month)
      if (existingMonth) {
        existingMonth.total++
        if (survey.status === 'active') existingMonth.active++
      } else {
        acc.push({ name: month, total: 1, active: survey.status === 'active' ? 1 : 0 })
      }
      return acc
    }, [] as { name: string; total: number; active: number }[])

    // Process response data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toLocaleString('default', { weekday: 'short' })
    }).reverse()

    const processedResponseData = last7Days.map(day => {
      const count = responses.filter(response => {
        const responseDate = new Date(response.submittedAt)
        return responseDate.toLocaleString('default', { weekday: 'short' }) === day
      }).length
      return { name: day, responses: count }
    })

    // Calculate average response times
    const avgResponseTimes = filteredActiveSurveys.map(survey => {
      const surveyResponses = responses.filter(r => r.surveyId === survey._id)
      const surveyCreatedAt = new Date(survey.createdAt).getTime()

      const totalResponseTime = surveyResponses.reduce((sum, response) => {
        const responseTime = new Date(response.submittedAt).getTime() - surveyCreatedAt
        return sum + responseTime
      }, 0)

      const avgTime = surveyResponses.length > 0 ? totalResponseTime / surveyResponses.length : 0
      return { name: survey.title, time: Math.round(avgTime / (1000 * 60)) } // Convert to minutes
    })

    // Create leaderboard
    const leaderboardData = filteredActiveSurveys.map(survey => ({
      name: survey.title,
      count: responses.filter(r => r.surveyId === survey._id).length
    })).sort((a, b) => b.count - a.count).slice(0, 5) // Top 5 surveys

    // Calculate survey-level insights
    const selectedSurveyResponses = responses.filter(r => r.surveyId === selectedSurvey)
    const totalResponses = selectedSurveyResponses.length
    const completionRate = (totalResponses / responses.length) * 100
    const selectedSurveyData = surveys.find(s => s._id === selectedSurvey)
    const surveyCreatedAt = selectedSurveyData ? new Date(selectedSurveyData.createdAt).getTime() : 0
    const averageTime = selectedSurveyResponses.reduce((sum, r) => {
      const responseTime = new Date(r.submittedAt).getTime() - surveyCreatedAt
      return sum + responseTime
    }, 0) / (totalResponses * 60000) || 0 // Convert to minutes

    setSurveyData(processedSurveyData)
    setResponseData(processedResponseData)
    setAverageResponseTimes(avgResponseTimes)
    setLeaderboard(leaderboardData)
    setSurveyInsights({ totalResponses, completionRate, averageTime })
  }, [surveys, responses, selectedSurvey])

  const totalSurveys = surveys.length
  const totalActiveSurveys = activeSurveys.length
  const totalResponses = responses.length

  return (
    <div className="flex-col md:flex overflow-x-hidden">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Link href="/admin/new" className="flex items-center space-x-2">
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create New Survey
            </Button>
          </Link>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSurveys}</div>
                  <p className="text-xs text-muted-foreground">Across all statuses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalActiveSurveys}</div>
                  <p className="text-xs text-muted-foreground">{((totalActiveSurveys / totalSurveys) * 100).toFixed(0)}% of total surveys</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalResponses}</div>
                  <p className="text-xs text-muted-foreground">Across all surveys</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Survey Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={surveyData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total Surveys" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="active" name="Active Surveys" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>User responses in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                      <Tooltip />
                      <Line type="monotone" dataKey="responses" name="Responses" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="mb-4">
              <Select onValueChange={setSelectedSurvey} value={selectedSurvey}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select an active survey" />
                </SelectTrigger>
                <SelectContent>
                  {activeSurveys.map((survey) => (
                    <SelectItem key={survey._id} value={survey._id}>{survey.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyInsights.totalResponses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyInsights.completionRate.toFixed(2)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyInsights.averageTime.toFixed(2)} minutes</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Average Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={averageResponseTimes} layout="vertical" margin={{ left: 100 }}>
                      <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                      <Tooltip />
                      <Bar dataKey="time" name="Average Time (minutes)" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Survey Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={leaderboard} layout="vertical" margin={{ left: 100 }}>
                      <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                      <Tooltip />
                      <Bar dataKey="count" name="Response Count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

