import { Suspense } from 'react'
import TakeSurvey from '@/app/user/components/takesurvey'
import { auth } from '../../../../../auth'

export default async function SurveyPage({ params }: { params: { id: string } }) {
    const session = await auth()

    return (
        <div className="container mx-auto py-10">
            <Suspense fallback={<div>Loading survey...</div>}>
                <TakeSurvey surveyId={params.id} userId={session?.user?.id} />
            </Suspense>
        </div>
    )
}