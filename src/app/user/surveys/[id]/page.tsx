import { Suspense } from 'react'
import TakeSurvey from '@/app/user/components/takesurvey'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../auth'

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

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
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
            <Suspense fallback={<div>Loading...</div>}>
                <TakeSurvey surveyId={params.id} userId={session.user.id} />
            </Suspense>
        </div>
    )
}