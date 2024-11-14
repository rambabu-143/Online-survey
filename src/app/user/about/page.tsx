import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { auth } from "../../../../auth";

export default async function AboutPage() {
    const session = await auth();
    const surveyLink = session ? "/user/survey-access" : "/signin";
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">About SurveyInsight</h1>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                            <p className="mb-4">
                                At SurveyInsight, we believe in the power of collective wisdom. Our mission is to bridge the gap between organizations and individuals, facilitating meaningful conversations through carefully crafted surveys.
                            </p>
                            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
                            <p className="mb-4">
                                We provide a platform for businesses, researchers, and organizations to create and distribute surveys to a diverse audience. Our user-friendly interface ensures that survey-takers can easily share their opinions and insights.
                            </p>
                            <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
                            <ul className="list-disc list-inside mb-4">
                                <li>Intuitive survey creation tools</li>
                                <li>Robust data analysis and reporting</li>
                                <li>Secure and confidential data handling</li>
                                <li>Responsive customer support</li>
                                <li>Integration with popular business tools</li>
                            </ul>
                            <div className="mt-8">
                                <Button asChild>
                                    <Link href={surveyLink}>Take a Survey</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}