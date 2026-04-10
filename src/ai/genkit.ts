import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuración central de Genkit utilizando Gemini 2.5 Flash para alto rendimiento.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-3-flash',
});
