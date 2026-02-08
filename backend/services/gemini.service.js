const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env.config');
const logger = require('../utils/logger');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.googleAI.apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
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

    const result = await model.generateContent(prompt);
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

    const result = await model.generateContent(prompt);
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

    const result = await model.generateContent(prompt);
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

    const result = await model.generateContent(prompt);
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

    const result = await model.generateContent(prompt);
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