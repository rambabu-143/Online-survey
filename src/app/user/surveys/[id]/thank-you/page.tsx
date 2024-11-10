import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from 'next/link'

export default function ThankYou() {
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