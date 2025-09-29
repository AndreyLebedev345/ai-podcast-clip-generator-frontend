import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { SignupForm } from '~/components/signup-form'

export default async function Page() {
    const session = await auth()

    if (session) {
        redirect('/dashboard')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <SignupForm className="w-full max-w-md" />
        </div>
    )
}