'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, ArrowRight, Loader2 } from "lucide-react"
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

type Survey = {
  _id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
  groupName: string;
}

export default function SurveyAccess() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAssignedSurveys = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users/assigned-surveys')
        if (!response.ok) {
          throw new Error('Failed to fetch assigned surveys')
        }
        const data = await response.json()
        setSurveys(data)
      } catch (error) {
        console.error('Error fetching assigned surveys:', error)
        toast({
          title: "Error",
          description: "Failed to load assigned surveys. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignedSurveys()
  }, [toast])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Your Assigned Surveys</CardTitle>
        <CardDescription>View and complete surveys assigned to your groups</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            {surveys.length > 0 ? (
              surveys.map((survey) => (
                <Card key={survey._id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <Badge variant={survey.status === 'active' ? "default" : "secondary"}>
                        <Clock className="w-4 h-4 mr-1" />
                        {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {survey.description && (
                      <p className="text-sm text-muted-foreground mb-2">{survey.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Group: {survey.groupName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date(survey.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button asChild variant="outline" className="mt-2" disabled={survey.status !== 'active'}>
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
              <p className="text-center text-muted-foreground">No assigned surveys available.</p>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}