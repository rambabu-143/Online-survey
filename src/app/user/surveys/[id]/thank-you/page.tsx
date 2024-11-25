import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from 'next/link'
import { redirect } from "next/navigation"
import { auth } from "../../../../../../auth"

interface Props {
    params: { id: string }
}

export default async function ThankYou({ params }: Props) {
    const session = await auth()

    if (!session) {
        redirect('/api/auth/signin')
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const response = await fetch(`${baseUrl}/api/responses`, {
        headers: {
            'Cookie': `next-auth.session-token=${session.user.id}`
        }
    })

    if (!response.ok) {
        console.error('Error fetching responses:', response.statusText)
    } else {
        const responseData = await response.json()
        const userResponse = responseData.find((response: any) => response.surveyId === params.id)

        if (userResponse) {
            redirect('/user/survey-access')
        }
    }

    return (
        <div className="h-[100dvh] flex items-center justify-center bg-gray-50 px-4 py-8">
            <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg border border-gray-200 bg-white">
                <CardHeader className="p-6">
                    <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-center">
                        <CheckCircle className="mr-2 h-6 w-6 text-green-500" />
                        Thank You!
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-gray-600">
                    <p className="mb-6 text-center text-lg">
                        Your survey response has been submitted successfully.
                    </p>
                    <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md">
                        <Link href="/user/survey-access">
                            Back to Surveys
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
