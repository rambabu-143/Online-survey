'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import SignOutButton from './signout'

export default function SignInPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const { data: session } = useSession()

    useEffect(() => {
        if (session) {
            const redirectingRoles = session.user.role === 'admin' ? '/admin' : '/'
            router.push(redirectingRoles)
            router.refresh()
        }
    }, [session, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            })

            if (result?.error) {
                setError(result.error)
            } else {
                if (session) {
                    const redirectingRoles = session.user.role === 'admin' ? '/admin' : '/'
                    router.push(redirectingRoles)
                    router.refresh()
                }
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
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
                <div className="hidden lg:block lg:w-1/2 relative">
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
                            <span className="text-gray-600">Don&apos;t have an account?</span>{" "}
                            <Link href="/signup" className="text-violet-800 underline font-semibold">
                                Sign up
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-black">Welcome back</h1>
                            <p className="text-gray-600">Please enter your details to sign in.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email field */}
                            <div className="space-y-2">
                                <Input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="Email"
                                    className="h-12 bg-gray-100 border-gray-300 text-black placeholder-gray-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password field */}
                            <div className="space-y-2 relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
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

                            {/* Remember me and Forgot password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        className="border-gray-300 text-black focus:ring-black"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm text-gray-600 leading-none cursor-pointer"
                                    >
                                        Remember me
                                    </label>
                                </div>
                                <Link href="/forgot-password" className="text-sm text-black hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center" role="alert">
                                    {error}
                                </div>
                            )}

                            {/* Submit button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

