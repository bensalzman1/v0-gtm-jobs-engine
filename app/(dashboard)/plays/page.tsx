import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, Target, Mail, MessageSquare, Phone, Globe } from "lucide-react"
import Link from "next/link"
import { PlayStatusBadge } from "@/components/plays/play-status-badge"

interface PlayWithRelations {
  id: string
  name: string
  description: string | null
  channels: string[] | null
  steps: { order: number; action: string; channel: string; content: string }[] | null
  status: string
  created_at: string
  audiences: { name: string } | null
  agents: { name: string } | null
}

async function getPlays() {
  const supabase = await createClient()
  
  const { data: plays, error } = await supabase
    .from("plays")
    .select("*, audiences(name), agents(name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching plays:", error)
    return []
  }

  return plays as PlayWithRelations[]
}

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  linkedin: MessageSquare,
  phone: Phone,
  web: Globe,
}

export default async function PlaysPage() {
  const plays = await getPlays()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Plays</h1>
          <p className="text-muted-foreground">
            {plays.length} play{plays.length !== 1 ? "s" : ""} created by GTM agents
          </p>
        </div>
        <Button asChild>
          <Link href="/agents">
            <PlayCircle className="mr-2 h-4 w-4" />
            Run Agent to Create
          </Link>
        </Button>
      </div>

      {plays.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PlayCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No plays yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Plays are created when you run GTM agents like &quot;Run Campaigns&quot; or &quot;Develop Messaging&quot;
            </p>
            <Button asChild>
              <Link href="/agents">Run an Agent</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plays.map((play) => (
            <Card key={play.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{play.name}</CardTitle>
                  <PlayStatusBadge status={play.status} playId={play.id} />
                </div>
                <CardDescription>{play.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {play.audiences && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>Audience: {play.audiences.name}</span>
                  </div>
                )}

                {play.channels && play.channels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {play.channels.map((channel) => {
                      const IconComponent = channelIcons[channel.toLowerCase()] || Globe
                      return (
                        <Badge key={channel} variant="secondary" className="flex items-center gap-1">
                          <IconComponent className="h-3 w-3" />
                          {channel}
                        </Badge>
                      )
                    })}
                  </div>
                )}

                {play.steps && play.steps.length > 0 && (
                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium">Steps</p>
                    <div className="space-y-1">
                      {play.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                            {step.order || index + 1}
                          </span>
                          <span className="text-muted-foreground">{step.action}</span>
                        </div>
                      ))}
                      {play.steps.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{play.steps.length - 3} more steps
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-3">
                  {play.agents && (
                    <Badge variant="outline" className="text-xs">
                      Created by: {play.agents.name}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(play.created_at).toLocaleDateString()}
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
