'use server';
/**
 * @fileOverview A Genkit flow for proactively confirming identified ingredients via a voice interface.
 *
 * - proactiveInventoryConfirmation - A function that generates an audio confirmation of identified ingredients.
 * - ProactiveInventoryConfirmationInput - The input type for the proactiveInventoryConfirmation function.
 * - ProactiveInventoryConfirmationOutput - The return type for the proactiveInventoryConfirmation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as wav from 'wav';
import { Buffer } from 'buffer';

const ProactiveInventoryConfirmationInputSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().describe('The name of the ingredient.'),
      quantity: z.string().describe('The quantity or amount of the ingredient. E.g., "2 units", "half a butter stick".'),
    })
  ).describe('A list of identified ingredients with their names and quantities.'),
  languageCode: z.string().default('en-US').describe('The language code for the voice response (e.g., "es-LA", "en-US").'),
  voiceName: z.string().default('en-US-Standard-J').describe('The specific voice name to use for the response. Refer to Google Cloud Text-to-Speech API documentation for available voices.'),
});
export type ProactiveInventoryConfirmationInput = z.infer<typeof ProactiveInventoryConfirmationInputSchema>;

const ProactiveInventoryConfirmationOutputSchema = z.object({
  audioDataUri: z.string().describe('The base64 encoded WAV audio data URI of the confirmation message.'),
});
export type ProactiveInventoryConfirmationOutput = z.infer<typeof ProactiveInventoryConfirmationOutputSchema>;

export async function proactiveInventoryConfirmation(input: ProactiveInventoryConfirmationInput): Promise<ProactiveInventoryConfirmationOutput> {
  return proactiveInventoryConfirmationFlow(input);
}

const confirmationPrompt = ai.definePrompt({
  name: 'proactiveInventoryConfirmationPrompt',
  input: { schema: ProactiveInventoryConfirmationInputSchema },
  output: { schema: z.object({ confirmationText: z.string() }) },
  prompt: `Hello! I have identified the following items in your pantry and fridge. Please listen carefully and let me know if everything is correct, or if anything needs adjustment.

Here is the list:
{{#each ingredients}}
- {{this.name}}: {{this.quantity}}
{{/each}}

Is this all correct? Please tell me if anything is missing or if the quantities are not right.`,
});

const proactiveInventoryConfirmationFlow = ai.defineFlow(
  {
    name: 'proactiveInventoryConfirmationFlow',
    inputSchema: ProactiveInventoryConfirmationInputSchema,
    outputSchema: ProactiveInventoryConfirmationOutputSchema,
  },
  async (input) => {
    const { output: promptOutput } = await confirmationPrompt(input);
    const confirmationText = promptOutput!.confirmationText;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: input.voiceName,
              languageCode: input.languageCode,
            },
          },
        },
      },
      prompt: confirmationText,
    });

    if (!media) {
      throw new Error('No audio media returned from TTS model.');
    }

    // The TTS model returns PCM audio, convert to WAV.
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
