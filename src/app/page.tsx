import Link from "next/link";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import SignOutButton from "./user/components/signout";

export default async function Home() {
  const session = await auth();

  console.log('my session is ',)
  if (!session) {
    redirect('/signin')
  }
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-gray-900">Welcome to your Dashboard</h2>
                <p>Hello, {session.user?.name}!</p>
                <p>Your Email is: {session.user?.email}</p>
              </div>
              <Link href='/admin' className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
                Go to Admin Page
              </Link>

              {session ?
                <div className="pt-6 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                  <SignOutButton />
                </div>
                :
                <Link href='/signin' className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-gray-900">
                  Signin
                </Link>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

