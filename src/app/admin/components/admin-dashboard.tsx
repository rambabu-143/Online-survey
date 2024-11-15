'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, PlusCircleIcon, UsersIcon } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

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
}

interface AdminDashboardProps {
  surveys: Survey[];
  responses: Response[];
}

export default function AdminDashboard({ surveys, responses }: AdminDashboardProps) {
  const [surveyData, setSurveyData] = useState<{ name: string; total: number; active: number }[]>([])
  const [responseData, setResponseData] = useState<{ name: string; responses: number }[]>([])

  useEffect(() => {
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

    // Process response data
    const processedResponseData = responses.reduce((acc, response) => {
      const day = new Date(response.submittedAt).toLocaleString('default', { weekday: 'short' })
      const existingDay = acc.find(item => item.name === day)
      if (existingDay) {
        existingDay.responses++
      } else {
        acc.push({ name: day, responses: 1 })
      }
      return acc
    }, [] as { name: string; responses: number }[])

    setSurveyData(processedSurveyData)
    setResponseData(processedResponseData)
  }, [surveys, responses])

  const totalSurveys = surveys.length
  const activeSurveys = surveys.filter(survey => survey.status === 'active').length
  const totalResponses = responses.length

  return (
    <div className="flex-col md:flex">
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
                  <div className="text-2xl font-bold">{activeSurveys}</div>
                  <p className="text-xs text-muted-foreground">{((activeSurveys / totalSurveys) * 100).toFixed(0)}% of total surveys</p>
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
                      <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="active" fill="#82ca9d" radius={[4, 4, 0, 0]} />
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
                      <Line type="monotone" dataKey="responses" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Survey Completion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={surveys.map(survey => ({
                      name: survey.title,
                      completionRate: (responses.filter(r => r.surveyId === survey._id).length / totalResponses) * 100
                    }))}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                      <Line type="monotone" dataKey="completionRate" stroke="#8884d8" strokeWidth={2} dot={{ fill: "#8884d8", r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Survey Distribution</CardTitle>
                  <CardDescription>By status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: "Active", count: activeSurveys },
                      { name: "Draft", count: surveys.filter(s => s.status === 'draft').length },
                      { name: "Closed", count: surveys.filter(s => s.status === 'closed').length },
                    ]}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                      <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
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