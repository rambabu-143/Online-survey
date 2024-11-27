'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import SignOutButton from './signout'
import { useSession } from 'next-auth/react'

type Survey = {
  _id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
  groupName: string;
}

type Response = {
  _id: string;
  surveyId: string;
  userId: string;
  submittedAt: string;
  answers: { [key: string]: string };
}

type Question = {
  _id: string;
  text: string;
  type: 'text' | 'textarea';
}

export default function SurveyAccess() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [questions, setQuestions] = useState<{ [key: string]: Question[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { data: session } = useSession();
  const surveyLink = session ? "/user/survey-access" : "/signin";
  if (session?.user.role === 'admin') {
    redirect('/admin');
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [surveysResponse, responsesResponse] = await Promise.all([
          fetch('/api/users/assigned-surveys'),
          fetch('/api/responses')
        ])

        if (!surveysResponse.ok || !responsesResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const surveysData = await surveysResponse.json()
        const responsesData = await responsesResponse.json()

        setSurveys(surveysData)
        setResponses(responsesData)

        // Fetch questions for each survey
        const questionsData: { [key: string]: Question[] } = {}
        for (const survey of surveysData) {
          const questionsResponse = await fetch(`/api/surveys/${survey._id}/questions`)
          if (questionsResponse.ok) {
            questionsData[survey._id] = await questionsResponse.json()
          }
        }
        setQuestions(questionsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const getUserResponse = (surveyId: string) => {
    return responses.find(response => response.userId === session?.user.id && response.surveyId === surveyId)
  }

  return (
    <>
      {/* Header component remains unchanged */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SurveyInsight</h1>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li><Link href="/user/about" className="text-gray-600 hover:text-blue-600">About</Link></li>
              <li><Link href={surveyLink} className="text-gray-600 hover:text-blue-600">Surveys</Link></li>
              {/* <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li> */}
              {session ? (
                <li>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{session?.user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session?.user.email}
                          </p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <SignOutButton />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ) : (
                <li>
                  <Link href='/signin' >Sign In</Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <Card className="w-full ">
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
                surveys.map((survey) => {
                  const userResponse = getUserResponse(survey._id)
                  return (
                    <Card key={survey._id} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{survey.title}</CardTitle>
                          <Badge variant={userResponse ? "success" : survey.status === 'active' ? "default" : "secondary"}>
                            {userResponse ? (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            ) : (
                              <Clock className="w-4 h-4 mr-1" />
                            )}
                            {userResponse ? 'Submitted' : survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {survey.description && (
                          <p className="text-sm text-muted-foreground mb-2">{survey.description}</p>
                        )}
                        <div className="grid gap-4 lg:grid-cols-2 sm:grid-cols-1">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Group: {survey.groupName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last updated: {new Date(survey.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className='flex justify-end items-center'>
                            {userResponse ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="mt-2 w-fit">
                                    View Response
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[90%] flex flex-col rounded-xl">
                                  <DialogHeader>
                                    <DialogTitle className=' text-pretty'>{survey.title} - Your Response</DialogTitle>
                                    <DialogDescription>
                                      Submitted on: {new Date(userResponse.submittedAt).toLocaleString()}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {/* Add response details here */}
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button
                                asChild
                                variant="outline"
                                className="mt-2 w-fit"
                                disabled={survey.status !== 'active'}
                              >
                                <Link href={`/user/surveys/${survey._id}`} className='border-1 border-gray-400'>
                                  Take Survey
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground">No assigned surveys available.</p>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </>
  )
}

