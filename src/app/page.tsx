import Link from "next/link";

export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page!</h1>
      <p className="text-lg mb-8 text-center text-gray-600">
        We are currently working with the users page. For more administrative tasks, please go to the admin page.
      </p>
      <Link href='/admin' className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
        Go to Admin Page
      </Link>
    </div>
  );
}
