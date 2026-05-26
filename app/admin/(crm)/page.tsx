"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExternalLink, LogOut, MessageCircle, Save } from "lucide-react"
import type { AppSettings } from "@/lib/settings/types"

const emptyForm: AppSettings = {
  appName: "",
  tagline: "",
  assistantTitle: "",
  chatbotUrl: "",
  embedToken: "",
  siteOrigin: "",
  updatedAt: "",
}

export default function AdminCrmPage() {
  const router = useRouter()
  const [form, setForm] = useState<AppSettings>(emptyForm)
  const [persistence, setPersistence] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()

        if (response.status === 401) {
          router.push("/admin/login")
          return
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to load settings")
        }

        setForm(data.settings)
        setPersistence(data.persistence)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings")
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  const updateField = (field: keyof AppSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings")
      }

      setForm(data.settings)
      setMessage("Settings saved. Open the chat page to apply changes.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        Loading CRM...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Assistant CRM</h1>
            <p className="text-slate-400 text-sm mt-1">
              Persistence: <span className="text-indigo-300">{persistence}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-slate-600 bg-slate-900 hover:bg-slate-800">
              <Link href="/">
                <MessageCircle className="w-4 h-4 mr-2" />
                Open chat
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="border-slate-600 bg-slate-900 hover:bg-slate-800">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="border-slate-700 bg-slate-950/70">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="App name" value={form.appName} onChange={(v) => updateField("appName", v)} />
                <Field
                  label="Assistant title"
                  value={form.assistantTitle}
                  onChange={(v) => updateField("assistantTitle", v)}
                />
              </div>
              <Field label="Tagline" value={form.tagline} onChange={(v) => updateField("tagline", v)} />

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h3 className="font-semibold text-indigo-300">API connection</h3>
                <Field
                  label="Chatbot API URL"
                  hint="Base URL only, e.g. https://chatbot.example.com"
                  value={form.chatbotUrl}
                  onChange={(v) => updateField("chatbotUrl", v)}
                />
                <Field
                  label="Embed token"
                  value={form.embedToken}
                  onChange={(v) => updateField("embedToken", v)}
                  type="password"
                />
                <Field
                  label="Site origin (allowed domain)"
                  hint="Must match your live URL and embed token allowlist"
                  value={form.siteOrigin}
                  onChange={(v) => updateField("siteOrigin", v)}
                />
              </div>

              {message && <p className="text-sm text-emerald-400">{message}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-950/50">
          <CardContent className="p-4 text-sm text-slate-400 space-y-2">
            <p className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Add your site origin to the embed token allowed domains in your chatbot dashboard.
            </p>
            <p>
              Admin login uses <code className="text-slate-300">ADMIN_EMAIL</code> and{" "}
              <code className="text-slate-300">ADMIN_PASSWORD</code> environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-900 border-slate-700 text-slate-100"
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
