import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { analyzeCodeTool, searchDocumentationTool, runTestsTool, generateCodeTool } from '@/lib/tools';

export const maxDuration = 60; // Agents may need more time

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // TODO: Session 3 - Implement agent with tools
    // Key concepts: tool calling, planning, reasoning
    
    const result = streamText({
      model: openai('gpt-4o'), // Use more capable model for agents
      system: `You are DevMate Agent, an autonomous AI programming assistant. You can:

AVAILABLE TOOLS:
- analyzeCode: Review code for bugs, performance, style, security
- searchDocumentation: Find best practices and documentation  
- runTests: Execute and analyze test results
- generateCode: Create code snippets and examples

YOUR APPROACH:
1. Understand the user's request clearly
2. Plan which tools you need to use
3. Execute tools in logical order
4. Synthesize results into helpful responses
5. Always explain your reasoning process

REASONING STYLE:
- Think step-by-step about complex tasks
- Use multiple tools when beneficial
- Explain what you're doing and why
- Provide actionable recommendations

Be thorough but efficient. Show your reasoning process so users understand how you're helping them.`,
      
      messages: convertToModelMessages(messages),
      tools: {
        analyzeCode: analyzeCodeTool,
        searchDocumentation: searchDocumentationTool,
        runTests: runTestsTool,
        generateCode: generateCodeTool,
      },
      toolChoice: 'auto', // Let the model choose when to use tools
      maxTokens: 1500,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Agent error:', error);
    return Response.json(
      { error: 'Agent request failed' },
      { status: 500 }
    );
  }
}
