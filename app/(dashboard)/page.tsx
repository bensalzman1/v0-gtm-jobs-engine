import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Bot, Target, PlayCircle, Activity } from "lucide-react"
import Link from "next/link"

async function getStats() {
  const supabase = await createClient()
  
  const [
    { count: accountsCount },
    { count: contactsCount },
    { count: agentsCount },
    { count: audiencesCount },
    { count: playsCount },
    { data: recentRuns }
  ] = await Promise.all([
    supabase.from("accounts").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("agents").select("*", { count: "exact", head: true }),
    supabase.from("audiences").select("*", { count: "exact", head: true }),
    supabase.from("plays").select("*", { count: "exact", head: true }),
    supabase.from("agent_runs").select("*, agents(name)").order("started_at", { ascending: false }).limit(5)
  ])

  return {
    accounts: accountsCount ?? 0,
    contacts: contactsCount ?? 0,
    agents: agentsCount ?? 0,
    audiences: audiencesCount ?? 0,
    plays: playsCount ?? 0,
    recentRuns: recentRuns ?? []
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    { label: "Accounts", value: stats.accounts.toLocaleString(), icon: Building2, href: "/accounts", color: "text-blue-500" },
    { label: "Contacts", value: stats.contacts.toLocaleString(), icon: Users, href: "/contacts", color: "text-emerald-500" },
    { label: "Agents", value: stats.agents.toLocaleString(), icon: Bot, href: "/agents", color: "text-amber-500" },
    { label: "Audiences", value: stats.audiences.toLocaleString(), icon: Target, href: "/audiences", color: "text-rose-500" },
    { label: "Plays", value: stats.plays.toLocaleString(), icon: PlayCircle, href: "/plays", color: "text-indigo-500" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          OpenGTM Jobs Engine - AI-powered GTM automation
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Agent Runs
            </CardTitle>
            <CardDescription>Latest agent execution history</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No agent runs yet. Upload data and run an agent to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentRuns.map((run: { id: string; status: string; started_at: string; agents: { name: string } | null }) => (
                  <div key={run.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{run.agents?.name ?? "Unknown Agent"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(run.started_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      run.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                      run.status === "running" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                      run.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {run.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with OpenGTM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/upload"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="font-medium">Upload Accounts CSV</p>
                <p className="text-sm text-muted-foreground">Import ZoomInfo account data</p>
              </div>
            </Link>
            <Link
              href="/upload?type=contacts"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <p className="font-medium">Upload Contacts CSV</p>
                <p className="text-sm text-muted-foreground">Import ZoomInfo contact data</p>
              </div>
            </Link>
            <Link
              href="/agents"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                <Bot className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="font-medium">Run GTM Agents</p>
                <p className="text-sm text-muted-foreground">Execute AI-powered GTM workflows</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
