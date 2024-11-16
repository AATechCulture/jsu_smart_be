import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure API key is present and properly formatted
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured in environment variables');
}

// Initialize OpenAI client with error handling
let openai: OpenAI;
try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  throw new Error('Failed to initialize OpenAI client');
}

// Types for better type safety
interface Transaction {
  amount: number;
  category: string;
  date: string;
}

interface FinancialAdviceRequest {
  type: 'financial-advice';
  transactions: Transaction[];
  totalBalance: number;
  income: number;
  expenses: number;
}

interface CommunityChatRequest {
  type?: 'community-chat' | undefined;
  message: string;
}

// Helper function to validate financial data
function validateFinancialData(data: FinancialAdviceRequest) {
  const errors = [];

  if (!Array.isArray(data.transactions)) {
    errors.push('Transactions must be an array');
  } else if (data.transactions.length === 0) {
    errors.push('At least one transaction is required');
  } else {
    // Validate individual transactions
    const invalidTransactions = data.transactions.filter(t => 
      typeof t.amount !== 'number' || 
      !t.category?.trim() || 
      !t.date?.trim()
    );
    if (invalidTransactions.length > 0) {
      errors.push('All transactions must have valid amount, category, and date');
    }
  }

  if (typeof data.totalBalance !== 'number') {
    errors.push('Total balance must be a number');
  }
  if (typeof data.income !== 'number') {
    errors.push('Income must be a number');
  }
  if (typeof data.expenses !== 'number') {
    errors.push('Expenses must be a number');
  }

  return errors;
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Helper function to handle community chat
async function handleCommunityChat(message: string) {
  if (!message?.trim()) {
    throw new Error('Message is required');
  }

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
        - Guide users to relevant community resources`
      },
      {
        role: "user",
        content: message.trim()
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const reply = response.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('No response received from OpenAI API');
  }

  return reply;
}

// Helper function to handle financial advice
async function handleFinancialAdvice(data: FinancialAdviceRequest) {
  const validationErrors = validateFinancialData(data);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(', '));
  }

  // Calculate metrics
  const savingsRate = data.income > 0 
    ? ((data.income - data.expenses) / data.income * 100).toFixed(1) 
    : '0';
  
  const monthlyNet = data.income - data.expenses;
  const emergencyFundMonths = data.totalBalance / data.expenses;

  // Process transactions
  const spendingByCategory = data.transactions.reduce((acc: Record<string, number>, t: Transaction) => {
    const amount = Math.abs(Number(t.amount));
    const category = t.category.trim();
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const topCategories = Object.entries(spendingByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Generate insights
  const insights = [];
  if (parseFloat(savingsRate) < 20) {
    insights.push('Your savings rate is below the recommended 20%');
  }
  if (emergencyFundMonths < 3) {
    insights.push('Your emergency fund covers less than 3 months of expenses');
  }
  if (monthlyNet < 0) {
    insights.push('You are currently spending more than you earn');
  }

  const prompt = `As a financial advisor, analyze this data and provide 3-4 specific, actionable recommendations:

  Financial Overview:
  - Total Balance: ${formatCurrency(data.totalBalance)}
  - Monthly Income: ${formatCurrency(data.income)}
  - Monthly Expenses: ${formatCurrency(data.expenses)}
  - Monthly Net: ${formatCurrency(monthlyNet)}
  - Savings Rate: ${savingsRate}%
  - Emergency Fund: ${emergencyFundMonths.toFixed(1)} months of expenses

  ${topCategories.length > 0 ? `
  Top Spending Categories:
  ${topCategories.map(([category, amount]) => 
    `- ${category}: ${formatCurrency(amount)}`
  ).join('\n')}
  ` : ''}

  ${insights.length > 0 ? `
  Key Concerns:
  ${insights.map(insight => `- ${insight}`).join('\n')}
  ` : ''}

  Please provide 3-4 specific recommendations. Each recommendation should:
  1. Start with an action verb (e.g., "Create", "Reduce", "Allocate")
  2. Include specific numbers or percentages
  3. Focus on practical, actionable steps
  4. Address the key financial concerns identified

  Format your response as bullet points starting with "• " or "- ".
  Example format:
  • Reduce dining expenses by 30% (from $500 to $350) by cooking meals at home
  • Create an emergency fund by allocating $300 monthly until reaching $9,000
  • Increase retirement contributions by 5% to maximize employer match`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",  // Changed to 3.5-turbo for reliability
    messages: [
      {
        role: "system",
        content: "You are a financial advisor who provides clear, actionable recommendations. Each recommendation must start with an action verb and include specific numbers or percentages. Focus on practical steps that directly address the client's financial situation."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,  // Reduced temperature for more consistent output
    max_tokens: 500,
  });

  const adviceText = response.choices[0]?.message?.content?.trim();
  if (!adviceText) {
    throw new Error('No advice generated');
  }

  // Less strict filtering of advice points
  const advicePoints = adviceText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Clean up the line while preserving the content
      let cleaned = line;
      // Remove bullet points if present
      cleaned = cleaned.replace(/^[•\-\*]\s*/, '');
      // Ensure first letter is capitalized
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      return cleaned;
    })
    .filter(point => {
      // Basic validation: ensure it's a substantial piece of advice
      return point.length >= 10 && /^[A-Z]/.test(point);
    });

  // If we still don't have any valid points, generate some default advice
  if (advicePoints.length === 0) {
    const defaultAdvice = [
      `Create an emergency fund by saving ${formatCurrency(data.expenses * 0.1)} monthly until you have 3 months of expenses saved`,
      `Reduce expenses by ${monthlyNet < 0 ? formatCurrency(Math.abs(monthlyNet)) : '10%'} to improve your savings rate`,
      `Track your spending in ${Object.keys(spendingByCategory).slice(0, 3).join(', ')} categories to identify potential savings`
    ];
    return {
      advice: defaultAdvice,
      metrics: {
        savingsRate,
        monthlyNet,
        emergencyFundMonths,
        topCategories: Object.fromEntries(topCategories),
        insights
      }
    };
  }

  return {
    advice: advicePoints,
    metrics: {
      savingsRate,
      monthlyNet,
      emergencyFundMonths,
      topCategories: Object.fromEntries(topCategories),
      insights
    }
  };
}

// Main route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle community chat request
    if (!body.type || body.type === 'community-chat') {
      try {
        const { message } = body as CommunityChatRequest;
        const reply = await handleCommunityChat(message);
        return NextResponse.json({ reply });
      } catch (error) {
        console.error('Community chat error:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to process chat request' },
          { status: 500 }
        );
      }
    }
    
    // Handle financial advice request
    else if (body.type === 'financial-advice') {
      try {
        const result = await handleFinancialAdvice(body as FinancialAdviceRequest);
        return NextResponse.json(result);
      } catch (error) {
        console.error('Financial advice error:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to process financial advice request' },
          { status: 500 }
        );
      }
    }

    // Handle invalid request type
    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}