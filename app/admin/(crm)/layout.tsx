import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth"

export default async function AdminCrmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login")
  }

  return <>{children}</>
}
