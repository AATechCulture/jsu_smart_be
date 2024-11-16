import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      model: "gpt-4",
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
      stream: false,
    });

    const adviceText = response.choices[0].message.content;
    const advicePoints = adviceText
      ?.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[•-]\s*/, '').trim());

    return NextResponse.json({ 
      advice: advicePoints || ['No specific recommendations available at this time.']
    });

  } catch (error) {
    console.error('Error in financial advisor route:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial advice' },
      { status: 500 }
    );
  }
}