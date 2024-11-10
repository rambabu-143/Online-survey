'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, ArrowRight } from "lucide-react"
import Link from 'next/link'

type Survey = {
  _id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export default function SurveyAccess() {
  const [surveys, setSurveys] = useState<Survey[]>([])

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('/api/surveys?status=active')
        const data = await response.json()
        setSurveys(data)
      } catch (error) {
        console.error('Error fetching surveys:', error)
      }
    }

    fetchSurveys()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Active Surveys</CardTitle>
        <CardDescription>View and complete active surveys assigned to you</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {surveys.length > 0 ? (
            surveys.map((survey) => (
              <Card key={survey._id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    <Badge variant="default">
                      <Clock className="w-4 h-4 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {survey.description && (
                    <p className="text-sm text-muted-foreground mb-2">{survey.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(survey.updatedAt).toLocaleDateString()}
                    </p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href={`/user/surveys/${survey._id}`}>
                        Take Survey
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No active surveys available.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}