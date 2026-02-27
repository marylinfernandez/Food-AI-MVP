'use server';
/**
 * @fileOverview A Genkit flow for updating pantry inventory via voice commands.
 *
 * - aiVoiceInventoryUpdate - A function that processes a user's voice command to update inventory.
 * - VoiceInventoryUpdateInput - The input type for the aiVoiceInventoryUpdate function.
 * - VoiceInventoryUpdateOutput - The return type for the aiVoiceInventoryUpdate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InventoryUpdateItemSchema = z.object({
  itemName: z.string().describe('The name of the food item.'),
  quantity: z.string().optional().describe('The quantity of the item, e.g., "half", "2 units", "a little".'),
  action: z.enum(['add', 'remove', 'update']).describe('The action to perform: "add" for new items, "remove" for consumed items, "update" for correcting existing items.'),
  notes: z.string().optional().describe('Any additional notes or context from the user regarding the item (e.g., "half full", "almost finished").'),
});

const VoiceInventoryUpdateInputSchema = z.string().describe('The user\'s voice command for updating pantry inventory.');
export type VoiceInventoryUpdateInput = z.infer<typeof VoiceInventoryUpdateInputSchema>;

const VoiceInventoryUpdateOutputSchema = z.array(InventoryUpdateItemSchema).describe('A list of inventory updates extracted from the user\'s voice command.');
export type VoiceInventoryUpdateOutput = z.infer<typeof VoiceInventoryUpdateOutputSchema>;

export async function aiVoiceInventoryUpdate(input: VoiceInventoryUpdateInput): Promise<VoiceInventoryUpdateOutput> {
  return aiVoiceInventoryUpdateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceInventoryUpdatePrompt',
  input: { schema: VoiceInventoryUpdateInputSchema },
  output: { schema: VoiceInventoryUpdateOutputSchema },
  prompt: `You are an AI assistant designed to parse natural language voice commands into structured inventory updates.
The user will provide a command describing changes to their food pantry inventory.
Your task is to extract all mentioned food items, determine the intended action (add, remove, or update), and any associated quantities or notes.

Possible actions:
- "add": When the user mentions buying new items or adding them to the pantry.
- "remove": When the user mentions consuming, finishing, or getting rid of items.
- "update": When the user mentions a change in the state or quantity of an existing item (e.g., "butter is half left").

Quantities can be approximate or specific. If specific, try to capture the unit. If approximate, describe it as stated.
If an item is fully consumed, the quantity can be "all" or omitted if the action is "remove".

Example commands and expected outputs:
Command: "I used all the milk."
Output: [ { "itemName": "milk", "quantity": "all", "action": "remove" } ]

Command: "I bought two apples and a new loaf of bread."
Output: [ { "itemName": "apples", "quantity": "2 units", "action": "add" }, { "itemName": "bread", "quantity": "1 loaf", "action": "add" } ]

Command: "The butter is only half left."
Output: [ { "itemName": "butter", "quantity": "half", "action": "update", "notes": "half left" } ]

Command: "Remove the eggs, I ate them all."
Output: [ { "itemName": "eggs", "quantity": "all", "action": "remove" } ]

Command: "I've consumed half a packet of cheese."
Output: [ { "itemName": "cheese", "quantity": "half a packet", "action": "remove" } ]

Command: "Add a bottle of olive oil."
Output: [ { "itemName": "olive oil", "quantity": "1 bottle", "action": "add" } ]

Command: "Update the lettuce, it's almost gone."
Output: [ { "itemName": "lettuce", "quantity": "almost gone", "action": "update" } ]

Now, process the following command and return a JSON array of inventory updates.

Command: {{{this}}}`,
});

const aiVoiceInventoryUpdateFlow = ai.defineFlow(
  {
    name: 'aiVoiceInventoryUpdateFlow',
    inputSchema: VoiceInventoryUpdateInputSchema,
    outputSchema: VoiceInventoryUpdateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
