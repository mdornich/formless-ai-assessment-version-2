export interface User {
  id: string;
  email?: string;
  phone?: string;
  uid?: string;
  created_at: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  assessment_type: 'business_ai_readiness' | 'business_owner_competency';
  status: 'active' | 'completed' | 'abandoned';
  current_step: number;
  instruction_id: string;
  session_token: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  message_text: string;
  created_at: Date;
}

export interface Assessment {
  id: string;
  conversation_id: string;
  summary_text?: string;
  score_json?: CompetencyScore;
  requires_review: boolean;
  reviewed: boolean;
  reviewer_notes?: string;
  created_at: Date;
  reviewed_at?: Date;
}

export interface CompetencyScore {
  overall_level: 1 | 2 | 3 | 4;
  mindset_score: number;
  understanding_score: number;
  usage_score: number;
  strengths: string[];
  development_areas: string[];
  key_insights: string[];
}

export interface CompetencyLevel {
  level: 1 | 2 | 3 | 4;
  name: 'Aware' | 'Exploratory' | 'Applied' | 'Strategic';
  description: string;
  mindset: string;
  understanding: string;
  usage: string;
}

export interface ReportGenerationRequest {
  conversation_id: string;
  assessment_type: 'business_ai_readiness' | 'business_owner_competency';
  user_context?: {
    name?: string;
    industry?: string;
    company_size?: string;
    role?: string;
  };
}

export interface GeneratedReport {
  executive_summary: string;
  competency_level: CompetencyLevel;
  current_state_analysis: {
    foundational_understanding: number;
    practical_experience: number;
    strategic_application: number;
    key_strengths: string[];
    development_areas: string[];
  };
  personalized_recommendations: {
    immediate_actions: string[];
    short_term_goals: string[];
    long_term_vision: string;
  };
  industry_insights: string[];
  resource_recommendations: string[];
  action_plan: string;
  full_report_markdown: string;
}