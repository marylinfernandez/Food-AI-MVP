'use server';
/**
 * @fileOverview Un flujo de Genkit para encontrar tiendas cercanas con disponibilidad de productos y comparación de precios.
 *
 * - aiNearbyStores - Función para obtener tiendas, disponibilidad y precios estimados.
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
  product: z.string().describe('Nombre del producto faltante.'),
  inStock: z.boolean().describe('Si es probable que esté disponible.'),
  estimatedPrice: z.string().describe('Precio estimado en moneda local.'),
});

const StoreSchema = z.object({
  name: z.string(),
  address: z.string(),
  distance: z.string().describe('Distancia aproximada, ej: "500m", "1.2km"'),
  hours: z.string().describe('Horario de atención hoy'),
  isOpen: z.boolean(),
  type: z.string().describe('Categoría: Supermercado, Tienda de Conveniencia, etc.'),
  availability: z.array(ProductInfoSchema).describe('Análisis de stock para los productos faltantes.'),
  totalEstimatedPrice: z.string().describe('Suma total estimada de los productos faltantes en esta tienda.'),
  websiteSearchUrl: z.string().describe('Enlace de búsqueda simulado o real para verificar en la tienda.'),
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
  prompt: `Eres FoodAI Assistant. Ayuda al usuario a encontrar dónde comprar estos ingredientes faltantes: {{{missingIngredients}}}.

Basándote en la ubicación (Lat: {{latitude}}, Lon: {{longitude}}), sugiere 3 tiendas reales o coherentes con la zona.
Para cada tienda:
1. Evalúa si es probable que tengan cada producto (availability).
2. Estima un precio realista para cada producto basándote en el tipo de tienda (ej: un supermercado suele ser más barato que una tienda de conveniencia).
3. Calcula un "Total Estimado".
4. Proporciona una URL de búsqueda (Google Search o sitio de la tienda) para que el usuario verifique.

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
