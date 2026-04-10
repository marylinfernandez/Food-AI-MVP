'use server';
/**
 * @fileOverview Este archivo define un flujo de Genkit para identificar ingredientes desde una foto o video.
 * Optimizado para identificar alimentos sin etiquetas usando Gemini 3.0 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
  // CORRECCIÓN: Cambiado al modelo real y rápido Gemini 3.0 Flash
  model: googleAI.model('gemini-3.0-flash'), 
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are an expert AI chef with super-human vision. Your task is to analyze the provided photo or video of a refrigerator or pantry and identify every food item present.

CRITICAL INSTRUCTIONS:
1. IDENTIFY NON-LABELED ITEMS: Many items will NOT have labels. Identify fruits (apples, bananas, lemons), vegetables (carrots, onions, broccoli), and items in clear containers based on their shape, color, and texture.
2. NO LIGHTING EXCUSES: Do not complain about lighting or image quality. Use your advanced reasoning to infer items from silhouettes, shadows, or partial visibility. Even if it is dim or grainy, identify what you see.
3. BE PRECISE BUT BRAVE: If you see a green leafy vegetable and you are 70% sure it's spinach, identify it as spinach. 
4. DO NOT REJECT THE REQUEST: Never respond saying the image is too dark or blurry. Provide the best possible identification with the visual data available.
5. For each item:
   - Identify the specific name (e.g., "Tomato", "Butter", "Milk").
   - Estimate the quantity (e.g., "2 units", "half full").
   - Assign a confidence score.
6. Provide a helpful summary in Spanish (Latin America).

MEDIA TO ANALYZE: {{media url=mediaDataUri}}
{{#if description}}CONTEXT: {{{description}}}{{/if}}

Identify all ingredients and respond in a professional tone.`,
});

export async function aiIngredientIdentification(
  input: IngredientIdentificationInput
): Promise<IngredientIdentificationOutput> {
  
  // SEGURO DE VIDA: Si el string de Base64 es exageradamente grande (ej. un video de 1 minuto en alta calidad),
  // cortamos la petición antes de que colapse la memoria de tu servidor.
  if (input.mediaDataUri.length > 20000000) { 
    throw new Error('El archivo es demasiado grande. La app debió detener el video a los 10 segundos o comprimirlo más.');
  }

  const {output} = await identifyIngredientsPrompt(input);
  if (!output) {
    throw new Error('No output received from the vision analysis.');
  }
  return output;
}