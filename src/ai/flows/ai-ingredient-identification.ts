'use server';
/**
 * @fileOverview This file defines a Genkit flow for identifying ingredients from a photo or video
 * of a fridge or pantry. 
 *
 * - aiIngredientIdentification - A function that initiates the ingredient identification process.
 * - IngredientIdentificationInput - The input type for the aiIngredientIdentification function.
 * - IngredientIdentificationOutput - The return type for the aiIngredientIdentification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const IngredientIdentificationInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A photo or video of a fridge or pantry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe(
      'An optional text description to provide additional context about the contents.'
    ),
});

export type IngredientIdentificationInput = z.infer<
  typeof IngredientIdentificationInputSchema
>;

const IngredientIdentificationOutputSchema = z.object({
  identifiedIngredients: z
    .array(
      z.object({
        name: z.string().describe('The name of the identified ingredient.'),
        quantity: z
          .string()
          .optional()
          .describe(
            'The estimated quantity or amount of the ingredient (e.g., "half a carton", "3 apples").'
          ),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe(
            'A confidence score between 0 and 1.'
          ),
      })
    )
    .describe('A list of food items identified.'),
  summary: z
    .string()
    .describe('A brief summary of the contents.'),
});

export type IngredientIdentificationOutput = z.infer<
  typeof IngredientIdentificationOutputSchema
>;

export async function aiIngredientIdentification(
  input: IngredientIdentificationInput
): Promise<IngredientIdentificationOutput> {
  return aiIngredientIdentificationFlow(input);
}

const identifyIngredientsPrompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  input: {schema: IngredientIdentificationInputSchema},
  output: {schema: IngredientIdentificationOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an AI assistant specialized in identifying food ingredients from photos and videos of fridges and pantries.
    Meticulously examine the provided media and list all discernable food items.
    For each item, try to estimate its quantity and provide a confidence score.

    MEDIA TO ANALYZE: {{media url=mediaDataUri}}
    {{#if description}}ADDITIONAL CONTEXT: {{{description}}}{{/if}}`,
});

const aiIngredientIdentificationFlow = ai.defineFlow(
  {
    name: 'aiIngredientIdentificationFlow',
    inputSchema: IngredientIdentificationInputSchema,
    outputSchema: IngredientIdentificationOutputSchema,
  },
  async input => {
    const {output} = await identifyIngredientsPrompt(input);
    if (!output) {
        throw new Error('No output received from the ingredient identification prompt.');
    }
    return output;
  }
);
