
'use server';
/**
 * @fileOverview Un flujo de Genkit para encontrar tiendas y supermercados cercanos basados en la ubicación.
 *
 * - aiNearbyStores - Función para obtener tiendas cercanas.
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

const StoreSchema = z.object({
  name: z.string(),
  address: z.string(),
  distance: z.string().describe('Distancia aproximada, ej: "500m", "1.2km"'),
  hours: z.string().describe('Horario de atención hoy'),
  isOpen: z.boolean(),
  type: z.string().describe('Categoría del local: Supermercado, Tienda Local, etc.'),
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
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `Eres FoodAI Assistant. Ayuda al usuario a encontrar dónde comprar estos ingredientes: {{{missingIngredients}}}.
Basándote en la ubicación aproximada (Lat: {{latitude}}, Lon: {{longitude}}), sugiere 3 o 4 tiendas o supermercados realistas para el área.
Si no tienes datos reales de mapas, simula establecimientos coherentes para la zona, priorizando horarios de atención y variedad de productos.

Idioma de respuesta: {{{language}}}.`,
});

const aiNearbyStoresFlow = ai.defineFlow(
  {
    name: 'aiNearbyStoresFlow',
    inputSchema: NearbyStoresInputSchema,
    outputSchema: NearbyStoresOutputSchema,
  },
  async (input) => {
    const { output } = await storesPrompt(input);
    return output!;
  }
);
