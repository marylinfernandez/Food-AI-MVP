'use server';
/**
 * @fileOverview A Genkit flow that generates personalized recipe suggestions based on available ingredients and user preferences.
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
  prompt: `Eres un asistente de cocina experto y creativo, especializado en generar recetas personalizadas para minimizar el desperdicio de alimentos y la fatiga de decisión.\nTu objetivo es proponer una o más recetas prácticas y deliciosas utilizando exclusivamente los ingredientes disponibles del usuario.\n\nConsidera los siguientes detalles para personalizar las recetas:\n\nIngredientes disponibles: {{{ingredients}}}\nNúmero de personas: {{{numberOfPeople}}}\n\n{{#if allergies}}\nAlergias a considerar: {{{allergies}}}\n{{/if}}\n\n{{#if tastePreferences}}\nPreferencias de sabor/tipo de comida: {{{tastePreferences}}}\n{{/if}}\n\n{{#if cookingAppliances}}\nElectrodomésticos disponibles: {{{cookingAppliances}}}\n{{/if}}\n\n{{#if availableTimeMinutes}}\nTiempo máximo disponible (en minutos, para preparación y cocción): {{{availableTimeMinutes}}}\n{{/if}}\n\n{{#if cookingSkillLevel}}\nNivel de habilidad culinaria: {{{cookingSkillLevel}}}\n{{/if}}\n\nNivel de complejidad de la receta deseado (priorizando la practicidad): {{{complexityLevel}}}\n\nGenera una o más recetas que cumplan con todos estos criterios. Asegúrate de que las recetas sean prácticas y no requieran un esfuerzo cognitivo excesivo para el usuario.\nLas instrucciones deben ser claras y concisas. Solo utiliza los ingredientes disponibles.`,
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
