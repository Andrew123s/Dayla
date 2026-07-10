const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env.config');
const logger = require('../utils/logger');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.googleAI.apiKey);

// ── Evergreen model resolution ───────────────────────────────────────────────
// Google keeps retiring named models for new API keys (1.5-flash, then
// 2.5-flash both 404 with "no longer available to new users"). Chasing names
// is a losing game, so:
//   1. use GEMINI_MODEL when explicitly set,
//   2. otherwise try the evergreen alias gemini-flash-latest,
//   3. on a model-availability error, ask ListModels which generateContent
//      models THIS key can actually use and pick the best flash one.
// The winner is cached for the process lifetime.
let resolvedModelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';

async function discoverModelNames() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(config.googleAI.apiKey)}&pageSize=200`
  );
  if (!res.ok) throw new Error(`ListModels failed (${res.status})`);
  const data = await res.json();
  const usable = (data.models || []).filter((m) =>
    (m.supportedGenerationMethods || []).includes('generateContent')
  );
  const score = (raw) => {
    const n = raw.toLowerCase();
    let s = 0;
    const v = n.match(/gemini-(\d+(?:\.\d+)?)/);
    if (v) s += parseFloat(v[1]) * 100;
    if (n.includes('flash')) s += 30;
    if (n.includes('latest')) s += 20;
    if (n.includes('lite')) s -= 5;
    if (n.includes('preview') || n.includes('exp')) s -= 10;
    if (/tts|image|audio|embed|live|thinking/.test(n)) s -= 1000;
    return s;
  };
  usable.sort((a, b) => score(b.name) - score(a.name));
  if (!usable.length) throw new Error('No Gemini model with generateContent is available for this API key');
  return usable.map((m) => m.name.replace(/^models\//, ''));
}

async function discoverModelName() {
  return (await discoverModelNames())[0];
}

const isModelGoneError = (e) =>
  /404|not found|no longer available|not supported/i.test((e && e.message) || '');

// Per-model capacity spikes ("high demand", 503/429/overloaded) are common
// on the shared endpoints — retry, then fall back to a different model.
const isBusyError = (e) =>
  /503|429|high demand|overloaded|resource.?exhausted|try again later/i.test((e && e.message) || '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Run generateContent resiliently:
 *  - model retired → discover a replacement via ListModels
 *  - model busy    → brief retry, then try the next-best DIFFERENT model
 */
async function generate(prompt) {
  const tryModel = (name) =>
    genAI.getGenerativeModel({ model: name }).generateContent(prompt);

  try {
    return await tryModel(resolvedModelName);
  } catch (first) {
    if (isModelGoneError(first)) {
      logger.warn(`Gemini model "${resolvedModelName}" unavailable — discovering a replacement`);
      const discovered = await discoverModelName();
      logger.info(`Gemini model discovered: ${discovered}`);
      const result = await tryModel(discovered);
      resolvedModelName = discovered; // cache only after success
      return result;
    }
    if (isBusyError(first)) {
      logger.warn(`Gemini "${resolvedModelName}" busy — retrying once`);
      await sleep(2500);
      try {
        return await tryModel(resolvedModelName);
      } catch (second) {
        if (!isBusyError(second) && !isModelGoneError(second)) throw second;
        // Still busy: shift load to a different capable model.
        const alternates = await discoverModelNames();
        const alt = alternates.find((n) => n !== resolvedModelName);
        if (!alt) throw second;
        logger.warn(`Gemini still busy — falling back to "${alt}"`);
        return await tryModel(alt);
      }
    }
    throw first;
  }
}

// Generate trip planning suggestions
const generateTripPlan = async (tripData) => {
  try {
    const {
      destination,
      duration,
      budget,
      interests,
      groupSize,
      accommodation,
      transportation,
      specialRequirements
    } = tripData;

    const prompt = `
You are an expert travel planner for Dayla, an eco-friendly adventure planning app. Create a detailed trip itinerary with the following information:

Destination: ${destination}
Duration: ${duration} days
Budget: ${budget}
Interests: ${interests?.join(', ') || 'General outdoor activities'}
Group Size: ${groupSize} people
Accommodation Preference: ${accommodation || 'Not specified'}
Transportation: ${transportation || 'Not specified'}
Special Requirements: ${specialRequirements || 'None'}

