import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Building2, Users, Filter, Trash2 } from "lucide-react"
import Link from "next/link"
import { DeleteAudienceButton } from "@/components/audiences/delete-audience-button"

interface AudienceWithAgent {
  id: string
  name: string
  description: string | null
  filters: Record<string, unknown> | null
  account_count: number
  contact_count: number
  created_at: string
  agents: { name: string } | null
}

async function getAudiences() {
  const supabase = await createClient()
  
  const { data: audiences, error } = await supabase
    .from("audiences")
    .select("*, agents(name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching audiences:", error)
    return []
  }

  return audiences as AudienceWithAgent[]
}

export default async function AudiencesPage() {
  const audiences = await getAudiences()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Audiences</h1>
          <p className="text-muted-foreground">
            {audiences.length} audience{audiences.length !== 1 ? "s" : ""} created by GTM agents
          </p>
        </div>
        <Button asChild>
          <Link href="/agents">
            <Target className="mr-2 h-4 w-4" />
            Run Agent to Create
          </Link>
        </Button>
      </div>

      {audiences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No audiences yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Audiences are created when you run GTM agents like &quot;Define ICP&quot; or &quot;Target Market&quot;
            </p>
            <Button asChild>
              <Link href="/agents">Run an Agent</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <Card key={audience.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{audience.name}</CardTitle>
                  <DeleteAudienceButton audienceId={audience.id} />
                </div>
                <CardDescription>{audience.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{audience.account_count.toLocaleString()} accounts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{audience.contact_count.toLocaleString()} contacts</span>
                  </div>
                </div>

                {audience.filters && Object.keys(audience.filters).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Filter className="h-4 w-4" />
                      Filters
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(audience.filters).map(([key, value]) => {
                        if (!value) return null
                        const displayValue = Array.isArray(value) 
                          ? value.join(", ") 
                          : String(value)
                        return (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {displayValue}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-3">
                  {audience.agents && (
                    <Badge variant="outline" className="text-xs">
                      Created by: {audience.agents.name}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(audience.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
