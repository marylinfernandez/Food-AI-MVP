'use server';
/**
 * @fileOverview A Genkit flow that generates personalized recipe suggestions based on available ingredients, user preferences, and specific meal types.
 *
 * - personalizedRecipeGeneration - A function that handles the recipe generation process.
 * - PersonalizedRecipeGenerationInput - The input type for the personalizedRecipeGeneration function.
 * - PersonalizedRecipeGenerationOutput - The return type for the personalizedRecipeGeneration function.
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
    .describe('The type of dish requested (e.g., "Main Dish", "Dessert", "Alcoholic Drink", "Juice").'),
  allergies: z
    .array(z.string())
    .optional()
    .describe('Optional: A list of allergies to consider when suggesting recipes.'),
  tastePreferences: z
    .array(z.string())
    .optional()
    .describe('Optional: A list of taste preferences (e.g., "spicy", "vegetarian", "comfort food").'),
  cookingAppliances: z
    .array(z.string())
    .optional()
    .describe('Optional: A list of cooking appliances available (e.g., "oven", "microwave", "air fryer").'),
  availableTimeMinutes: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Optional: The maximum time available for preparing and cooking the meal in minutes.'),
  cookingSkillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .optional()
    .describe('Optional: The cooking skill level of the user.'),
  complexityLevel: z
    .enum(['simple', 'moderate', 'complex'])
    .default('simple')
    .describe('Optional: The desired complexity level of the recipe, prioritizing practicality.'),
  language: z
    .string()
    .default('spanish-la')
    .describe('The language in which the recipe should be generated (e.g., "english", "spanish-es", "spanish-la").'),
});
export type PersonalizedRecipeGenerationInput = z.infer<
  typeof PersonalizedRecipeGenerationInputSchema
>;

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  description: z.string().describe('A brief description of the recipe.'),
  ingredientsNeeded: z
    .array(z.string())
    .describe('A list of specific ingredients required for the recipe, all of which should be available from the provided ingredients.'),
  instructions: z
    .array(z.string())
    .describe('A step-by-step list of instructions to prepare the recipe.'),
  prepTimeMinutes: z
    .number()
    .int()
    .positive()
    .describe('The estimated preparation time in minutes.'),
  cookTimeMinutes: z
    .number()
    .int()
    .positive()
    .describe('The estimated cooking time in minutes.'),
  servings: z
    .number()
    .int()
    .positive()
    .describe('The number of servings the recipe yields.'),
  imageSearchTerm: z
    .string()
    .describe('A short, English search term (1-2 words) that describes the dish visually for a food photo database.'),
});

const PersonalizedRecipeGenerationOutputSchema = z.object({
  recipes: z
    .array(RecipeSchema)
    .min(1)
    .describe('A list of personalized recipe suggestions.'),
});
export type PersonalizedRecipeGenerationOutput = z.infer<
  typeof PersonalizedRecipeGenerationOutputSchema
>;

const personalizedRecipePrompt = ai.definePrompt({
  name: 'personalizedRecipePrompt',
  input: { schema: PersonalizedRecipeGenerationInputSchema },
  output: { schema: PersonalizedRecipeGenerationOutputSchema },
  prompt: `You are an expert and creative cooking assistant for FoodAI.
Your goal is to suggest one or more practical and delicious recipes using exclusively the user's available ingredients.

IMPORTANT: You must generate the entire response (recipe name, description, ingredients, and instructions) in the following language: {{{language}}}.

{{#if mealType}}
USER PREFERENCE: The user specifically wants a: {{{mealType}}}. 
If it is a drink, it can be juice, alcoholic cocktail, non-alcoholic cocktail, or smoothie. If it is dessert, it must be sweet. If it is a main dish, it must be nutritious.
{{/if}}

Consider the following details:
Available ingredients: {{{ingredients}}}
Number of people: {{{numberOfPeople}}}

{{#if allergies}}
Allergies: {{{allergies}}}
{{/if}}

{{#if tastePreferences}}
Taste preferences: {{{tastePreferences}}}
{{/if}}

{{#if cookingAppliances}}
Available appliances: {{{cookingAppliances}}}
{{/if}}

{{#if availableTimeMinutes}}
Max time (mins): {{{availableTimeMinutes}}}
{{/if}}

Complexity level: {{{complexityLevel}}}

Generate recipes that are practical and don't require high cognitive effort. Instructions should be clear and concise.
Also, provide an 'imageSearchTerm' in English that best represents the dish visually (e.g., 'pasta carbonara', 'strawberry smoothie', 'chocolate cake').`,
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
