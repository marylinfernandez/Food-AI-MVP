'use server';
/**
 * @fileOverview A Genkit flow for finding nearby stores with product availability and price comparison.
 * Uses Gemini 1.5 Flash for high-performance reasoning and stability.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NearbyStoresInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  missingIngredients: z.array(z.string()).optional(),
  language: z.string().default('spanish-la'),
});

export type NearbyStoresInput = z.infer<typeof NearbyStoresInputSchema>;

const ProductInfoSchema = z.object({
  product: z.string().describe('Name of the missing product.'),
  inStock: z.boolean().describe('Whether it is likely to be available.'),
  estimatedPrice: z.string().describe('Estimated price in local currency.'),
});

const StoreSchema = z.object({
  name: z.string(),
  address: z.string(),
  distance: z.string().describe('Approximate distance, e.g., "500m", "1.2km"'),
  hours: z.string().describe('Opening hours today'),
  isOpen: z.boolean(),
  type: z.string().describe('Category: Supermarket, Convenience Store, etc.'),
  availability: z.array(ProductInfoSchema).describe('Stock analysis for missing products.'),
  totalEstimatedPrice: z.string().describe('Total estimated sum of missing products at this store.'),
  websiteSearchUrl: z.string().describe('Direct link to the store website or a search results page for the products.'),
});

const NearbyStoresOutputSchema = z.object({
  stores: z.array(StoreSchema),
});

export type NearbyStoresOutput = z.infer<typeof NearbyStoresOutputSchema>;

export async function aiNearbyStores(input: NearbyStoresInput): Promise<NearbyStoresOutput> {
  return aiNearbyStoresFlow(input);
}

const storesPrompt = ai.definePrompt({
  name: 'nearbyStoresPrompt',
  input: { schema: NearbyStoresInputSchema },
  output: { schema: NearbyStoresOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are FoodAI Assistant. Help the user find where to buy these missing ingredients: {{{missingIngredients}}}.

Based on location (Lat: {{latitude}}, Lon: {{longitude}}), suggest 3 real or highly plausible local stores.
For each store:
1. Evaluate likely stock for each missing item (availability).
2. Estimate a realistic price based on store type (e.g., supermarkets are generally cheaper than convenience stores).
3. Calculate a "Total Estimated Price".
4. Provide a direct website URL if known, or a helpful Google Search/Maps link specifically for that store's inventory.

Response Language: {{{language}}}.`,
});

const aiNearbyStoresFlow = ai.defineFlow(
  {
    name: 'aiNearbyStoresFlow',
    inputSchema: NearbyStoresInputSchema,
    outputSchema: NearbyStoresOutputSchema,
  },
  async (input) => {
    const { output } = await storesPrompt(input);
    if (!output) throw new Error('Failed to generate nearby stores info');
    return output;
  }
);