Please provide a comprehensive trip plan including:
1. Daily itinerary with activities
2. Accommodation recommendations
3. Transportation suggestions
4. Budget breakdown
5. Eco-friendly tips
6. Safety considerations
7. Local cuisine recommendations
8. Packing suggestions

Format the response as a JSON object with the following structure:
{
  "overview": "Brief trip overview",
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["Activity 1", "Activity 2"],
      "meals": ["Breakfast", "Lunch", "Dinner"],
      "notes": "Additional notes"
    }
  ],
  "accommodation": {
    "recommendations": ["Option 1", "Option 2"],
    "ecoFriendly": true
  },
  "transportation": {
    "options": ["Option 1", "Option 2"],
    "carbonFootprint": "Estimated CO2 impact"
  },
  "budget": {
    "breakdown": {
      "accommodation": 0,
      "food": 0,
      "activities": 0,
      "transportation": 0,
      "misc": 0
    },
    "total": 0,
    "currency": "USD"
  },
  "ecoTips": ["Tip 1", "Tip 2"],
  "packingList": ["Item 1", "Item 2"],
  "safetyTips": ["Tip 1", "Tip 2"]
}
`;

    const result = await generate(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const tripPlan = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    logger.info(`Trip plan generated for ${destination}`);
    return tripPlan;

  } catch (error) {
    logger.error('Gemini trip planning error:', error);
    throw new Error(`Failed to generate trip plan: ${error.message}`);
  }
};

// Generate activity suggestions based on location and interests
const generateActivitySuggestions = async (location, interests, weather) => {
  try {
    const prompt = `
Based on the location "${location}", interests: ${interests?.join(', ') || 'general outdoor activities'},
and current weather conditions: ${weather || 'not specified'},

Suggest 5-7 eco-friendly activities that would be suitable for this location and time.
Consider seasonal factors, safety, and environmental impact.

Format as JSON:
{
  "activities": [
    {
      "name": "Activity Name",
      "description": "Brief description",
      "duration": "Estimated time",
      "difficulty": "Easy/Medium/Hard",
      "ecoImpact": "Low/Medium/High",
      "bestTime": "Best time to do this",
      "tips": ["Tip 1", "Tip 2"]
    }
  ]
}
`;

    const result = await generate(prompt);
    const response = await result.response;
    const text = response.text();

    const suggestions = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    return suggestions;

  } catch (error) {
    logger.error('Gemini activity suggestions error:', error);
    throw new Error(`Failed to generate activity suggestions: ${error.message}`);
  }
};

// Analyze trip sustainability and provide eco-score
const analyzeSustainability = async (tripData) => {
  try {
    const {
      destination,
      activities,
      transportation,
      accommodation,
      duration,
      groupSize
    } = tripData;

    const prompt = `
Analyze the environmental impact of this trip and provide an eco-score from 0-100:

Destination: ${destination}
Activities: ${activities?.join(', ') || 'Not specified'}
Transportation: ${transportation || 'Not specified'}
Accommodation: ${accommodation || 'Not specified'}
Duration: ${duration} days
Group Size: ${groupSize} people

Consider:
- Carbon footprint from transportation
- Environmental impact of activities
- Sustainability of accommodation
- Local ecosystem preservation
- Waste generation potential

Format as JSON:
{
  "ecoScore": 85,
  "carbonFootprint": {
    "total": 45.2,
    "unit": "kg CO2",
    "breakdown": {
      "transportation": 30.5,
      "accommodation": 8.7,
      "activities": 6.0
    }
  },
  "environmentalImpact": {
    "score": 78,
    "factors": [
      {
        "aspect": "Transportation",
        "impact": "Medium",
        "suggestion": "Consider eco-friendly transport options"
      }
    ]
  },
  "recommendations": [
    "Use public transportation when possible",
    "Choose eco-certified accommodations",
    "Minimize single-use plastics"
  ],
  "offsettingOptions": [
    {
      "type": "Reforestation",
      "costPerTonne": 25,
      "description": "Plant trees in local forests"
    }
  ]
}
`;

    const result = await generate(prompt);
    const response = await result.response;
    const text = response.text();

    const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    return analysis;

  } catch (error) {
    logger.error('Gemini sustainability analysis error:', error);
    throw new Error(`Failed to analyze sustainability: ${error.message}`);
  }
};

// Generate packing list based on destination and activities
const generatePackingList = async (destination, activities, duration, weather) => {
  try {
    const prompt = `
