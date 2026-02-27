'use server';

/**
 * @fileOverview A Genkit flow for an AI-guided voice conversation to gather user profile data.
 *
 * - aiGuidedProfileCreation - A function that handles a single turn of the profile creation conversation.
 * - ProfileConversationInput - The input type for the aiGuidedProfileCreation function.
 * - ProfileConversationOutput - The return type for the aiGuidedProfileCreation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/google-genai';

// --- Schemas ---

const UserProfileSchema = z.object({
  numberOfPeople: z.number().optional().describe('Number of people in the household.'),
  ages: z.array(z.number()).optional().describe('Ages of the people in the household.'),
  allergies: z.array(z.string()).optional().describe('List of food allergies.'),
  dietaryPreferences: z.array(z.string()).optional().describe('List of dietary preferences (e.g., vegetarian, vegan, gluten-free).'),
  tastePreferences: z.array(z.string()).optional().describe('List of taste preferences (e.g., spicy, sweet, savory, dislikes fish).'),
  hasOven: z.boolean().optional().describe('Whether the household has an oven.'),
  hasMicrowave: z.boolean().optional().describe('Whether the household has a microwave.'),
  hasAirFryer: z.boolean().optional().describe('Whether the household has an air fryer.'),
}).describe('Current state of the user profile being collected.');

export type UserProfile = z.infer<typeof UserProfileSchema>;

const ProfileConversationInputSchema = z.object({
  currentProfile: UserProfileSchema.describe('The current, partially collected user profile data.'),
  latestUserInput: z.string().optional().nullable().describe('The user\u0027s latest verbal input, transcribed to text.'),
  conversationHistory: z.array(z.object({
    speaker: z.enum(['user', 'ai']),
    text: z.string(),
  })).optional().describe('History of the conversation so far.'),
}).describe('Input for a single turn of the AI-guided profile creation conversation.');

export type ProfileConversationInput = z.infer<typeof ProfileConversationInputSchema>;

const ProfileConversationOutputSchema = z.object({
  aiResponseText: z.string().describe('The AI\u0027s verbal response text.'),
  aiResponseAudio: z.string().describe('The AI\u0027s verbal response as a WAV audio data URI.'),
  updatedProfile: UserProfileSchema.describe('The updated user profile data after processing the latest input.'),
  isConversationComplete: z.boolean().describe('True if all essential profile data has been collected.'),
}).describe('Output for a single turn of the AI-guided profile creation conversation.');

export type ProfileConversationOutput = z.infer<typeof ProfileConversationOutputSchema>;

// --- Helper for TTS audio conversion ---
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

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

// --- Prompt Definition ---
const profileConversationPrompt = ai.definePrompt({
  name: 'profileConversationPrompt',
  input: { schema: ProfileConversationInputSchema },
  output: { schema: ProfileConversationOutputSchema },
  prompt: `You are PantryPal AI, a friendly and helpful assistant designed to gather user profile information for personalized recipe suggestions.
Your goal is to have a natural voice conversation with the user to collect the following details, asking one or two questions at a time:
- Number of people in the household.
- Ages of the people.
- Any food allergies.
- Any specific dietary preferences (e.g., vegetarian, vegan, gluten-free).
- Any taste preferences or dislikes (e.g., likes spicy, dislikes fish).
- Available cooking appliances (e.g., oven, microwave, air fryer).

Always extract and update the 'updatedProfile' object with any new information provided by the user.
Determine the next logical question to ask based on what information is still missing from the 'currentProfile'.
Ensure the conversation feels proactive and conversational, avoiding direct questions if information can be inferred or if you've just asked something similar.

The conversation is complete when you have gathered:
- 'numberOfPeople'
- At least one item in 'allergies', 'dietaryPreferences', or 'tastePreferences'
- At least one appliance (e.g., 'hasOven', 'hasMicrowave', 'hasAirFryer')

If the conversation is complete, set 'isConversationComplete' to true and conclude the conversation by expressing excitement about providing personalized recipes.
Otherwise, set 'isConversationComplete' to false.

Current Profile Data:
{{{json currentProfile}}}

Conversation History:
{{#each conversationHistory}}
  {{this.speaker}}: {{this.text}}
{{/each}}

User's Latest Input: "{{{latestUserInput}}}"

Please provide your response in a JSON object that matches the following schema:
{{json (output.schema)}}
`,
});

// --- Flow Definition ---
const aiGuidedProfileCreationFlow = ai.defineFlow(
  {
    name: 'aiGuidedProfileCreationFlow',
    inputSchema: ProfileConversationInputSchema,
    outputSchema: ProfileConversationOutputSchema,
  },
  async (input) => {
    // Call the prompt to get the AI's response text and updated profile data
    const { output } = await profileConversationPrompt(input);

    if (!output) {
      throw new Error('No output received from the prompt.');
    }

    const aiResponseText = output.aiResponseText;

    // Generate audio from the AI's response text
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // Using a default voice, could be configurable
          },
        },
      },
      prompt: aiResponseText,
    });

    if (!media) {
      throw new Error('No audio media returned from TTS.');
    }

    // Convert PCM audio buffer to WAV format
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const aiResponseAudioWav = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      aiResponseText: aiResponseText,
      aiResponseAudio: aiResponseAudioWav,
      updatedProfile: output.updatedProfile,
      isConversationComplete: output.isConversationComplete,
    };
  }
);

export async function aiGuidedProfileCreation(input: ProfileConversationInput): Promise<ProfileConversationOutput> {
  return aiGuidedProfileCreationFlow(input);
}
