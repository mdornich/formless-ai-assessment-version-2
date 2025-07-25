import { geminiModel } from '../config/gemini';
import supabase from '../config/supabase';
import { 
  Conversation, 
  Message, 
  CompetencyLevel, 
  CompetencyScore, 
  GeneratedReport,
  ReportGenerationRequest 
} from '../types/assessment';

export class ReportGenerationService {
  private competencyLevels: CompetencyLevel[] = [
    {
      level: 1,
      name: 'Aware',
      description: 'Cautious, skeptical, or passively curious about AI',
      mindset: 'Views AI primarily through news headlines, may harbor fear or view as irrelevant',
      understanding: 'Surface-level awareness, cannot articulate capabilities or business applications', 
      usage: 'No regular use, perhaps tried tools once or twice with no specific goal'
    },
    {
      level: 2,
      name: 'Exploratory',
      description: 'Open and curious but action is inconsistent',
      mindset: 'Sees potential but unsure where to start, looks for safe ways to experiment',
      understanding: 'Functional grasp of common AI tools, general sense of opportunities but lacks concrete vision',
      usage: 'Occasional task-specific use as instructional or research partner, reactive not proactive'
    },
    {
      level: 3,
      name: 'Applied',
      description: 'Pragmatic and proactive about AI integration',
      mindset: 'Actively seeks ways to integrate AI into workflow for efficiency',
      understanding: 'Solid understanding of AI augmentation, differentiates tools, understands prompt engineering',
      usage: 'Regular professional use as thought partner or assistant for complex tasks'
    },
    {
      level: 4,
      name: 'Strategic',
      description: 'Visionary and transformative thinking about AI',
      mindset: 'Thinks beyond productivity to reshaping team/business, focuses on competitive advantage',
      understanding: 'Deep strategic implications, second-order effects, data strategy, ethical considerations',
      usage: 'Uses AI to model, strategize, lead initiatives, coach teams, analyze business data'
    }
  ];

  async generateReport(request: ReportGenerationRequest): Promise<GeneratedReport> {
    try {
      // Fetch conversation data
      const conversationData = await this.fetchConversationData(request.conversation_id);
      
      // Analyze competency using Gemini
      const competencyAnalysis = await this.analyzeCompetency(conversationData, request);
      
      // Generate full report
      const fullReport = await this.generateFullReport(conversationData, competencyAnalysis, request);
      
      // Save assessment to database
      await this.saveAssessment(request.conversation_id, competencyAnalysis, fullReport);
      
      return fullReport;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate assessment report');
    }
  }

  private async fetchConversationData(conversationId: string): Promise<{
    conversation: Conversation;
    messages: Message[];
  }> {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw new Error('Failed to fetch conversation messages');
    }

