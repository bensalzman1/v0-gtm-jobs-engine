import type { ParsedPlay } from '@/lib/types/play-templates'

/**
 * Parse a play block from the ZoomInfo CSV format
 * Each play is wrapped in <play>...</play> tags
 */
export function parsePlayBlock(playText: string): ParsedPlay | null {
  if (!playText || !playText.includes('**PLAY NAME**')) {
    return null
  }

  const extractSection = (text: string, marker: string): string => {
    const pattern = new RegExp(`\\*\\*${marker}\\*\\*\\n([\\s\\S]*?)(?=\\n---\\n|$)`, 'i')
    const match = text.match(pattern)
    return match ? match[1].trim() : ''
  }

  const extractList = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(line => line.length > 0 && !line.startsWith('**'))
  }

  const name = extractSection(playText, 'PLAY NAME')
  if (!name) return null

  // Extract triggers
  const triggersSection = extractSection(playText, '🔁 Triggers')
  const triggers = extractList(triggersSection)

  // Extract actions
  const actionsSection = extractSection(playText, '⚡️ Actions')
  const actions = extractList(actionsSection)

  // Extract goal
  const goalSection = extractSection(playText, '✅ Goal / Problem to Solve')
  const goal = goalSection.replace(/^✅\s*/, '').trim()

  // Extract channels
  const channelsSection = extractSection(playText, '➡️ Channels')
  const channels = channelsSection
    .split(',')
    .map(c => c.replace(/[✉️💬📪📅📢🖥📞]/g, '').trim())
    .filter(c => c.length > 0)

  // Extract summary
  const summary = extractSection(playText, '✏️ Summary')

  // Extract natural language
  const naturalLanguage = extractSection(playText, '✏️ Default Natural Language')

  // Extract features
  const featuresSection = extractSection(playText, '🏷Features\\)')
  const features = featuresSection.split(',').map(f => f.trim()).filter(f => f.length > 0)

  // Extract data types
  const dataTypesSection = extractSection(playText, '🏷️ZoomInfo Data Types\\)')
  const dataTypes = dataTypesSection.split(',').map(d => d.trim()).filter(d => d.length > 0)

  // Extract sales stage
  const salesStage = extractSection(playText, '📁 Sales Stage')

  // Extract difficulty
  const difficultySection = extractSection(playText, '🚦 Difficulty')
  const difficulty = difficultySection
    .replace(/🟢|🟦|🔴/g, '')
    .replace(/\s*-\s*/, '')
    .trim()

  // Extract SOP
  const sop = extractSection(playText, '🧪Standard Operating Procedure \\(SOP\\)')

  // Extract RAG inputs
  const ragSection = extractSection(playText, '🪙 RAG Inputs Used \\(Broad\\)')
  const ragInputs = ragSection.split(',').map(r => r.trim()).filter(r => r.length > 0)

  // Extract merge tokens
  const tokensSection = extractSection(playText, '🪙 Email tokens Used')
  const mergeTokens = tokensSection.split(',').map(t => t.trim()).filter(t => t.length > 0)

  // Extract yield formula
  const yieldFormula = extractSection(playText, '🟨 Yield in \\$ Formula')

  // Extract yield drivers
  const yieldDrivers = extractSection(playText, '🟨 Yield Key Drivers')

  // Extract yield definitions
  const yieldDefinitions = extractSection(playText, '🟨 Yield Driver Definitions')

  return {
    name,
    goal: goal || undefined,
    salesStage: salesStage || undefined,
    summary: summary || undefined,
    sop: sop || undefined,
    triggers,
    actions,
    channels,
    difficulty: difficulty || undefined,
    dataTypes,
    features,
    ragInputs,
    mergeTokens,
    yieldFormula: yieldFormula || undefined,
    yieldDrivers: yieldDrivers || undefined,
    yieldDefinitions: yieldDefinitions || undefined,
    naturalLanguage: naturalLanguage || undefined,
  }
}

/**
 * Parse multiple plays from CSV content
 */
export function parsePlaysFromCSV(csvContent: string): ParsedPlay[] {
  const plays: ParsedPlay[] = []
  
  // Find all play blocks wrapped in <play>...</play>
  const playBlockPattern = /<play>([\s\S]*?)<\/play>/gi
  let match
  
  while ((match = playBlockPattern.exec(csvContent)) !== null) {
    const playContent = match[1]
    const parsed = parsePlayBlock(playContent)
    if (parsed) {
      plays.push(parsed)
    }
  }

  return plays
}

/**
 * Generate AI prompt for a play based on its SOP and context
 */
export function generatePlayAIPrompt(play: ParsedPlay): string {
  const promptParts = [
    `You are executing the "${play.name}" GTM play.`,
    '',
    '## Goal',
    play.goal || 'Generate qualified leads and drive engagement.',
    '',
    '## Triggers',
    ...play.triggers.map(t => `- ${t}`),
    '',
    '## Actions to Take',
    ...play.actions.map(a => `- ${a}`),
    '',
    '## Standard Operating Procedure',
    play.sop || 'Follow best practices for outreach and engagement.',
    '',
    '## Available Data',
    ...play.ragInputs.map(r => `- ${r}`),
    '',
    '## Output Requirements',
    '1. Identify accounts matching the trigger criteria',
    '2. Score and rank accounts by fit and intent',
    '3. Discover relevant contacts within each account',
    '4. Generate personalized outreach for each contact',
    '5. Track engagement and conversion metrics',
    '',
    '## Merge Tokens Available',
    play.mergeTokens.length > 0 
      ? play.mergeTokens.map(t => `{{${t}}}`).join(', ')
      : 'Standard contact and company tokens',
  ]

  return promptParts.join('\n')
}
