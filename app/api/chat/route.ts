import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle community chat request
    if (!body.type || body.type === 'community-chat') {
      const { message } = body;
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are MoreLife, a friendly community AI assistant focused on helping users discover and engage with community events and activities.

            Primary Functions:
            - Share information about upcoming community events
            - Discuss ongoing community activities and programs
            - Help users find and join community groups
            - Provide details about community meetups and workshops
            - Share information about local initiatives and projects
            - Guide users to relevant community resources
            
            Sample Events and Activities to Discuss:
            - Community meetups and networking events
            - Local workshops and training sessions
            - Group activities and social gatherings
            - Community projects and initiatives
            - Support groups and discussion forums
            - Volunteer opportunities
            - Community celebration events
            
            When responding:
            1. Be welcoming and enthusiastic about community participation
            2. Provide specific details about events when available
            3. Encourage community engagement
            4. Offer suggestions for getting involved
            5. Be inclusive and welcoming to all community members

            Remember to:
            - Keep responses upbeat and community-focused
            - Provide practical information about events and activities
            - Encourage social interaction and community building
            - Be specific about dates, times, and locations when discussing events
            - Suggest relevant community groups or activities based on user interests`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return NextResponse.json({ 
        reply: response.choices[0].message.content || "I apologize, but I'm unable to provide a response at the moment."
      });
    } 
    // Handle financial advice request
    else if (body.type === 'financial-advice') {
      const { transactions, totalBalance, income, expenses } = body;

      // Calculate financial metrics
      const savingsRate = ((income - expenses) / income * 100).toFixed(1);
      
      // Group transactions by category
      const spendingByCategory = transactions.reduce((acc: any, t: any) => {
        if (t.amount < 0) {
          const category = t.category;
          acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        }
        return acc;
      }, {});

      // Financial advisor prompt
      const prompt = `As a financial advisor, analyze this financial data and provide specific, actionable advice. 
      Keep responses concise and specific to the data.

      Financial Overview:
      - Total Balance: $${totalBalance}
      - Monthly Income: $${income}
      - Monthly Expenses: $${expenses}
      - Savings Rate: ${savingsRate}%

      Spending by Category:
      ${Object.entries(spendingByCategory)
        .map(([category, amount]) => `- ${category}: $${amount}`)
        .join('\n')}

      Based on this data:
      1. Identify concerning spending patterns
      2. Suggest specific savings opportunities
      3. Recommend concrete actions for financial improvement
      4. Highlight positive financial behaviors
      5. Suggest optimal budget allocations

      Format the response as a bulleted list of 3-5 specific, actionable recommendations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable financial advisor who gives clear, actionable advice based on spending patterns and financial data. Focus on practical, specific recommendations rather than general advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const adviceText = response.choices[0].message.content;
      const advicePoints = adviceText
        ?.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[•-]\s*/, '').trim());

      return NextResponse.json({ 
        advice: advicePoints || ['No specific recommendations available at this time.']
      });
    }

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}