    return { conversation, messages: messages || [] };
  }

  private async analyzeCompetency(
    conversationData: { conversation: Conversation; messages: Message[] },
    request: ReportGenerationRequest
  ): Promise<CompetencyScore> {
    const conversationText = conversationData.messages
      .map(msg => `${msg.sender}: ${msg.message_text}`)
      .join('\n\n');

    const analysisPrompt = `
As an expert AI competency assessor, analyze this conversation transcript to determine the business owner's AI competency level using the 4-level framework:

COMPETENCY LEVELS:
${this.competencyLevels.map(level => `
Level ${level.level} - ${level.name}:
- Mindset: ${level.mindset}
- Understanding: ${level.understanding}  
- Usage: ${level.usage}
`).join('\n')}

CONVERSATION TRANSCRIPT:
${conversationText}

ASSESSMENT CONTEXT:
- Assessment Type: ${request.assessment_type}
- User Context: ${JSON.stringify(request.user_context || {})}

Please analyze the conversation and provide a JSON response with the following structure:
{
  "overall_level": [1-4],
  "mindset_score": [1-10 score for mindset dimension],
  "understanding_score": [1-10 score for understanding dimension], 
  "usage_score": [1-10 score for usage dimension],
  "strengths": ["list of key strengths identified"],
  "development_areas": ["list of areas needing development"],
  "key_insights": ["important insights about their AI journey"],
  "reasoning": "Brief explanation of the level assignment"
}

Focus on evidence from their actual responses, not assumptions. Be precise and fair in your assessment.`;

    const result = await geminiModel.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing competency analysis:', error);
      throw new Error('Failed to parse competency analysis');
    }
  }

  private async generateFullReport(
    conversationData: { conversation: Conversation; messages: Message[] },
    competencyAnalysis: CompetencyScore,
    request: ReportGenerationRequest
  ): Promise<GeneratedReport> {
    const conversationText = conversationData.messages
      .map(msg => `${msg.sender}: ${msg.message_text}`)
      .join('\n\n');

    const competencyLevel = this.competencyLevels.find(l => l.level === competencyAnalysis.overall_level)!;
    
    // Read the report generator prompt from the file system
    const reportPrompt = await this.getReportGeneratorPrompt();
    
    const fullReportPrompt = `
${reportPrompt}

CONVERSATION TRANSCRIPT:
${conversationText}

COMPETENCY ANALYSIS:
- Overall Level: ${competencyLevel.level} - ${competencyLevel.name}
- Mindset Score: ${competencyAnalysis.mindset_score}/10
- Understanding Score: ${competencyAnalysis.understanding_score}/10
- Usage Score: ${competencyAnalysis.usage_score}/10
- Key Strengths: ${competencyAnalysis.strengths.join(', ')}
- Development Areas: ${competencyAnalysis.development_areas.join(', ')}

USER CONTEXT:
${JSON.stringify(request.user_context || {}, null, 2)}

Please generate a comprehensive Business Owner AI Competency Assessment Report following the structure and guidelines provided. Make it personalized, actionable, and valuable for this specific individual based on their conversation responses.

The report should be in markdown format and include:
1. Executive Summary
2. Current State Analysis (with specific scores)
3. Personalized Recommendations (Immediate/Short-term/Long-term)
4. Industry-Specific Insights
5. Resource Recommendations
6. Next Steps & Support

Focus on their actual responses and provide specific, actionable recommendations.`;

    const result = await geminiModel.generateContent(fullReportPrompt);
    const response = await result.response;
    const fullReportMarkdown = response.text();

    // Parse the structured report sections
    const sections = this.parseReportSections(fullReportMarkdown);

    return {
      executive_summary: sections.executive_summary,
      competency_level: competencyLevel,
      current_state_analysis: {
        foundational_understanding: competencyAnalysis.understanding_score,
        practical_experience: competencyAnalysis.usage_score,
        strategic_application: competencyAnalysis.mindset_score,
        key_strengths: competencyAnalysis.strengths,
        development_areas: competencyAnalysis.development_areas
      },
      personalized_recommendations: sections.recommendations,
      industry_insights: sections.industry_insights,
      resource_recommendations: sections.resources,
      action_plan: sections.action_plan,
      full_report_markdown: fullReportMarkdown
    };
  }

  private async getReportGeneratorPrompt(): Promise<string> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const promptPath = path.join(__dirname, '../../../docs/prompts/report_generator.md');
      return await fs.readFile(promptPath, 'utf8');
    } catch (error) {
      console.warn('Could not read report generator prompt file, using embedded version');
      return `# Assessment Report Generator

You are an expert consultant who creates comprehensive, personalized assessment reports based on conversation transcripts. Your reports provide valuable insights, actionable recommendations, and demonstrate deep expertise to build trust and establish the foundation for future consulting relationships.

Create a professional Business Owner AI Competency Assessment Report that is personalized, actionable, and demonstrates genuine value. Focus on their specific situation and provide concrete next steps.`;
    }
  }

  private parseReportSections(markdown: string): {
    executive_summary: string;
    recommendations: {
      immediate_actions: string[];
      short_term_goals: string[];
      long_term_vision: string;
    };
    industry_insights: string[];
    resources: string[];
    action_plan: string;
  } {
    // Simple parsing - in production, you might want more sophisticated markdown parsing
    const sections = {
      executive_summary: this.extractSection(markdown, 'Executive Summary'),
      recommendations: {
        immediate_actions: this.extractListItems(markdown, 'Immediate Actions'),
        short_term_goals: this.extractListItems(markdown, 'Short-term Goals'),
        long_term_vision: this.extractSection(markdown, 'Long-term Vision')
      },
      industry_insights: this.extractListItems(markdown, 'Industry-Specific Insights'),
      resources: this.extractListItems(markdown, 'Resource Recommendations'),
      action_plan: this.extractSection(markdown, 'Next Steps')
    };

    return sections;
  }

  private extractSection(markdown: string, sectionTitle: string): string {
    const regex = new RegExp(`##?\\s*${sectionTitle}[^\\n]*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
    const match = markdown.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractListItems(markdown: string, sectionTitle: string): string[] {
    const sectionText = this.extractSection(markdown, sectionTitle);
    const items = sectionText.match(/^[-*]\s+(.+)$/gm);
    return items ? items.map(item => item.replace(/^[-*]\s+/, '').trim()) : [];
  }

  private async saveAssessment(
    conversationId: string,
    competencyAnalysis: CompetencyScore,
    report: GeneratedReport
  ): Promise<void> {
    const { error } = await supabase
      .from('assessments')
      .insert({
        conversation_id: conversationId,
        summary_text: report.full_report_markdown,
        score_json: competencyAnalysis,
        requires_review: false,
        reviewed: false
      });

    if (error) {
      console.error('Error saving assessment:', error);
      throw new Error('Failed to save assessment');
    }
  }

  async getExistingReport(conversationId: string): Promise<GeneratedReport | null> {
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();

      if (error || !assessment) {
        return null;
      }

      const competencyLevel = this.competencyLevels.find(l => l.level === assessment.score_json.overall_level)!;
      const sections = this.parseReportSections(assessment.summary_text);

      return {
        executive_summary: sections.executive_summary,
        competency_level: competencyLevel,
        current_state_analysis: {
          foundational_understanding: assessment.score_json.understanding_score,
          practical_experience: assessment.score_json.usage_score,
          strategic_application: assessment.score_json.mindset_score,
          key_strengths: assessment.score_json.strengths,
          development_areas: assessment.score_json.development_areas
        },
        personalized_recommendations: sections.recommendations,
        industry_insights: sections.industry_insights,
        resource_recommendations: sections.resources,
        action_plan: sections.action_plan,
        full_report_markdown: assessment.summary_text
      };
    } catch (error) {
      console.error('Error retrieving existing report:', error);
      return null;
    }
  }

  async getReportStatus(conversationId: string): Promise<{
    exists: boolean;
    created_at?: string;
    requires_review: boolean;
    reviewed: boolean;
  }> {
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('created_at, requires_review, reviewed')
        .eq('conversation_id', conversationId)
        .single();

      if (error || !assessment) {
        return { exists: false, requires_review: false, reviewed: false };
      }

      return {
        exists: true,
        created_at: assessment.created_at,
        requires_review: assessment.requires_review,
        reviewed: assessment.reviewed
      };
    } catch (error) {
      console.error('Error checking report status:', error);
      return { exists: false, requires_review: false, reviewed: false };
    }
  }
}

export default new ReportGenerationService();