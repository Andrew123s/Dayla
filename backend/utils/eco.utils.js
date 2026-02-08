// Carbon emission factors (kg CO2 per unit)
const CARBON_FACTORS = {
  // Transportation (per km)
  car: 0.12, // Average car
  electricCar: 0.05, // Electric vehicle
  bus: 0.04, // Public bus
  train: 0.03, // Electric train
  plane: 0.25, // Domestic flight per km
  planeLongHaul: 0.15, // Long-haul flight per km

  // Accommodation (per night)
  hotel: 15, // Average hotel
  ecoHotel: 8, // Eco-certified hotel
  airbnb: 10, // Airbnb rental
  camping: 2, // Camping

  // Activities (per person)
  hiking: 0.5, // Low impact
  rockClimbing: 1.2,
  kayaking: 0.8,
  wildlifeTour: 2.0,
  cityTour: 1.5,
  culturalTour: 1.0,

  // Food (per meal)
  localProduce: 1.0,
  importedProduce: 3.0,
  meatBased: 4.0,
  vegetarian: 2.0,
  vegan: 1.5,

  // Waste (per kg)
  plastic: 6.0,
  paper: 2.0,
  organic: 0.5,
};

// Water usage factors (liters per unit)
const WATER_FACTORS = {
  shower: 50, // 5-minute shower
  bath: 80,
  toilet: 6, // per flush
  washingMachine: 50, // per load
  dishwasher: 15, // per load

  // Food production water footprint (liters per kg)
  beef: 15400,
  chicken: 4300,
  pork: 5900,
  rice: 2500,
  wheat: 1300,
  vegetables: 300,
  fruits: 1000,
};

// Calculate transportation carbon footprint
const calculateTransportationFootprint = (transportation) => {
  let totalCO2 = 0;
  let breakdown = {};

  transportation.forEach(item => {
    const { type, distance, passengers = 1 } = item;
    const factor = CARBON_FACTORS[type];

    if (factor && distance) {
      const co2 = (factor * distance) / passengers;
      totalCO2 += co2;
      breakdown[type] = (breakdown[type] || 0) + co2;
    }
  });

  return {
    total: Math.round(totalCO2 * 100) / 100,
    breakdown,
    unit: 'kg CO2'
  };
};

// Calculate accommodation carbon footprint
const calculateAccommodationFootprint = (accommodation, nights) => {
  let totalCO2 = 0;
  let breakdown = {};

  accommodation.forEach(item => {
    const { type, people = 1 } = item;
    const factor = CARBON_FACTORS[type];

    if (factor) {
      const co2 = (factor * nights) / people;
      totalCO2 += co2;
      breakdown[type] = (breakdown[type] || 0) + co2;
    }
  });

  return {
    total: Math.round(totalCO2 * 100) / 100,
    breakdown,
    unit: 'kg CO2'
  };
};

// Calculate activities carbon footprint
const calculateActivitiesFootprint = (activities) => {
  let totalCO2 = 0;
  let breakdown = {};

  activities.forEach(activity => {
    const { type, participants = 1 } = activity;
    const factor = CARBON_FACTORS[type];

    if (factor) {
      const co2 = factor / participants;
      totalCO2 += co2;
      breakdown[type] = (breakdown[type] || 0) + co2;
    }
  });

  return {
    total: Math.round(totalCO2 * 100) / 100,
    breakdown,
    unit: 'kg CO2'
  };
};

// Calculate food carbon footprint
const calculateFoodFootprint = (meals) => {
  let totalCO2 = 0;
  let breakdown = {};

  meals.forEach(meal => {
    const { type, servings = 1 } = meal;
    const factor = CARBON_FACTORS[type];

    if (factor) {
      const co2 = factor * servings;
      totalCO2 += co2;
      breakdown[type] = (breakdown[type] || 0) + co2;
    }
  });

  return {
    total: Math.round(totalCO2 * 100) / 100,
    breakdown,
    unit: 'kg CO2'
  };
};

// Calculate water usage
const calculateWaterUsage = (activities) => {
  let totalWater = 0;
  let breakdown = {};

  activities.forEach(activity => {
    const { type, frequency = 1 } = activity;
    const factor = WATER_FACTORS[type];

    if (factor) {
      const water = factor * frequency;
      totalWater += water;
      breakdown[type] = (breakdown[type] || 0) + water;
    }
  });

  return {
    total: Math.round(totalWater),
    breakdown,
    unit: 'liters'
  };
};

