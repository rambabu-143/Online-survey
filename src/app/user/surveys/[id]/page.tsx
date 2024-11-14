import { Suspense } from 'react'

import TakeSurvey from '@/app/user/components/takesurvey'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../auth'

export default async function SurveyPage({ params }: { params: { id: string } }) {
    const session = await auth()

    if (!session) {
        redirect('/api/auth/signin')
    }
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/responses`, {
        headers: {
            'Cookie': `next-auth.session-token=${session.user.id}`
        }
    })

    if (!response.ok) {
        console.error('Error fetching responses:', response.statusText)
    } else {
        const responseData = await response.json()
        // console.log('the response data is ::', responseData)
        const userResponse = responseData.find((response: any) => response.userId === params.id)

        if (userResponse) {
            redirect('/user/survey-access')
        }
    }



    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Loading survey...</div>}>
                <TakeSurvey surveyId={params.id} userId={session.user.id} />
            </Suspense>
        </div>
    )
}