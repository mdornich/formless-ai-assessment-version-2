import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 Environment Variables Check:')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');

// Test a simple Gemini call instead
import { geminiModel } from '../config/gemini';

async function testGeminiOnly() {
  try {
    console.log('\n🤖 Testing Gemini AI connection...');
    
    const prompt = "Say 'Hello, this is a test!' in exactly those words.";
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini AI Response:', text);
    console.log('\n🎉 Gemini test successful!');
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
  }
}

testGeminiOnly();