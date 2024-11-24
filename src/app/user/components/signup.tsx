'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import SignOutButton from './signout'
import { useSession } from 'next-auth/react'

export default function SignupPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const { data: session } = useSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            })

            if (response.ok) {
                router.push('/signin')
            } else {
                const data = await response.json()
                setError(data.message || 'An error occurred. Please try again.')
            }
        } catch (error) {
            setError('An error occurred. Please try again.')
        }
    }

    const surveyLink = session ? "/user/survey-access" : "/signin";

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6 flex justify-between items-center">
                    <Link href='/' className="text-2xl font-bold text-blue-600">SurveyInsight</Link>
                    <nav>
                        <ul className="flex space-x-4 items-center">
                            <li><Link href="/user/about" className="text-gray-600 hover:text-blue-600">About</Link></li>
                            <li><Link href={surveyLink} className="text-gray-600 hover:text-blue-600">Surveys</Link></li>
                            {session ? (
                                <li>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end" forceMount>
                                            <DropdownMenuItem className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">{session?.user.name}</p>
                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {session?.user.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <SignOutButton />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </li>
                            ) : (
                                <li>
                                    <Link href='/signin' >Sign In</Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>

            <div className="flex-grow flex flex-col lg:flex-row">
                {/* Left side - Image */}
                <div className="hidden lg:block lg:w-1/2  relative">
                    <Image
                        src="/placeholder.jpg"
                        alt="Grayscale landscape"
                        layout="fill"
                        objectFit="cover"
                        priority
                    />
                </div>

                {/* Right side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-left">
                            <span className="text-gray-600">Already have an account?</span>{" "}
                            <Link href="/signin" className="text-violet-800 underline font-semibold">
                                Sign in
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-black">Create an account</h1>
                            <p className="text-gray-600">Please enter your details to sign up.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    placeholder="Username"
                                    className="h-12 bg-gray-100 border-gray-300 text-black placeholder-gray-500"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="Email address"
                                    className="h-12 bg-gray-100 border-gray-300 text-black placeholder-gray-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    placeholder="Password"
                                    className="h-12 bg-gray-100 border-gray-300 text-black placeholder-gray-500 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center" role="alert">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sign up
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

