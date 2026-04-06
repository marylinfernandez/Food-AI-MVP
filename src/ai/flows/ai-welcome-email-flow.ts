'use server';

/**
 * @fileOverview Genkit flow to generate a personalized welcome email content for new users of FoodAI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WelcomeEmailInputSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional().nullable(),
  language: z.string().default('spanish-la'),
});

export type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;

const WelcomeEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line for the welcome email.'),
  body: z.string().describe('The main content of the welcome email in HTML or text format.'),
});

export type WelcomeEmailOutput = z.infer<typeof WelcomeEmailOutputSchema>;

export async function generateWelcomeEmail(input: WelcomeEmailInput): Promise<WelcomeEmailOutput> {
  return welcomeEmailFlow(input);
}

const welcomeEmailPrompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: { schema: WelcomeEmailInputSchema },
  output: { schema: WelcomeEmailOutputSchema },
  prompt: `You are the FoodAI Welcome Assistant. A new chef has just joined our intelligent kitchen ecosystem.
  
  User Email: {{{email}}}
  User Name: {{#if displayName}}{{{displayName}}}{{else}}Chef{{/if}}
  Language: {{{language}}}

  Create a warm, futuristic, and inspiring welcome message. 
  Mention how FoodAI will help them manage their pantry with AI Vision and suggest recipes that save time and reduce waste.
  
  The tone should be professional yet friendly. Return a subject and a body.`,
});

const welcomeEmailFlow = ai.defineFlow(
  {
    name: 'welcomeEmailFlow',
    inputSchema: WelcomeEmailInputSchema,
    outputSchema: WelcomeEmailOutputSchema,
  },
  async (input) => {
    const { output } = await welcomeEmailPrompt(input);
    if (!output) throw new Error('Failed to generate welcome email content');
    return output;
  }
);