// Calculate eco-score (0-100)
const calculateEcoScore = (tripData) => {
  const {
    transportation,
    accommodation,
    activities,
    meals,
    waste = [],
    duration = 1,
    groupSize = 1
  } = tripData;

  let score = 100; // Start with perfect score
  let factors = {};

  // Transportation impact (-30 points max)
  const transportFootprint = calculateTransportationFootprint(transportation || []);
  const transportScore = Math.max(0, 30 - (transportFootprint.total / groupSize));
  score -= (30 - transportScore);
  factors.transportation = {
    score: Math.round(transportScore),
    footprint: transportFootprint.total
  };

  // Accommodation impact (-20 points max)
  const accommodationFootprint = calculateAccommodationFootprint(accommodation || [], duration);
  const accommodationScore = Math.max(0, 20 - (accommodationFootprint.total / groupSize));
  score -= (20 - accommodationScore);
  factors.accommodation = {
    score: Math.round(accommodationScore),
    footprint: accommodationFootprint.total
  };

  // Activities impact (-15 points max)
  const activitiesFootprint = calculateActivitiesFootprint(activities || []);
  const activitiesScore = Math.max(0, 15 - activitiesFootprint.total);
  score -= (15 - activitiesScore);
  factors.activities = {
    score: Math.round(activitiesScore),
    footprint: activitiesFootprint.total
  };

  // Food impact (-15 points max)
  const foodFootprint = calculateFoodFootprint(meals || []);
  const foodScore = Math.max(0, 15 - (foodFootprint.total / duration));
  score -= (15 - foodScore);
  factors.food = {
    score: Math.round(foodScore),
    footprint: foodFootprint.total
  };

  // Waste impact (-10 points max)
  const wasteFootprint = waste.reduce((total, item) => {
    const factor = CARBON_FACTORS[item.type] || 0;
    return total + (factor * item.amount);
  }, 0);
  const wasteScore = Math.max(0, 10 - wasteFootprint);
  score -= (10 - wasteScore);
  factors.waste = {
    score: Math.round(wasteScore),
    footprint: wasteFootprint
  };

  // Bonus points for eco-friendly choices (+10 points max)
  let bonusPoints = 0;

  // Check for eco-transportation
  const ecoTransport = transportation?.some(t => ['bus', 'train', 'electricCar'].includes(t.type));
  if (ecoTransport) bonusPoints += 3;

  // Check for eco-accommodation
  const ecoAccommodation = accommodation?.some(a => a.type === 'ecoHotel' || a.type === 'camping');
  if (ecoAccommodation) bonusPoints += 3;

  // Check for low-impact activities
  const lowImpactActivities = activities?.filter(a => a.type === 'hiking' || a.type === 'culturalTour').length || 0;
  bonusPoints += Math.min(4, lowImpactActivities);

  score = Math.min(100, score + bonusPoints);

  return {
    score: Math.max(0, Math.round(score)),
    factors,
    grade: getEcoGrade(score),
    recommendations: generateEcoRecommendations(factors, tripData)
  };
};

// Get eco-grade based on score
const getEcoGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

// Generate eco-recommendations
const generateEcoRecommendations = (factors, tripData) => {
  const recommendations = [];

  // Transportation recommendations
  if (factors.transportation.score < 20) {
    recommendations.push('Consider using public transportation, biking, or walking instead of personal vehicles');
  }

  // Accommodation recommendations
  if (factors.accommodation.score < 15) {
    recommendations.push('Choose eco-certified hotels or camping options for lower environmental impact');
  }

  // Activities recommendations
  if (factors.activities.score < 10) {
    recommendations.push('Opt for low-impact activities like hiking or cultural tours instead of motorized adventures');
  }

  // Food recommendations
  if (factors.food.score < 10) {
    recommendations.push('Focus on local, seasonal produce and plant-based meals to reduce food miles');
  }

  // Group size considerations
  if (tripData.groupSize > 4) {
    recommendations.push('Consider carpooling or using group transportation to reduce per-person carbon footprint');
  }

  // Duration considerations
  if (tripData.duration > 14) {
    recommendations.push('For longer trips, consider breaking the journey or using carbon offset programs');
  }

  return recommendations;
};

// Calculate carbon offset cost
const calculateOffsetCost = (carbonFootprint, costPerTonne = 25) => {
  const tonnes = carbonFootprint / 1000;
  return {
    tonnes: Math.round(tonnes * 100) / 100,
    cost: Math.round(tonnes * costPerTonne * 100) / 100,
    costPerTonne,
    currency: 'USD'
  };
};

// Get sustainability badges
const getSustainabilityBadges = (score, achievements) => {
  const badges = [];

  if (score >= 90) {
    badges.push({
      name: 'Carbon Neutral',
      description: 'Your trip has minimal environmental impact',
      icon: 'leaf',
      earned: true
    });
  }

  if (achievements.includes('offset')) {
    badges.push({
      name: 'Offset Champion',
      description: 'You actively offset your carbon footprint',
      icon: 'zap',
      earned: true
    });
  }

  if (achievements.includes('local')) {
    badges.push({
      name: 'Local Hero',
      description: 'You support local communities and businesses',
      icon: 'store',
      earned: true
    });
  }

  if (achievements.includes('zero-waste')) {
    badges.push({
      name: 'Zero Waste',
      description: 'You minimized waste during your trip',
      icon: 'trash',
      earned: true
    });
  }

  return badges;
};

module.exports = {
  calculateTransportationFootprint,
  calculateAccommodationFootprint,
  calculateActivitiesFootprint,
  calculateFoodFootprint,
  calculateWaterUsage,
  calculateEcoScore,
  calculateOffsetCost,
  getSustainabilityBadges,
  CARBON_FACTORS,
  WATER_FACTORS
};