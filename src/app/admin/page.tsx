import React from 'react'
import AdminDashboard from './components/admin-dashboard'
import { auth } from '../../../auth'
import { redirect } from 'next/navigation'

const Page = async () => {
    const session = await auth()

    if (!session || session.user?.name !== 'admin') {
        redirect('/')
        return null
    }

    return (
        <div>
            <AdminDashboard />
        </div>
    )
}

export default Page
