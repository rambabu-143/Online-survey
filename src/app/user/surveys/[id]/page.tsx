import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '../../../../../auth'
import TakeSurvey from '@/app/user/components/takesurvey'
import ErrorBoundary from '../../components/errorBoundary'

async function fetchData(url: string) {
    try {
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error)
        return null
    }
}

async function getSurveyData(id: string, userId: string) {
    const baseUrl = process.env.NEXTAUTH_URL
    if (!baseUrl) {
        throw new Error('NEXTAUTH_URL is not set')
    }

    const [responseData, groupsData] = await Promise.all([
        fetchData(`${baseUrl}/api/responses`),
        fetchData(`${baseUrl}/api/groups`),
    ])

    if (!responseData || !groupsData) {
        throw new Error('Failed to fetch necessary data')
    }

    const userResponse = responseData.find((response: any) =>
        response.userId === userId && response.surveyId === id
    )

    if (userResponse) {
        return { redirect: '/user/survey-access' }
    }

    const userGroups = groupsData.filter((group: any) =>
        group.members.includes(userId)
    )

    const isAssigned = userGroups.some((group: any) =>
        group.assignedSurveys.includes(id)
    )

    if (!isAssigned) {
        return { redirect: '/user/survey-access' }
    }

    return { isAssigned }
}

export default async function SurveyPage({ params }: { params: { id: string } }) {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
        redirect('/signin')
    }

    try {
        const surveyData = await getSurveyData(params.id, session.user.id)

        if ('redirect' in surveyData) {
            redirect(surveyData.redirect as string)
        }

        return (
            <div className="container mx-auto py-10">
                <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
                    <Suspense fallback={<div>Loading survey...</div>}>
                        <TakeSurvey surveyId={params.id} userId={session.user.id} />
                    </Suspense>
                </ErrorBoundary>
            </div>
        )
    } catch (error) {
        console.error('Error in SurveyPage:', error)
        notFound()
    }
}

