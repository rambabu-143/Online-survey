import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import TakeSurvey from '@/app/user/components/takesurvey'
import { auth } from '../../../../../auth'

async function fetchData(url: string) {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
}

export default async function SurveyPage({ params }: { params: { id: string } }) {
    const session = await auth()

    if (!session) {
        redirect('/signin')
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const [responseData, groupsData, surveyData] = await Promise.all([
        fetchData(`${baseUrl}/api/responses`),
        fetchData(`${baseUrl}/api/groups`),
        fetchData(`${baseUrl}/api/surveys/${params.id}`),
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

    if (!surveyData) {
        return <div>Survey not found</div>
    }

    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Loading...</div>}>
                <TakeSurvey survey={surveyData} userId={session.user.id as string} />
            </Suspense>
        </div>
    )
}

