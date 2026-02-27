'use server';
/**
 * @fileOverview A Genkit flow that generates personalized recipe suggestions.
 * It now handles specific user requests and compares them against available pantry items.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedRecipeGenerationInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients currently available in the pantry/fridge.'),
  numberOfPeople: z
    .number()
    .int()
    .positive()
    .describe('The number of people the recipe should serve.'),
  mealType: z
    .string()
    .optional()
    .describe('The type of dish requested (e.g., "Main Dish", "Dessert").'),
  specificRequest: z
    .string()
    .optional()
    .describe('A specific dish the user wants to prepare (e.g., "Lasagna").'),
  language: z
    .string()
    .default('spanish-la')
    .describe('The language in which the recipe should be generated.'),
});
export type PersonalizedRecipeGenerationInput = z.infer<
  typeof PersonalizedRecipeGenerationInputSchema
>;

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  description: z.string().describe('A brief description.'),
  ingredientsOwned: z
    .array(z.string())
    .describe('Ingredients required that the user ALREADY HAS in their pantry.'),
  ingredientsMissing: z
    .array(z.string())
    .describe('Ingredients required that the user IS MISSING.'),
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
  prompt: `You are FoodAI, a high-tech cooking assistant.
Your goal is to suggest recipes in the following language: {{{language}}}.

USER DATA:
- Pantry Ingredients: {{{ingredients}}}
- People to serve: {{{numberOfPeople}}}
{{#if mealType}}- Requested Category: {{{mealType}}}{{/if}}
{{#if specificRequest}}- Specific Goal: "{{{specificRequest}}}"{{/if}}

INSTRUCTIONS:
1. If 'specificRequest' is provided, generate a recipe for THAT exact dish. Compare the required ingredients with the 'Pantry Ingredients' list.
2. Populating 'ingredientsOwned': List items needed that are present in the pantry.
3. Populating 'ingredientsMissing': List items needed that are NOT in the pantry.
4. If 'specificRequest' is NOT provided, suggest creative recipes using ONLY the 'Pantry Ingredients'. In this case, 'ingredientsMissing' should be empty.
5. Provide a short 'imageSearchTerm' in English for a photo database.

All text fields (name, description, ingredients, instructions) MUST be in {{{language}}}.`,
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
