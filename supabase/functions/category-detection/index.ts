import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Type definitions
export type Category = 'medical' | 'education' | 'mission' | 'community' | 'emergency';

interface CategorySuggestion {
  category: Category;
  confidence: number;
  keywords: string[];
}

interface CategoryKeywords {
  [key: string]: string[];
}

const categoryKeywords: CategoryKeywords = {
  medical: ['surgery', 'treatment', 'hospital', 'cancer', 'medical', 'health', 'operation', 'therapy', 'doctor', 'patient', 'disease', 'illness', 'medicine', 'clinic', 'cure', 'rehabilitation'],
  education: ['school', 'tuition', 'university', 'student', 'education', 'scholarship', 'learning', 'study', 'college', 'teacher', 'classroom', 'course', 'degree', 'academic', 'knowledge', 'professor'],
  mission: ['mission', 'church', 'ministry', 'faith', 'bible', 'christian', 'missionary', 'gospel', 'worship', 'religion', 'spiritual', 'prayer', 'congregation', 'belief', 'pastor', 'divine', 'god'],
  community: ['community', 'neighborhood', 'local', 'family', 'support', 'help', 'assistance', 'town', 'city', 'public', 'social', 'residential', 'group', 'collective', 'shared', 'civic'],
  emergency: ['emergency', 'urgent', 'crisis', 'disaster', 'immediate', 'help', 'quick', 'rapid', 'sudden', 'unexpected', 'critical', 'accident', 'unforeseen', 'rescue', 'life-threatening']
};

// Simple tokenizer function
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

function detectCategory(text: string): CategorySuggestion | null {
  if (!text) return null;

  const tokens = tokenize(text);
  
  let maxMatches = 0;
  let suggestedCategory: Category | null = null;
  let matchedKeywords: string[] = [];

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => 
      tokens.some(token => token.includes(keyword))
    );

    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      suggestedCategory = category as Category;
      matchedKeywords = matches;
    }
  });

  if (!suggestedCategory || maxMatches === 0) return null;

  // Calculate confidence based on number of matches
  const confidence = Math.min((maxMatches / 3) * 100, 100);

  return {
    category: suggestedCategory,
    confidence,
    keywords: matchedKeywords
  };
}

serve(async (req) => {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const suggestion = detectCategory(text);
    
    return new Response(
      JSON.stringify(suggestion),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})
