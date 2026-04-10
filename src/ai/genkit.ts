import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Configuración central de Genkit utilizando Gemini 2.5 Flash Lite para alto rendimiento y visión multimodal avanzada.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.5-flash-lite'),
});

export { z } from 'genkit';
