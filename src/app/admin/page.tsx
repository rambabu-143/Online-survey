import { headers } from 'next/headers'
import AdminDashboard from './components/admin-dashboard'

async function getSurveys() {
    const host = headers().get("host")
    const protocal = process?.env.NODE_ENV === "development" ? "http" : "https"
    const res = await fetch(`${protocal}://${host}/api/surveys`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch surveys')
    return res.json()
}

async function getResponses() {
    const host = headers().get("host")
    const protocal = process?.env.NODE_ENV === "development" ? "http" : "https"
    const res = await fetch(`${protocal}://${host}/api/responses`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch responses')
    return res.json()
}

export default async function DashboardPage() {
    const [surveys, responses] = await Promise.all([getSurveys(), getResponses()])

    return <AdminDashboard surveys={surveys} responses={responses} />
}