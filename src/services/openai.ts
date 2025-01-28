import { OpenAI } from 'openai';
import { config } from '../config/env';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

export class OpenAIService {
  async generateNames(criteria: {
    gender?: 'boy' | 'girl' | 'neutral';
    style?: 'modern' | 'classic' | 'unique';
    origin?: string;
    startsWith?: string;
    count?: number;
  }) {
    const prompt = this.buildPrompt(criteria);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a helpful baby name generator. Respond with only the names in a JSON array format."
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 150,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"names": []}');
      return response.names;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate names');
    }
  }

  private buildPrompt(criteria: any): string {
    const { gender, style, origin, startsWith, count = 5 } = criteria;
    
    return `Generate ${count} unique baby ${gender || ''} names that are ${style || 'modern'} 
      ${origin ? `with ${origin} origin` : ''} 
      ${startsWith ? `starting with "${startsWith}"` : ''}.
      Respond with only a JSON object containing an array of names under the "names" key.`;
  }
} 