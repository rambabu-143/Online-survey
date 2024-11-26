import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { BarChart2, CheckCircle, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { auth } from "../../auth"
import SignOutButton from "./user/components/signout"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth();
  const surveyLink = session ? "/user/survey-access" : "/signin";
  if (session?.user.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SurveyInsight</h1>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li><Link href="/user/about" className="text-gray-600 hover:text-blue-600">About</Link></li>
              <li><Link href={surveyLink} className="text-gray-600 hover:text-blue-600">Surveys</Link></li>
              {/* <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li> */}
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

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to SurveyInsight</h2>
          <p className="text-xl text-gray-600 mb-8">Your voice matters. Shape the future with every survey you take.</p>
          <Button asChild size="lg">
            {/* <Link href="/user/survey-access">Take a Survey Now</Link> */}
            <Link href={surveyLink}>Take a Survey Now</Link>
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Diverse Perspectives</h3>
              <p className="text-gray-600">Gather insights from a wide range of participants across various demographics.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <BarChart2 className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Data-Driven Decisions</h3>
              <p className="text-gray-600">Make informed choices based on real-time, accurate survey results.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Participation</h3>
              <p className="text-gray-600">User-friendly interface ensures a smooth survey-taking experience.</p>
            </CardContent>
          </Card>
        </section>

        <section className="bg-blue-50 rounded-lg p-8 mb-16 flex justify-center  items-center flex-col">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Your Participation Matters</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Influence product development and service improvements</li>
            <li>Contribute to academic research and scientific advancements</li>
            <li>Help shape public policies and community initiatives</li>
            <li>Gain insights into industry trends and consumer behaviors</li>
            <li>Earn rewards and incentives for your valuable input</li>
          </ul>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of participants who are shaping the future through their survey responses.</p>
          <Button asChild size="lg">
            <Link href="/signup">Sign Up Now</Link>
          </Button>
        </section>
      </main>

      <footer className="bg-gray-100 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 SurveyInsight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}