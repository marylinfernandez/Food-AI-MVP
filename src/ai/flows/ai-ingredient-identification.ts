'use server';
/**
 * @fileOverview Este file define un flujo de Genkit para identificar ingredientes desde una foto o video.
 * Utiliza Gemini 2.5 Flash para capacidades multimodales avanzadas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {googleAI} from '@genkit-ai/google-genai';

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

const identifyIngredientsPrompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  input: {schema: IngredientIdentificationInputSchema},
  output: {schema: IngredientIdentificationOutputSchema},
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `You are an expert AI chef and nutritionist. Your task is to analyze the provided photo or video of a refrigerator or pantry and identify EVERY food item you see.

DIRECTIONS:
1. Examine the media carefully. Look at labels, shapes, and colors.
2. For each item identified, estimate its quantity.
3. Provide a confidence score for each identification.
4. If the image is blurry or items are hard to see, do your best to identify based on context.

MEDIA TO ANALYZE: {{media url=mediaDataUri}}
{{#if description}}ADDITIONAL CONTEXT: {{{description}}}{{/if}}

Please return a structured list of ingredients and a helpful summary.`,
});

export async function aiIngredientIdentification(
  input: IngredientIdentificationInput
): Promise<IngredientIdentificationOutput> {
  const {output} = await identifyIngredientsPrompt(input);
  if (!output) {
    throw new Error('No output received from the ingredient identification prompt.');
  }
  return output;
}
