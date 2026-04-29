import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: templates, error } = await supabase
    .from('play_templates')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ templates })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Handle bulk insert of play templates
  if (Array.isArray(body.templates)) {
    const templates = body.templates.map((t: Record<string, unknown>) => ({
      name: t.name,
      signal_name: t.signalName || null,
      goal: t.goal || null,
      sales_stage: t.salesStage || null,
      summary: t.summary || null,
      sop: t.sop || null,
      triggers: t.triggers || [],
      actions: t.actions || [],
      channels: t.channels || [],
      difficulty: t.difficulty || null,
      impact: t.impact || null,
      data_types: t.dataTypes || [],
      features: t.features || [],
      ai_prompt: t.aiPrompt || null,
      rag_inputs: t.ragInputs || [],
      merge_tokens: t.mergeTokens || [],
      yield_formula: t.yieldFormula || null,
      yield_drivers: t.yieldDrivers || null,
      yield_definitions: t.yieldDefinitions || null,
      natural_language: t.naturalLanguage || null,
      is_active: true,
    }))

    const { data, error } = await supabase
      .from('play_templates')
      .upsert(templates, { onConflict: 'name' })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      count: templates.length,
      templates: data 
    })
  }

  // Single template insert
  const { data, error } = await supabase
    .from('play_templates')
    .insert({
      name: body.name,
      signal_name: body.signalName || null,
      goal: body.goal || null,
      sales_stage: body.salesStage || null,
      summary: body.summary || null,
      sop: body.sop || null,
      triggers: body.triggers || [],
      actions: body.actions || [],
      channels: body.channels || [],
      difficulty: body.difficulty || null,
      impact: body.impact || null,
      data_types: body.dataTypes || [],
      features: body.features || [],
      ai_prompt: body.aiPrompt || null,
      rag_inputs: body.ragInputs || [],
      merge_tokens: body.mergeTokens || [],
      yield_formula: body.yieldFormula || null,
      yield_drivers: body.yieldDrivers || null,
      yield_definitions: body.yieldDefinitions || null,
      natural_language: body.naturalLanguage || null,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ template: data })
}
