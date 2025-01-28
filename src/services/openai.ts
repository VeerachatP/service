import { OpenAI } from 'openai';
import { config } from '../config/env';

export interface NameGenerationCriteria {
  gender?: 'boy' | 'girl' | 'neutral';
  style?: 'modern' | 'classic' | 'unique';
  origin?: string;
  startsWith?: string;
  count?: number;
  sessionId: string; // Required for tracking
}

export interface GeneratedName {
  name: string;
  meaning?: string;
  origin?: string;
}

export class OpenAIService {
  private openai: OpenAI;
  private readonly DEFAULT_COUNT = 5;
  private readonly MAX_COUNT = 10;

  constructor() {
    if (!config.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
  }

  async generateNames(criteria: NameGenerationCriteria): Promise<GeneratedName[]> {
    try {
      const count = Math.min(criteria.count || this.DEFAULT_COUNT, this.MAX_COUNT);
      const prompt = this.buildPrompt(criteria);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `You are a helpful baby name generator. Respond with a JSON array of objects, 
            each containing 'name', 'meaning', and 'origin' properties. Ensure names are appropriate 
            and culturally sensitive.`
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"names": []}');
      
      if (!Array.isArray(response.names)) {
        throw new Error('Invalid response format from OpenAI');
      }

      return response.names.slice(0, count).map((name: any) => ({
        name: name.name || '',
        meaning: name.meaning || '',
        origin: name.origin || criteria.origin || ''
      }));
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Failed to generate names');
    }
  }

  private buildPrompt({ gender, style, origin, startsWith, count }: NameGenerationCriteria): string {
    const parts = [
      `Generate ${count || this.DEFAULT_COUNT} unique baby names`,
      gender && `for ${gender}s`,
      style && `that are ${style}`,
      origin && `with ${origin} origin`,
      startsWith && `starting with "${startsWith}"`,
    ].filter(Boolean);

    return `${parts.join(' ')}. For each name, provide its meaning and cultural origin. 
      Respond with a JSON object containing a "names" array of objects, each with "name", 
      "meaning", and "origin" properties. Ensure names are culturally appropriate and 
      respectful.`;
  }

  async validateName(name: string): Promise<{
    isAppropriate: boolean;
    reason?: string;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a name validator. Check if the given name is appropriate as a baby name."
        }, {
          role: "user",
          content: `Is "${name}" appropriate as a baby name? Respond with a JSON object containing 
            "isAppropriate" (boolean) and optionally "reason" (string) if inappropriate.`
        }],
        temperature: 0.3,
        max_tokens: 100,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        isAppropriate: response.isAppropriate ?? true,
        reason: response.reason
      };
    } catch (error) {
      console.error('Name validation error:', error);
      return { isAppropriate: true }; // Default to true on error
    }
  }
} 