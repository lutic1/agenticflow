import { auth } from "./auth"

export async function getServerSession() {
  return await auth()
}

export function getSessionUser(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user
}

export function isAuthenticated(session: Awaited<ReturnType<typeof auth>>) {
  return !!session?.user
}
