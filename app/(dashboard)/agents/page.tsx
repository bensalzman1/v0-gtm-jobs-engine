import { createClient } from "@/lib/supabase/server"
import { AgentCard } from "@/components/agents/agent-card"
import { Agent } from "@/lib/types/database"

async function getAgents() {
  const supabase = await createClient()
  
  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .order("job", { ascending: true })

  if (error) {
    console.error("Error fetching agents:", error)
    return []
  }

  return agents as Agent[]
}

async function getStats() {
  const supabase = await createClient()
  
  const [
    { count: accountsCount },
    { count: contactsCount }
  ] = await Promise.all([
    supabase.from("accounts").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true })
  ])

  return {
    accounts: accountsCount ?? 0,
    contacts: contactsCount ?? 0
  }
}

export default async function AgentsPage() {
  const [agents, stats] = await Promise.all([getAgents(), getStats()])

  // Group agents by GTM stage
  const groupedAgents = agents.reduce((acc, agent) => {
    const stage = agent.gtm_stage
    if (!acc[stage]) {
      acc[stage] = []
    }
    acc[stage].push(agent)
    return acc
  }, {} as Record<string, Agent[]>)

  const stageOrder = ["Market", "Lead", "Prospect", "Closed Won", "Ops"]
  const stageColors: Record<string, string> = {
    "Market": "bg-blue-500",
    "Lead": "bg-emerald-500",
    "Prospect": "bg-amber-500",
    "Closed Won": "bg-purple-500",
    "Ops": "bg-gray-500",
  }
  const stageDescriptions: Record<string, string> = {
    "Market": "Awareness & Acquisition",
    "Lead": "Engagement & Nurturing",
    "Prospect": "Conversion & Sales",
    "Closed Won": "Retention & Expansion",
    "Ops": "Operations & Governance",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">GTM Agents</h1>
        <p className="text-muted-foreground">
          18 AI-powered agents for GTM automation. {stats.accounts.toLocaleString()} accounts, {stats.contacts.toLocaleString()} contacts available.
        </p>
      </div>

      {stageOrder.map((stage) => {
        const stageAgents = groupedAgents[stage] ?? []
        if (stageAgents.length === 0) return null

        return (
          <div key={stage} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${stageColors[stage]}`} />
              <h2 className="text-xl font-semibold text-foreground">{stage}</h2>
              <span className="text-sm text-muted-foreground">
                {stageDescriptions[stage]}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stageAgents.map((agent) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent}
                  hasData={stats.accounts > 0 || stats.contacts > 0}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
