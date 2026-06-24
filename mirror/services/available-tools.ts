import { FunctionDeclaration, Type } from '@google/genai';

function analyzeThinking(userApproach: string, problemContext: string): object {
  const hasTimeComplexity = /O\(.*\)|time complexity|big o/i.test(userApproach);
  const hasSpaceComplexity = /space|memory/i.test(userApproach);
  const hasDataStructure = /array|hash|map|set|tree|stack|queue|heap|graph|linked list|trie/i.test(userApproach);
  const hasPattern = /two pointer|sliding window|binary search|dfs|bfs|dynamic programming|dp|greedy|backtrack|divide and conquer/i.test(userApproach);
  const hasBruteForce = /brute force|nested loop|check all|try every/i.test(userApproach);

  const strengths: string[] = [];
  const improvements: string[] = [];
  const questions: string[] = [];

  if (hasDataStructure) strengths.push('Good: You identified relevant data structures');
  else improvements.push('Consider: What data structure would best fit this problem?');

  if (hasTimeComplexity) strengths.push('Good: You considered time complexity');
  else improvements.push('Think about: What is the time complexity of your approach?');

  if (hasSpaceComplexity) strengths.push('Good: You thought about space usage');
  else questions.push('What about space complexity? Is there a tradeoff?');

  if (hasPattern) strengths.push('Excellent: You recognized an algorithmic pattern');
  else questions.push('Are there any well-known patterns that might apply here?');

  if (hasBruteForce) {
    strengths.push('Good starting point: You considered the brute force approach');
    questions.push('Now, can you optimize from the brute force? Where is the repeated work?');
  }

  return {
    problemContext,
    thinkingScore: Math.min(5, strengths.length + 1),
    strengths,
    improvements,
    followUpQuestions: questions,
    tip: 'Remember: understanding the problem deeply is more valuable than jumping to code.',
  };
}

function getHint(problemTopic: string, currentLevel: number, userAttempt: string): object {
  const level = Math.max(1, Math.min(3, currentLevel));

  const hintsByLevel: Record<number, string> = {
    1: `Think about the core operation you need to perform repeatedly. What makes this problem different from a simple iteration?`,
    2: `For "${problemTopic}" problems, there's usually a key insight about how data relates to each other. What relationship between elements could you exploit?`,
    3: `The key pattern here involves maintaining some state as you process elements. Consider: what information do you need to remember, and what's the cheapest way to look it up?`,
  };

  return {
    problemTopic,
    hintLevel: level,
    hint: hintsByLevel[level],
    nextAction: level < 3
      ? 'Try applying this hint. If still stuck, ask for a more specific hint.'
      : 'This is the most specific hint I can give without showing code. Try to implement based on this insight!',
    reminder: 'The goal is understanding, not just solving. Take your time.',
  };
}

function evaluateApproach(approach: string, optimalPattern: string): object {
  const approachLower = approach.toLowerCase();
  const patternLower = optimalPattern.toLowerCase();

  const isOnRightTrack = approachLower.includes(patternLower) ||
    approachLower.includes(patternLower.split(' ')[0]);

  let rating: number;
  let feedback: string;

  if (isOnRightTrack) {
    rating = 4;
    feedback = 'Your approach aligns well with an optimal strategy! Focus on the implementation details now.';
  } else if (approachLower.includes('brute force') || approachLower.includes('nested')) {
    rating = 2;
    feedback = 'You have a working approach, but there is room for significant optimization. Think about what information you are recomputing.';
  } else {
    rating = 3;
    feedback = 'Interesting approach! Think about whether there is a well-known pattern that could simplify this.';
  }

  return {
    optimalPatternHint: `The optimal approach uses a "${optimalPattern}" strategy`,
    rating: `${rating}/5`,
    feedback,
    complexityHint: 'Consider: can you solve this in a single pass? What auxiliary data structure would help?',
    encouragement: rating >= 3
      ? "You're thinking in the right direction! Keep going."
      : "Don't worry — recognizing the gap is the first step to improvement!",
  };
}

//This is tool implementation by API Google GenAI
export const toolImplementations: { [key: string]: (...args: any[]) => any } = {
  analyzeThinking, //Tool to analyze the thinking of user
  getHint, //Tool to get the hint for the user's problem
  evaluateApproach, //Tool to evaluate the user's approach
};

//This is function declarations by API Google GenAI
export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'analyzeThinking',
    description: 'Analyze a user\'s thinking process and approach for a DSA problem. Returns structured feedback on strengths, weaknesses, and follow-up questions.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        userApproach: {
          type: Type.STRING,
          description: 'The user\'s described approach or thinking process',
        },
        problemContext: {
          type: Type.STRING,
          description: 'Brief description of the DSA problem being discussed',
        },
      },
      required: ['userApproach', 'problemContext'],
    },
  },
  {
    name: 'getHint',
    description: 'Provide an escalating hint for a DSA problem. Level 1 is vague, level 2 is moderate, level 3 is the most specific (but still no code).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        problemTopic: {
          type: Type.STRING,
          description: 'The topic or name of the DSA problem',
        },
        currentLevel: {
          type: Type.NUMBER,
          description: 'Hint level from 1 (vague) to 3 (specific)',
        },
        userAttempt: {
          type: Type.STRING,
          description: 'What the user has tried so far',
        },
      },
      required: ['problemTopic', 'currentLevel', 'userAttempt'],
    },
  },
  {
    name: 'evaluateApproach',
    description: 'Evaluate a user\'s approach by comparing it to an optimal pattern. Returns a rating and feedback without revealing the solution.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        approach: {
          type: Type.STRING,
          description: 'The user\'s described approach to solving the problem',
        },
        optimalPattern: {
          type: Type.STRING,
          description: 'The name of the optimal algorithmic pattern (e.g., "hash map lookup", "two pointers")',
        },
      },
      required: ['approach', 'optimalPattern'],
    },
  }
];
