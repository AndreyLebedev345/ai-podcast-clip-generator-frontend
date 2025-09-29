'use server'

import { auth } from "~/server/auth"
import { redirect } from "next/navigation"
import { db } from "~/server/db"
import NavHeader from "~/components/nav-header"
import { Toaster } from "sonner"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/signup')
    }

    const user = await db.user.findUniqueOrThrow({
        where: {
            id: session.user.id,
        },
        select: {
            credits: true,
            email: true,
            image: true,
            name: true,
        },
    })

    return (
        <div className="flex min-h-screen flex-col">
            <NavHeader
                credits={user.credits}
                email={user.email}
                image={user.image}
                name={user.name}
            />
            <main className="container mx-auto flex-1 py-6">
            {children}
            </main>
            <Toaster />
        </div>
    )
}