import dotenv from 'dotenv';
import { ReportGenerationService } from '../services/reportGenerationService';
import { createTestConversation, createTestMessages, testUserContext } from './testData';
import supabase from '../config/supabase';

dotenv.config();

async function testReportGeneration() {
  console.log('🧪 Testing Assessment Report Generation System...\n');

  try {
    // Create test data
    const testConversation = createTestConversation();
    const testMessages = createTestMessages(testConversation.id);

    console.log('📝 Created test conversation and messages');
    console.log('Conversation ID:', testConversation.id);
    console.log('Messages count:', testMessages.length);

    // Insert test data into database
    console.log('\n💾 Inserting test data into database...');
    
    // Insert user first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: testConversation.user_id,
        email: 'test@example.com'
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating test user:', userError);
      return;
    }

    // Insert conversation
    const { error: convError } = await supabase
      .from('conversations')
      .insert(testConversation);

    if (convError) {
      console.error('Error creating test conversation:', convError);
      return;
    }

    // Insert messages
    const { error: msgError } = await supabase
      .from('messages')
      .insert(testMessages);

    if (msgError) {
      console.error('Error creating test messages:', msgError);
      return;
    }

    console.log('✅ Test data inserted successfully');

    // Generate report
    console.log('\n🤖 Generating assessment report with Gemini AI...');
    
    const reportService = new ReportGenerationService();
    const report = await reportService.generateReport({
      conversation_id: testConversation.id,
      assessment_type: 'business_owner_competency',
      user_context: testUserContext
    });

    console.log('\n📊 Report generated successfully!');
    console.log('Competency Level:', `${report.competency_level.level} - ${report.competency_level.name}`);
    console.log('Key Strengths:', report.current_state_analysis.key_strengths);
    console.log('Development Areas:', report.current_state_analysis.development_areas);
    
    console.log('\n📄 Executive Summary:');
    console.log(report.executive_summary);

    console.log('\n🎯 Immediate Actions:');
    report.personalized_recommendations.immediate_actions.forEach((action, i) => {
      console.log(`${i + 1}. ${action}`);
    });

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('assessments').delete().eq('conversation_id', testConversation.id);
    await supabase.from('messages').delete().eq('conversation_id', testConversation.id);
    await supabase.from('conversations').delete().eq('id', testConversation.id);
    await supabase.from('users').delete().eq('id', testConversation.user_id);
    
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testReportGeneration();
}

export { testReportGeneration };