Create a smart packing list for a trip to ${destination} for ${duration} days.
Activities: ${activities?.join(', ') || 'General outdoor activities'}
Weather conditions: ${weather || 'Temperate climate'}

Consider the activities, weather, and create categories of essential items.
Focus on eco-friendly and multi-purpose items where possible.

Format as JSON:
{
  "categories": [
    {
      "name": "Clothing",
      "items": [
        {
          "name": "Waterproof jacket",
          "quantity": 1,
          "essential": true,
          "ecoNote": "Choose recycled materials"
        }
      ]
    },
    {
      "name": "Gear",
      "items": [...]
    }
  ],
  "totalItems": 25,
  "weightEstimate": "8-10 kg",
  "ecoTips": [
    "Pack multi-use items",
    "Choose biodegradable toiletries",
    "Use reusable water bottles"
  ]
}
`;

    const result = await generate(prompt);
    const response = await result.response;
    const text = response.text();

    const packingList = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    return packingList;

  } catch (error) {
    logger.error('Gemini packing list error:', error);
    throw new Error(`Failed to generate packing list: ${error.message}`);
  }
};

// Generate local insights and hidden gems
const generateLocalInsights = async (location) => {
  try {
    const prompt = `
Provide insider knowledge and hidden gems for travelers visiting ${location}.
Focus on authentic experiences, lesser-known spots, and sustainable tourism options.

Include:
- Local culture insights
- Hidden natural spots
- Authentic food experiences
- Sustainable tourism tips
- Best times to visit specific areas
- Local transportation hacks

Format as JSON:
{
  "insights": [
    {
      "category": "Culture",
      "title": "Local Tradition",
      "description": "Detailed description",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "hiddenGems": [
    {
      "name": "Secret Waterfall",
      "description": "Why it's special",
      "howToGetThere": "Directions",
      "bestTime": "When to visit",
      "ecoImpact": "Environmental considerations"
    }
  ],
  "foodExperiences": [
    {
      "dish": "Local Specialty",
      "whereToFind": "Best places",
      "culturalSignificance": "Background",
      "sustainable": true
    }
  ],
  "sustainabilityTips": [
    "Support local businesses",
    "Use public transport",
    "Respect wildlife"
  ]
}
`;

    const result = await generate(prompt);
    const response = await result.response;
    const text = response.text();

    const insights = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    return insights;

  } catch (error) {
    logger.error('Gemini local insights error:', error);
    throw new Error(`Failed to generate local insights: ${error.message}`);
  }
};

// Process natural language trip queries
const processTripQuery = async (query, userContext = {}) => {
  try {
    const contextStr = userContext ? JSON.stringify(userContext) : 'No user context';

    const prompt = `
Process this natural language trip planning query: "${query}"

User context: ${contextStr}

Extract key information and provide structured response including:
- Destination(s)
- Duration
- Budget range
- Activities/interests
- Group size
- Special requirements
- Travel style preferences

Also provide:
- Suggested follow-up questions
- Alternative interpretations if ambiguous
- Recommended next steps

Format as JSON:
{
  "parsedQuery": {
    "destinations": ["Location 1"],
    "duration": "5-7 days",
    "budget": "$2000-3000",
    "activities": ["Hiking", "Photography"],
    "groupSize": 2,
    "requirements": ["Accessible", "Pet-friendly"],
    "travelStyle": "Adventure"
  },
  "confidence": 0.85,
  "followUpQuestions": [
    "What's your preferred accommodation type?",
    "Do you have any dietary restrictions?"
  ],
  "suggestions": [
    "Consider visiting in shoulder season for better rates",
    "Look into guided tours for expert local knowledge"
  ],
  "nextSteps": [
    "Create trip itinerary",
    "Research accommodation options",
    "Check visa requirements"
  ]
}
`;

    const result = await generate(prompt);
    const response = await result.response;
    const text = response.text();

    const processedQuery = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    return processedQuery;

  } catch (error) {
    logger.error('Gemini query processing error:', error);
    throw new Error(`Failed to process trip query: ${error.message}`);
  }
};

module.exports = {
  generateTripPlan,
  generateActivitySuggestions,
  analyzeSustainability,
  generatePackingList,
  generateLocalInsights,
  processTripQuery
};