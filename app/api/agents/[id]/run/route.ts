import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText, Output, tool } from "ai"
import { z } from "zod"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const supabase = await createClient()

    // Get the agent
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      )
    }

    // Create a run record
    const { data: run, error: runError } = await supabase
      .from("agent_runs")
      .insert({
        agent_id: id,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (runError) {
      console.error("Error creating run:", runError)
      return NextResponse.json(
        { error: "Failed to create run" },
        { status: 500 }
      )
    }

    // Get relevant data based on agent requirements
    let inputData: Record<string, unknown> = {}
    
    if (agent.required_data?.includes("accounts")) {
      const { data: accounts } = await supabase
        .from("accounts")
        .select("*")
        .limit(100)
      inputData.accounts = accounts
    }

    if (agent.required_data?.includes("contacts")) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("*, accounts(company_name)")
        .limit(100)
      inputData.contacts = contacts
    }

    // Define tools based on agent type
    const tools = {
      createAudience: tool({
        description: "Create a new audience based on criteria",
        inputSchema: z.object({
          name: z.string().describe("Name of the audience"),
          description: z.string().describe("Description of the audience"),
          filters: z.object({
            industries: z.array(z.string()).optional(),
            minEmployees: z.number().optional(),
            maxEmployees: z.number().optional(),
            minRevenue: z.number().optional(),
            maxRevenue: z.number().optional(),
            countries: z.array(z.string()).optional(),
          }).describe("Filter criteria for the audience"),
        }),
        execute: async ({ name, description, filters }) => {
          const { data: audience, error } = await supabase
            .from("audiences")
            .insert({
              name,
              description,
              agent_id: id,
              filters,
            })
            .select()
            .single()
          
          if (error) throw error
          return { audienceId: audience.id, name }
        },
      }),
      scoreAccounts: tool({
        description: "Score accounts based on ICP criteria",
        inputSchema: z.object({
          scores: z.array(z.object({
            accountId: z.string(),
            score: z.number().min(0).max(100),
            tier: z.enum(["A", "B", "C", "D"]),
          })),
        }),
        execute: async ({ scores }) => {
          for (const { accountId, score, tier } of scores) {
            await supabase
              .from("accounts")
              .update({ icp_score: score, tier })
              .eq("id", accountId)
          }
          return { updated: scores.length }
        },
      }),
      assignPersonas: tool({
        description: "Assign personas to contacts",
        inputSchema: z.object({
          assignments: z.array(z.object({
            contactId: z.string(),
            persona: z.string(),
          })),
        }),
        execute: async ({ assignments }) => {
          for (const { contactId, persona } of assignments) {
            await supabase
              .from("contacts")
              .update({ persona })
              .eq("id", contactId)
          }
          return { assigned: assignments.length }
        },
      }),
      createPlay: tool({
        description: "Create a new play/campaign",
        inputSchema: z.object({
          name: z.string(),
          description: z.string(),
          audienceId: z.string().nullable(),
          channels: z.array(z.string()),
          steps: z.array(z.object({
            order: z.number(),
            action: z.string(),
            channel: z.string(),
            content: z.string(),
          })),
        }),
        execute: async ({ name, description, audienceId, channels, steps }) => {
          const { data: play, error } = await supabase
            .from("plays")
            .insert({
              name,
              description,
              audience_id: audienceId,
              agent_id: id,
              channels,
              steps,
              status: "draft",
            })
            .select()
            .single()
          
          if (error) throw error
          return { playId: play.id, name }
        },
      }),
    }

    // Build the prompt
    const systemPrompt = `You are a GTM (Go-to-Market) automation agent. Your job is: ${agent.name}
    
${agent.prompt}

You have access to tools to create audiences, score accounts, assign personas, and create plays.
Analyze the provided data and take appropriate actions based on your job description.
Be concise and actionable. Explain your reasoning briefly.`

    const userPrompt = `Here is the current data to analyze:

${JSON.stringify(inputData, null, 2)}

Based on this data, execute your GTM job: ${agent.name}. 
${agent.workflow}

Take actions using the available tools and provide a summary of what you did.`

    // Run the agent with OpenAI
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      tools,
      maxSteps: 5,
      output: Output.object({
        schema: z.object({
          summary: z.string().describe("Summary of actions taken"),
          actionsCount: z.number().describe("Number of actions taken"),
          recommendations: z.array(z.string()).describe("Recommendations for next steps"),
        }),
      }),
    })

    // Update the run record
    const outputData = result.output ?? {
      summary: result.text || "Agent completed",
      actionsCount: result.steps?.length ?? 0,
      recommendations: [],
    }

    await supabase
      .from("agent_runs")
      .update({
        status: "completed",
        output_data: outputData,
        rationale: result.text,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id)

    return NextResponse.json({
      success: true,
      message: outputData.summary || "Agent completed successfully",
      runId: run.id,
      output: outputData,
    })
  } catch (error) {
    console.error("Agent run error:", error)
    
    // Try to update run status to failed
    const supabase = await createClient()
    await supabase
      .from("agent_runs")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completed_at: new Date().toISOString(),
      })
      .eq("agent_id", id)
      .eq("status", "running")

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Agent run failed" },
      { status: 500 }
    )
  }
}
