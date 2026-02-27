
'use server';
/**
 * @fileOverview A Genkit flow for converting recipe text to speech.
 *
 * - aiRecipeAudio - A function that generates audio from recipe text.
 * - RecipeAudioInput - The input type for the aiRecipeAudio function.
 * - RecipeAudioOutput - The return type for the aiRecipeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';
import { Buffer } from 'buffer';

const RecipeAudioInputSchema = z.object({
  text: z.string().describe('The full text of the recipe to be read aloud.'),
  languageCode: z.string().default('es-LA').describe('The language code for the voice response (e.g., "es-LA", "en-US").'),
  voiceName: z.string().default('Algenib').describe('The prebuilt voice name to use.'),
});
export type RecipeAudioInput = z.infer<typeof RecipeAudioInputSchema>;

const RecipeAudioOutputSchema = z.object({
  audioDataUri: z.string().describe('The base64 encoded WAV audio data URI of the generated speech.'),
});
export type RecipeAudioOutput = z.infer<typeof RecipeAudioOutputSchema>;

// Helper function to convert PCM audio buffer to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d: Buffer) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const aiRecipeAudioFlow = ai.defineFlow(
  {
    name: 'aiRecipeAudioFlow',
    inputSchema: RecipeAudioInputSchema,
    outputSchema: RecipeAudioOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: input.voiceName,
            },
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No audio media returned from TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

export async function aiRecipeAudio(input: RecipeAudioInput): Promise<RecipeAudioOutput> {
  return aiRecipeAudioFlow(input);
}
