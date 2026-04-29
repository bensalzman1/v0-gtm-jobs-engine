"use client"

import { useState } from "react"
import { Agent } from "@/lib/types/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  PlayCircle, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface AgentCardProps {
  agent: Agent
  hasData: boolean
}

export function AgentCard({ agent, hasData }: AgentCardProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch(`/api/agents/${agent.id}/run`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || "Agent completed successfully" })
      } else {
        setResult({ success: false, message: data.error || "Agent run failed" })
      }
    } catch {
      setResult({ success: false, message: "An error occurred" })
    } finally {
      setIsRunning(false)
    }
  }

  const ownerColors: Record<string, string> = {
    "Marketing": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "Sales": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    "Customer Success": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    "RevOps": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
              {agent.job}
            </span>
            <CardTitle className="text-base">{agent.name}</CardTitle>
          </div>
          <Badge className={ownerColors[agent.owner_role] || "bg-gray-100 text-gray-700"}>
            {agent.owner_role}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {expanded && (
          <div className="space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
            <div>
              <p className="font-medium text-foreground">Workflow</p>
              <p className="text-muted-foreground">{agent.workflow}</p>
            </div>
            {agent.required_data && agent.required_data.length > 0 && (
              <div>
                <p className="font-medium text-foreground">Required Data</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {agent.required_data.map((data) => (
                    <Badge key={data} variant="outline" className="text-xs">
                      {data}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {agent.outputs && agent.outputs.length > 0 && (
              <div>
                <p className="font-medium text-foreground">Outputs</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {agent.outputs.map((output) => (
                    <Badge key={output} variant="secondary" className="text-xs">
                      {output}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
            result.success
              ? "bg-emerald-50 dark:bg-emerald-950"
              : "bg-red-50 dark:bg-red-950"
          }`}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <p className={result.success
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-red-700 dark:text-red-300"
            }>
              {result.message}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning || !hasData}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Agent
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
