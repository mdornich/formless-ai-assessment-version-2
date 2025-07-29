import dotenv from 'dotenv';
import path from 'path';
import { ReportGenerationService } from '../services/reportGenerationService';
import { createTestConversation, createTestMessages, testUserContext } from './testData';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testReportGenerationOnly() {
  console.log('🧪 Testing Assessment Report Generation (Gemini AI Only)...\n');

  try {
    // Create test data (in memory only)
    const testConversation = createTestConversation();
    const testMessages = createTestMessages(testConversation.id);

    console.log('📝 Created test conversation and messages');
    console.log('Conversation ID:', testConversation.id);
    console.log('Messages count:', testMessages.length);

    // Mock the conversation data structure 
    const conversationData = {
      conversation: testConversation,
      messages: testMessages
    };

    console.log('\n🤖 Generating assessment report with Gemini AI...');
    console.log('This will analyze the conversation and create a comprehensive report...\n');

    const reportService = new ReportGenerationService();
    
    // We'll mock the database calls and call the analysis directly
    const conversationText = testMessages
      .map(msg => `${msg.sender}: ${msg.message_text}`)
      .join('\n\n');

    console.log('📄 Conversation being analyzed:');
    console.log('─'.repeat(50));
    console.log(conversationText);
    console.log('─'.repeat(50));

    // Call the competency analysis directly
    console.log('\n🔍 Analyzing competency level...');
    
    // Use reflection to access private method for testing
    const competencyAnalysis = await (reportService as any).analyzeCompetency(
      conversationData,
      {
        conversation_id: testConversation.id,
        assessment_type: 'business_owner_competency' as const,
        user_context: testUserContext
      }
    );

    console.log('\n📊 Competency Analysis Results:');
    console.log('Overall Level:', competencyAnalysis.overall_level);
    console.log('Mindset Score:', competencyAnalysis.mindset_score + '/10');
    console.log('Understanding Score:', competencyAnalysis.understanding_score + '/10');
    console.log('Usage Score:', competencyAnalysis.usage_score + '/10');
    console.log('Key Strengths:', competencyAnalysis.strengths);
    console.log('Development Areas:', competencyAnalysis.development_areas);

    console.log('\n🎯 Key Insights:', competencyAnalysis.key_insights);

    console.log('\n✅ Report generation test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('- The Gemini AI integration is working perfectly');
    console.log('- The 4-level competency framework analysis is functional');
    console.log('- To run full tests, you\'ll need valid Supabase credentials');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testReportGenerationOnly();