export interface PlayTemplate {
  id: string
  name: string
  signal_name: string | null
  goal: string | null
  sales_stage: string | null
  summary: string | null
  sop: string | null
  triggers: string[]
  actions: string[]
  channels: string[]
  difficulty: string | null
  impact: string | null
  data_types: string[]
  features: string[]
  ai_prompt: string | null
  rag_inputs: string[]
  merge_tokens: string[]
  yield_formula: string | null
  yield_drivers: string | null
  yield_definitions: string | null
  natural_language: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Parsed play from CSV
export interface ParsedPlay {
  name: string
  signalName?: string
  goal?: string
  salesStage?: string
  summary?: string
  sop?: string
  triggers: string[]
  actions: string[]
  channels: string[]
  difficulty?: string
  impact?: string
  dataTypes: string[]
  features: string[]
  aiPrompt?: string
  ragInputs: string[]
  mergeTokens: string[]
  yieldFormula?: string
  yieldDrivers?: string
  yieldDefinitions?: string
  naturalLanguage?: string
}

// Play execution instance
export interface PlayExecution {
  id: string
  play_id: string
  template_id: string | null
  audience_id: string | null
  status: 'draft' | 'active' | 'paused' | 'completed'
  triggers_config: Record<string, unknown> | null
  actions_config: Record<string, unknown> | null
  created_at: string
}

// Goal categories for filtering
export const PLAY_GOALS = [
  'Cold / New Leads',
  'Warm Leads',
  'Pipeline Acceleration', 
  'Competitive Displacement',
  'Expansion',
  'Retention',
  'Win-Back'
] as const

// Sales stages
export const SALES_STAGES = [
  'Pre-Sales',
  'Discovery',
  'Evaluation',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
] as const

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  'Easy',
  'Intermediate',
  'Advanced'
] as const

// Impact levels
export const IMPACT_LEVELS = [
  'Low Impact',
  'Medium Impact',
  'High Impact'
] as const
