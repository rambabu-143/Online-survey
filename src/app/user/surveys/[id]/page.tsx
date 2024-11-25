import { Suspense } from 'react'
import TakeSurvey from '@/app/user/components/takesurvey'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../auth'
import ErrorBoundary from '../../components/errorBoundary'

async function fetchData(url: string) {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
        console.error(`Error fetching data from ${url}:`, response.statusText)
        return null
    }
    return response.json()
}

export default async function SurveyPage({ params }: { params: { id: string } }) {
    const session = await auth()

    if (!session) {
        redirect('/signin')
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const [responseData, groupsData] = await Promise.all([
        fetchData(`${baseUrl}/api/responses`),
        fetchData(`${baseUrl}/api/groups`),
    ])

    if (responseData) {
        const userResponse = responseData.find((response: any) =>
            response.userId === session.user.id && response.surveyId === params.id
        )

        if (userResponse) {
            redirect('/user/survey-access')
        }
    }

    let isAssigned = false
    if (groupsData) {
        const userGroups = groupsData.filter((group: any) =>
            group.members.includes(session.user.id)
        )

        isAssigned = userGroups.some((group: any) =>
            group.assignedSurveys.includes(params.id)
        )
    }

    if (!isAssigned) {
        redirect('/user/survey-access')
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
}