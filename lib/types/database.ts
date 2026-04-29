// Database types for OpenGTM Jobs Engine

export interface Account {
  id: string
  zoominfo_company_id: string | null
  company_name: string
  website: string | null
  primary_industry: string | null
  primary_sub_industry: string | null
  revenue_thousands: number | null
  employees: number | null
  city: string | null
  state: string | null
  country: string | null
  icp_score: number
  tier: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  zoominfo_contact_id: string | null
  account_id: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  job_title: string | null
  management_level: string | null
  job_function: string | null
  department: string | null
  email: string | null
  persona: string | null
  created_at: string
  updated_at: string
}

export interface Persona {
  id: string
  name: string
  description: string | null
  job_functions: string[] | null
  management_levels: string[] | null
  contact_count: number
  created_at: string
}

export type GTMStage = 'Market' | 'Lead' | 'Prospect' | 'Closed Won' | 'Ops'
export type GTMGoal = 'Awareness' | 'Engagement' | 'Conversion' | 'Retention' | 'All Stages'
export type OwnerRole = 'Marketing' | 'Sales' | 'Customer Success' | 'RevOps'

export interface Agent {
  id: string
  job: string
  name: string
  description: string | null
  gtm_stage: GTMStage
  gtm_goal: GTMGoal
  owner_role: OwnerRole
  required_data: string[] | null
  skills: string[] | null
  workflow: string | null
  outputs: string[] | null
  prompt: string | null
  is_active: boolean
  created_at: string
}

export interface Audience {
  id: string
  name: string
  description: string | null
  agent_id: string | null
  filters: Record<string, unknown> | null
  account_count: number
  contact_count: number
  created_at: string
}

export interface AudienceAccount {
  id: string
  audience_id: string
  account_id: string
  score: number | null
}

export type PlayStatus = 'draft' | 'active' | 'paused' | 'completed'

export interface Play {
  id: string
  name: string
  description: string | null
  audience_id: string | null
  agent_id: string | null
  channels: string[] | null
  steps: Record<string, unknown>[] | null
  status: PlayStatus
  created_at: string
}

export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface AgentRun {
  id: string
  agent_id: string
  status: AgentRunStatus
  input_data: Record<string, unknown> | null
  output_data: Record<string, unknown> | null
  rationale: string | null
  audience_id: string | null
  play_id: string | null
  started_at: string
  completed_at: string | null
  error: string | null
}

// Dashboard stats
export interface DashboardStats {
  totalAccounts: number
  totalContacts: number
  totalAgents: number
  totalAudiences: number
  totalPlays: number
  recentRuns: AgentRun[]
}
