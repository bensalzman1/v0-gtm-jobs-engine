-- Seed the 18 GTM Agents
-- Based on AGENTS.md specification

INSERT INTO agents (job, name, description, gtm_stage, gtm_goal, owner_role, skills, workflow, outputs) VALUES

-- Market Stage Agents (7)
('Market', 'Target Market Agent', 'Track TAM, competitors, trends, and whitespace.', 'Market', 'Create Demand', 'Architect', 
 ARRAY['product + capacity model', 'market analysis', 'TAM calculation'],
 'Load account and contact universe relevant to Target Market. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Market scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Targeting', 'Define ICP Agent', 'Clarify the attributes of your ideal customers.', 'Market', 'Create Demand', 'Architect',
 ARRAY['scoring', 'segmentation', 'tiering', 'ICP definition'],
 'Load account and contact universe relevant to Define ICP. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Targeting scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Personas', 'Target Personas Agent', 'Pinpoint roles and pain points to pursue.', 'Market', 'Create Demand', 'Architect',
 ARRAY['audiences', 'content pivots', 'persona mapping'],
 'Load account and contact universe relevant to Target Personas. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Personas scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Messaging', 'Develop Messaging Agent', 'Translate positioning into clear language.', 'Market', 'Create Demand', 'Evaluator',
 ARRAY['by product', 'channel', 'region', 'buyer type messaging'],
 'Load account and contact universe relevant to Develop Messaging. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Messaging scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Content', 'Produce Content Agent', 'Publish thought leadership and proof assets.', 'Market', 'Create Demand', 'Evaluator',
 ARRAY['live', 'video', 'audio', 'interactive content'],
 'Load account and contact universe relevant to Produce Content. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Content scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Campaigns', 'Run Campaigns Agent', 'Drive awareness via PR, ads, and events.', 'Market', 'Create Demand', 'Evaluator',
 ARRAY['brand', 'demand', 'community campaigns'],
 'Load account and contact universe relevant to Run Campaigns. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Campaigns scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Prospecting', 'Find Customers Agent', 'Outbound customer sourcing and acquisition.', 'Market', 'Create Demand', 'Builder',
 ARRAY['outbound', 'upsell', 'cross-sell prospecting'],
 'Load account and contact universe relevant to Find Customers. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Prospecting scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

-- Lead Stage Agents (4)
('Nurture', 'Nurture Leads Agent', 'Run email and retargeting sequences.', 'Lead', 'Capture Demand', 'Builder',
 ARRAY['pipeline acceleration', 'aircover', 'winbacks'],
 'Load account and contact universe relevant to Nurture Leads. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Nurture scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Ads', 'Manage Paid Agent', 'Execute monetization, social, and display programs.', 'Lead', 'Capture Demand', 'Builder',
 ARRAY['paid media', 'social advertising'],
 'Load account and contact universe relevant to Manage Paid. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Ads scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Offers', 'Develop Offers Agent', 'A/B optimize pricing, creative and conversion paths.', 'Lead', 'Capture Demand', 'Creator',
 ARRAY['pricing', 'packaging', 'offer optimization'],
 'Load account and contact universe relevant to Develop Offers. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Offers scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Attribution', 'Attribute Pipeline Agent', 'Measure which channels drive results.', 'Lead', 'Capture Demand', 'Evaluator',
 ARRAY['attribution modeling', 'channel analysis'],
 'Load account and contact universe relevant to Attribute Pipeline. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Attribution scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

-- Prospect Stage Agents (2)
('Relevance', 'Personalize Content Agent', 'Tailor cadences to accounts and personas.', 'Prospect', 'Engage', 'Editor',
 ARRAY['personalization', 'content relevance'],
 'Load account and contact universe relevant to Personalize Content. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Relevance scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Opportunities', 'Qualify Opportunities Agent', 'Run sales cycles, orchestrate buyers, assessments and qualification calls.', 'Prospect', 'Engage', 'Evaluator',
 ARRAY['qualification', 'sales orchestration'],
 'Load account and contact universe relevant to Qualify Opportunities. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Opportunities scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

-- Closed Won Stage Agent (1)
('Expansion', 'Expand Accounts Agent', 'Identify upsell and cross-sell potential.', 'Closed Won', 'Retain', 'Builder',
 ARRAY['expansion', 'upsell', 'cross-sell'],
 'Load account and contact universe relevant to Expand Accounts. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Expansion scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

-- Ops Stage Agents (4)
('Tech', 'Manage Stack Agent', 'Maintain CRM, MAP, and data systems.', 'Ops', 'Ops', 'Admin',
 ARRAY['tech stack management', 'CRM', 'MAP'],
 'Load account and contact universe relevant to Manage Stack. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Tech scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Data', 'Ensure Data Quality Agent', 'Govern enrichment and hygiene.', 'Ops', 'Ops', 'Builder',
 ARRAY['1st party data', '3rd party data', 'data hygiene'],
 'Load account and contact universe relevant to Ensure Data Quality. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Data scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Workflows', 'Automate Workflows Agent', 'Streamline handoffs and processes.', 'Ops', 'Ops', 'Builder',
 ARRAY['internal workflows', 'external workflows', 'automation'],
 'Load account and contact universe relevant to Automate Workflows. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Workflows scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale']),

('Governance', 'Maintain Governance Agent', 'Ongoing guardrails and rules of engagement.', 'Ops', 'Ops', 'Governor',
 ARRAY['governance', 'deal desk', 'rules of engagement'],
 'Load account and contact universe relevant to Maintain Governance. Normalize firmographic, hierarchy, persona, and coverage fields into the OpenGTM entity model. Apply Governance scoring, segmentation, and reasoning rules from the capability catalog. Generate ranked audiences, recommended plays, supporting rationale, and export-ready next actions.',
 ARRAY['audience', 'play', 'ranked_accounts', 'persona_map', 'rationale'])

ON CONFLICT DO NOTHING;
