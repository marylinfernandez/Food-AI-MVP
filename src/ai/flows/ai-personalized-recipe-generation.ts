'use server';
/**
 * @fileOverview A Genkit flow that generates personalized recipe suggestions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedRecipeGenerationInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients currently available.'),
  numberOfPeople: z
    .number()
    .int()
    .positive()
    .describe('The number of people to serve.'),
  mealType: z
    .string()
    .optional()
    .describe('The type of dish requested.'),
  specificRequest: z
    .string()
    .optional()
    .describe('A specific dish requested.'),
  language: z
    .string()
    .default('spanish-la')
    .describe('The language for the recipe.'),
});
export type PersonalizedRecipeGenerationInput = z.infer<
  typeof PersonalizedRecipeGenerationInputSchema
>;

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  description: z.string().describe('A brief description.'),
  ingredientsOwned: z
    .array(z.string())
    .describe('Ingredients required that the user HAS.'),
  ingredientsMissing: z
    .array(z.string())
    .describe('Ingredients required that the user MISSES.'),
  instructions: z
    .array(z.string())
    .describe('Step-by-step instructions.'),
  prepTimeMinutes: z.number().int().positive(),
  cookTimeMinutes: z.number().int().positive(),
  servings: z.number().int().positive(),
  imageSearchTerm: z.string().describe('English search term for the dish image.'),
});

const PersonalizedRecipeGenerationOutputSchema = z.object({
  recipes: z.array(RecipeSchema).min(1),
});
export type PersonalizedRecipeGenerationOutput = z.infer<
  typeof PersonalizedRecipeGenerationOutputSchema
>;

const personalizedRecipePrompt = ai.definePrompt({
  name: 'personalizedRecipePrompt',
  input: { schema: PersonalizedRecipeGenerationInputSchema },
  output: { schema: PersonalizedRecipeGenerationOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are FoodAI, a high-tech cooking assistant.
Your goal is to suggest recipes in the following language: {{{language}}}.

USER DATA:
- Pantry Ingredients: {{{ingredients}}}
- People to serve: {{{numberOfPeople}}}
{{#if mealType}}- Category: {{{mealType}}}{{/if}}
{{#if specificRequest}}- Specific Goal: "{{{specificRequest}}}"{{/if}}

All text fields MUST be in {{{language}}}.`,
});

const personalizedRecipeGenerationFlow = ai.defineFlow(
  {
    name: 'personalizedRecipeGenerationFlow',
    inputSchema: PersonalizedRecipeGenerationInputSchema,
    outputSchema: PersonalizedRecipeGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedRecipePrompt(input);
    return output!;
  }
);

export async function personalizedRecipeGeneration(
  input: PersonalizedRecipeGenerationInput
): Promise<PersonalizedRecipeGenerationOutput> {
  return personalizedRecipeGenerationFlow(input);
}
