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
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center">
                    <CheckCircle className="mr-2 text-green-500" />
                    Thank You!
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Your survey response has been submitted successfully.</p>
                <Button asChild>
                    <Link href="/user/survey-access">
                        Back to Surveys
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}