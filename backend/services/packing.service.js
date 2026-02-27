const logger = require('../utils/logger');
const PackingHistory = require('../models/packing-history.model');
const PackingTemplate = require('../models/packing-template.model');

// ═══════════════════════════════════════════════════════════════════════
// ITEM WEIGHT/VOLUME DATABASE  (grams / cm³)
// ═══════════════════════════════════════════════════════════════════════
const ITEM_SPECS = {
  // Clothing
  't-shirt':        { w: 200, v: 800, cat: 'clothing' },
  'long-sleeve shirt': { w: 250, v: 1000, cat: 'clothing' },
  'jeans':          { w: 800, v: 2500, cat: 'clothing' },
  'shorts':         { w: 300, v: 800, cat: 'clothing' },
  'dress':          { w: 350, v: 1200, cat: 'clothing' },
  'formal shirt':   { w: 250, v: 1000, cat: 'clothing' },
  'formal trousers':{ w: 600, v: 2000, cat: 'clothing' },
  'suit jacket':    { w: 900, v: 4000, cat: 'clothing' },
  'skirt':          { w: 250, v: 800, cat: 'clothing' },
  'underwear':      { w: 50, v: 100, cat: 'clothing' },
  'socks':          { w: 40, v: 80, cat: 'clothing' },
  'pajamas':        { w: 300, v: 1000, cat: 'clothing' },
  'swimsuit':       { w: 150, v: 300, cat: 'clothing' },
  'light jacket':   { w: 400, v: 2000, cat: 'clothing' },
  'heavy jacket':   { w: 1200, v: 5000, cat: 'clothing' },
  'raincoat':       { w: 500, v: 1500, cat: 'weather_essentials' },
  'sweater':        { w: 500, v: 2000, cat: 'clothing' },
  'hoodie':         { w: 600, v: 2500, cat: 'clothing' },
  'scarf':          { w: 150, v: 500, cat: 'accessories' },
  'gloves':         { w: 100, v: 300, cat: 'accessories' },
  'beanie':         { w: 80, v: 200, cat: 'accessories' },
  'thermal base layer': { w: 200, v: 600, cat: 'clothing' },

  // Footwear
  'sneakers':       { w: 700, v: 4000, cat: 'footwear' },
  'hiking boots':   { w: 1200, v: 6000, cat: 'footwear' },
  'sandals':        { w: 300, v: 1500, cat: 'footwear' },
  'formal shoes':   { w: 800, v: 4500, cat: 'footwear' },
  'flip flops':     { w: 200, v: 1000, cat: 'footwear' },
  'water shoes':    { w: 250, v: 1200, cat: 'footwear' },

  // Toiletries
  'toothbrush':     { w: 20, v: 30, cat: 'toiletries' },
  'toothpaste':     { w: 100, v: 80, cat: 'toiletries' },
  'shampoo':        { w: 250, v: 250, cat: 'toiletries' },
  'conditioner':    { w: 250, v: 250, cat: 'toiletries' },
  'body wash':      { w: 250, v: 250, cat: 'toiletries' },
  'deodorant':      { w: 80, v: 120, cat: 'toiletries' },
  'sunscreen':      { w: 200, v: 200, cat: 'toiletries' },
  'insect repellent': { w: 150, v: 150, cat: 'toiletries' },
  'lip balm':       { w: 15, v: 15, cat: 'toiletries' },
  'razor':          { w: 50, v: 40, cat: 'toiletries' },
  'hairbrush':      { w: 80, v: 200, cat: 'toiletries' },
  'hand sanitizer': { w: 60, v: 60, cat: 'toiletries' },

  // Electronics
  'phone charger':  { w: 80, v: 100, cat: 'electronics' },
  'laptop':         { w: 1500, v: 5000, cat: 'electronics' },
  'laptop charger': { w: 350, v: 400, cat: 'electronics' },
  'camera':         { w: 500, v: 1500, cat: 'electronics' },
  'power bank':     { w: 300, v: 200, cat: 'electronics' },
  'headphones':     { w: 250, v: 800, cat: 'electronics' },
  'universal adapter': { w: 150, v: 200, cat: 'electronics' },
  'e-reader':       { w: 200, v: 400, cat: 'electronics' },

  // Documents
  'passport':       { w: 50, v: 50, cat: 'documents' },
  'travel insurance docs': { w: 10, v: 10, cat: 'documents' },
  'boarding passes': { w: 5, v: 5, cat: 'documents' },
  'hotel confirmations': { w: 5, v: 5, cat: 'documents' },
  'visa documents': { w: 10, v: 10, cat: 'documents' },
  'copies of ID':   { w: 10, v: 10, cat: 'documents' },

  // Medicine / First Aid
  'first aid kit':  { w: 300, v: 600, cat: 'medicine' },
  'prescription meds': { w: 100, v: 100, cat: 'medicine' },
  'pain relievers': { w: 30, v: 30, cat: 'medicine' },
  'allergy medicine': { w: 30, v: 30, cat: 'medicine' },
  'motion sickness pills': { w: 20, v: 20, cat: 'medicine' },
  'band-aids':      { w: 20, v: 30, cat: 'medicine' },
  'anti-diarrhea tablets': { w: 20, v: 20, cat: 'medicine' },

  // Gear
  'backpack (day)': { w: 600, v: 3000, cat: 'gear' },
  'sleeping bag':   { w: 1500, v: 8000, cat: 'gear' },
  'tent':           { w: 2500, v: 12000, cat: 'gear' },
  'trekking poles': { w: 500, v: 2000, cat: 'gear' },
  'water bottle':   { w: 200, v: 500, cat: 'gear' },
  'headlamp':       { w: 80, v: 150, cat: 'gear' },
  'compass':        { w: 50, v: 50, cat: 'gear' },
  'multi-tool':     { w: 150, v: 100, cat: 'gear' },
  'dry bags':       { w: 100, v: 200, cat: 'gear' },
  'travel towel':   { w: 150, v: 400, cat: 'gear' },
  'binoculars':     { w: 400, v: 1000, cat: 'gear' },
  'snorkel set':    { w: 500, v: 2000, cat: 'gear' },

  // Safety
  'travel lock':    { w: 60, v: 50, cat: 'safety' },
  'money belt':     { w: 80, v: 100, cat: 'safety' },
  'whistle':        { w: 15, v: 10, cat: 'safety' },
  'flashlight':     { w: 120, v: 200, cat: 'safety' },

  // Accessories
  'sunglasses':     { w: 30, v: 200, cat: 'accessories' },
  'hat':            { w: 100, v: 500, cat: 'accessories' },
  'umbrella':       { w: 350, v: 800, cat: 'weather_essentials' },
  'travel pillow':  { w: 200, v: 1500, cat: 'accessories' },
  'eye mask':       { w: 20, v: 30, cat: 'accessories' },
  'earplugs':       { w: 5, v: 5, cat: 'accessories' },
  'laundry bag':    { w: 50, v: 200, cat: 'accessories' },
  'packing cubes':  { w: 100, v: 300, cat: 'accessories' },
  'reusable bags':  { w: 30, v: 50, cat: 'accessories' },
};

function getItemSpec(name) {
  const key = name.toLowerCase().trim();
  return ITEM_SPECS[key] || { w: 100, v: 200, cat: 'other' };
}

// ═══════════════════════════════════════════════════════════════════════
// A. WEATHER-BASED ESSENTIALS
// ═══════════════════════════════════════════════════════════════════════
function generateWeatherItems(weatherData) {
  const items = [];
  if (!weatherData || !weatherData.forecast) return items;

  const conditions = new Set();
  let minTemp = 100, maxTemp = -100, totalRain = 0;

  weatherData.forecast.forEach(day => {
    conditions.add(day.condition);
    if (day.mintemp_c < minTemp) minTemp = day.mintemp_c;
    if (day.maxtemp_c > maxTemp) maxTemp = day.maxtemp_c;
    if (day.chance_of_rain > 40) totalRain++;
  });

  const avgTemp = (minTemp + maxTemp) / 2;

  // Temperature-based
  if (maxTemp > 30) {
    items.push({ name: 'Sunscreen', category: 'toiletries', isEssential: true, source: 'weather' });
    items.push({ name: 'Sunglasses', category: 'accessories', isEssential: true, source: 'weather' });
    items.push({ name: 'Hat', category: 'accessories', isEssential: false, source: 'weather' });
    items.push({ name: 'Water Bottle', category: 'gear', isEssential: true, source: 'weather' });
    items.push({ name: 'Lip Balm', category: 'toiletries', isEssential: false, source: 'weather' });
  }
  if (minTemp < 15) {
    items.push({ name: 'Sweater', category: 'clothing', isEssential: true, source: 'weather' });
    items.push({ name: 'Light Jacket', category: 'clothing', isEssential: true, source: 'weather' });
  }
  if (minTemp < 5) {
    items.push({ name: 'Heavy Jacket', category: 'clothing', isEssential: true, source: 'weather' });
    items.push({ name: 'Thermal Base Layer', category: 'clothing', isEssential: true, source: 'weather' });
    items.push({ name: 'Gloves', category: 'accessories', isEssential: true, source: 'weather' });
    items.push({ name: 'Beanie', category: 'accessories', isEssential: true, source: 'weather' });
    items.push({ name: 'Scarf', category: 'accessories', isEssential: false, source: 'weather' });
  }

  // Rain
  if (totalRain >= 1 || conditions.has('Rainy') || conditions.has('Stormy')) {
    items.push({ name: 'Raincoat', category: 'weather_essentials', isEssential: true, source: 'weather' });
    items.push({ name: 'Umbrella', category: 'weather_essentials', isEssential: true, source: 'weather' });
    items.push({ name: 'Dry Bags', category: 'gear', isEssential: false, source: 'weather' });
  }

  // Wind
  if (conditions.has('Windy')) {
    items.push({ name: 'Light Jacket', category: 'clothing', isEssential: true, source: 'weather' });
  }

  // UV
  if (weatherData.current && weatherData.current.uv >= 6) {
    // High UV — ensure sunscreen is present
    if (!items.find(i => i.name === 'Sunscreen')) {
      items.push({ name: 'Sunscreen', category: 'toiletries', isEssential: true, source: 'weather' });
    }
  }

  return items;
}

// ═══════════════════════════════════════════════════════════════════════
// B. ACTIVITY-SPECIFIC GEAR (predefined rule sets)
// ═══════════════════════════════════════════════════════════════════════
const ACTIVITY_GEAR = {
  hiking: [
    { name: 'Hiking Boots', category: 'footwear', isEssential: true },
    { name: 'Backpack (Day)', category: 'gear', isEssential: true },
    { name: 'Water Bottle', category: 'gear', isEssential: true },
    { name: 'Trekking Poles', category: 'gear', isEssential: false },
    { name: 'Headlamp', category: 'gear', isEssential: true },
    { name: 'First Aid Kit', category: 'medicine', isEssential: true },
    { name: 'Compass', category: 'gear', isEssential: false },
    { name: 'Multi-Tool', category: 'gear', isEssential: false },
    { name: 'Insect Repellent', category: 'toiletries', isEssential: true },
    { name: 'Whistle', category: 'safety', isEssential: true },
  ],
  camping: [
    { name: 'Tent', category: 'gear', isEssential: true },
    { name: 'Sleeping Bag', category: 'gear', isEssential: true },
    { name: 'Headlamp', category: 'gear', isEssential: true },
    { name: 'Multi-Tool', category: 'gear', isEssential: true },
    { name: 'Water Bottle', category: 'gear', isEssential: true },
    { name: 'First Aid Kit', category: 'medicine', isEssential: true },
    { name: 'Insect Repellent', category: 'toiletries', isEssential: true },
    { name: 'Flashlight', category: 'safety', isEssential: true },
    { name: 'Travel Towel', category: 'gear', isEssential: false },
    { name: 'Dry Bags', category: 'gear', isEssential: false },
  ],
  beach: [
    { name: 'Swimsuit', category: 'clothing', isEssential: true },
    { name: 'Sunscreen', category: 'toiletries', isEssential: true },
    { name: 'Sunglasses', category: 'accessories', isEssential: true },
    { name: 'Hat', category: 'accessories', isEssential: true },
    { name: 'Flip Flops', category: 'footwear', isEssential: true },
    { name: 'Snorkel Set', category: 'gear', isEssential: false },
    { name: 'Travel Towel', category: 'gear', isEssential: true },
    { name: 'Water Shoes', category: 'footwear', isEssential: false },
  ],
  business: [
    { name: 'Formal Shirt', category: 'clothing', isEssential: true },
    { name: 'Formal Trousers', category: 'clothing', isEssential: true },
    { name: 'Suit Jacket', category: 'clothing', isEssential: false },
    { name: 'Formal Shoes', category: 'footwear', isEssential: true },
    { name: 'Laptop', category: 'electronics', isEssential: true },
    { name: 'Laptop Charger', category: 'electronics', isEssential: true },
    { name: 'Phone Charger', category: 'electronics', isEssential: true },
    { name: 'Travel Lock', category: 'safety', isEssential: false },
    { name: 'Universal Adapter', category: 'electronics', isEssential: true },
  ],
  exploring: [
    { name: 'Sneakers', category: 'footwear', isEssential: true },
    { name: 'Backpack (Day)', category: 'gear', isEssential: true },
    { name: 'Camera', category: 'electronics', isEssential: false },
    { name: 'Power Bank', category: 'electronics', isEssential: true },
    { name: 'Water Bottle', category: 'gear', isEssential: true },
    { name: 'Sunglasses', category: 'accessories', isEssential: false },
    { name: 'Reusable Bags', category: 'accessories', isEssential: false },
  ],
  cultural: [
    { name: 'Sneakers', category: 'footwear', isEssential: true },
    { name: 'Camera', category: 'electronics', isEssential: false },
    { name: 'E-Reader', category: 'electronics', isEssential: false },
    { name: 'Power Bank', category: 'electronics', isEssential: true },
    { name: 'Backpack (Day)', category: 'gear', isEssential: true },
  ],
  road_trip: [
    { name: 'Snacks', category: 'food', isEssential: false },
    { name: 'Water Bottle', category: 'gear', isEssential: true },
    { name: 'Phone Charger', category: 'electronics', isEssential: true },
    { name: 'Sunglasses', category: 'accessories', isEssential: true },
    { name: 'Travel Pillow', category: 'accessories', isEssential: false },
    { name: 'Headphones', category: 'electronics', isEssential: false },
    { name: 'First Aid Kit', category: 'medicine', isEssential: true },
  ],
  family: [
    { name: 'First Aid Kit', category: 'medicine', isEssential: true },
    { name: 'Hand Sanitizer', category: 'toiletries', isEssential: true },
    { name: 'Pain Relievers', category: 'medicine', isEssential: true },
    { name: 'Band-Aids', category: 'medicine', isEssential: true },
    { name: 'Snacks', category: 'food', isEssential: false },
    { name: 'Power Bank', category: 'electronics', isEssential: true },
  ],
};

function generateActivityItems(activities) {
  const items = [];
  if (!activities || !activities.length) return items;

  activities.forEach(activity => {
    const gear = ACTIVITY_GEAR[activity.toLowerCase()];
    if (gear) {
      gear.forEach(g => items.push({ ...g, source: 'activity' }));
    }
  });
  return items;
}

// ═══════════════════════════════════════════════════════════════════════
// C. DURATION-BASED CLOTHING CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════
function generateDurationItems(days) {
  if (!days || days < 1) days = 3;

  // Rule: wash clothes every 3 days (or not at all for short trips)
  const washCycles = Math.max(1, Math.floor(days / 3));
  const clothingSets = Math.min(days, 3 * washCycles); // cap at wash-cycle logic

  const tShirts = Math.min(days, Math.ceil(days / washCycles));
  const underwear = days; // one per day
  const socks = days;
  const bottoms = Math.min(Math.ceil(days / 2), 4);
  const pajamas = 1;

  const items = [
    { name: 'T-Shirt', category: 'clothing', quantity: tShirts, source: 'duration' },
    { name: 'Underwear', category: 'clothing', quantity: underwear, source: 'duration' },
    { name: 'Socks', category: 'clothing', quantity: socks, source: 'duration' },
    { name: 'Jeans', category: 'clothing', quantity: Math.min(bottoms, 3), source: 'duration' },
    { name: 'Shorts', category: 'clothing', quantity: Math.max(1, Math.ceil(bottoms / 2)), source: 'duration' },
    { name: 'Pajamas', category: 'clothing', quantity: pajamas, source: 'duration' },
  ];

  // Universal essentials
  items.push(
    { name: 'Toothbrush', category: 'toiletries', quantity: 1, isEssential: true, source: 'duration' },
    { name: 'Toothpaste', category: 'toiletries', quantity: 1, isEssential: true, source: 'duration' },
    { name: 'Shampoo', category: 'toiletries', quantity: 1, source: 'duration' },
    { name: 'Body Wash', category: 'toiletries', quantity: 1, source: 'duration' },
    { name: 'Deodorant', category: 'toiletries', quantity: 1, isEssential: true, source: 'duration' },
    { name: 'Phone Charger', category: 'electronics', quantity: 1, isEssential: true, source: 'duration' },
    { name: 'Power Bank', category: 'electronics', quantity: 1, source: 'duration' },
    { name: 'Passport', category: 'documents', quantity: 1, isEssential: true, source: 'duration' },
    { name: 'Travel Insurance Docs', category: 'documents', quantity: 1, isEssential: true, source: 'duration' },
    { name: 'Copies of ID', category: 'documents', quantity: 1, isEssential: true, source: 'duration' },
  );

  // Longer trips = laundry bag
  if (days > 4) {
    items.push({ name: 'Laundry Bag', category: 'accessories', quantity: 1, source: 'duration' });
  }
  if (days > 6) {
    items.push({ name: 'Packing Cubes', category: 'accessories', quantity: 1, source: 'duration' });
  }

  return items;
}

// ═══════════════════════════════════════════════════════════════════════
// D. CULTURAL APPROPRIATENESS RULES
// ═══════════════════════════════════════════════════════════════════════
const CULTURAL_RULES = {
  // Middle East
  SA: { name: 'Saudi Arabia', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }, { name: 'Scarf', cat: 'accessories' }], notes: 'Cover shoulders and knees. Women should carry a headscarf.' },
  AE: { name: 'UAE', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }], notes: 'Dress modestly in malls and public areas.' },
  IR: { name: 'Iran', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }, { name: 'Scarf', cat: 'accessories' }], notes: 'Women must wear a headscarf. Loose-fitting clothes required.' },
  QA: { name: 'Qatar', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }], notes: 'Modest dress expected in public.' },
  // South-East Asia (temples)
  TH: { name: 'Thailand', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }, { name: 'Scarf', cat: 'accessories' }], notes: 'Cover shoulders and knees when visiting temples.' },
  KH: { name: 'Cambodia', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }], notes: 'Cover shoulders and knees at Angkor Wat and temples.' },
  MM: { name: 'Myanmar', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }], notes: 'Remove shoes at pagodas. Dress modestly.' },
  // Japan
  JP: { name: 'Japan', items: [], notes: 'Remove shoes indoors. Carry a small towel (tenugui).' },
  // India
  IN: { name: 'India', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }, { name: 'Scarf', cat: 'accessories' }], notes: 'Cover shoulders at religious sites. Remove shoes at temples.' },
  // Vatican / Italy churches
  VA: { name: 'Vatican City', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }, { name: 'Scarf', cat: 'accessories' }], notes: 'Cover shoulders and knees to enter St. Peter\'s Basilica.' },
  IT: { name: 'Italy', items: [{ name: 'Scarf', cat: 'accessories' }], notes: 'Cover shoulders and knees to visit churches.' },
  // Default for East Africa
  ET: { name: 'Ethiopia', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }], notes: 'Dress modestly, especially at churches.' },
  // Morocco
  MA: { name: 'Morocco', items: [{ name: 'Long-Sleeve Shirt', cat: 'clothing' }, { name: 'Scarf', cat: 'accessories' }], notes: 'Modest dress recommended. Cover shoulders in the medina.' },
};

function generateCulturalItems(countryCode) {
  if (!countryCode) return { items: [], notes: '' };
  const rule = CULTURAL_RULES[countryCode.toUpperCase()];
  if (!rule) return { items: [], notes: '' };

  const items = rule.items.map(i => ({
    name: i.name,
    category: i.cat,
    quantity: 1,
    isEssential: true,
    source: 'cultural',
  }));
  return { items, notes: rule.notes };
}

// ═══════════════════════════════════════════════════════════════════════
// E. AIRLINE RESTRICTION DATABASE
// ═══════════════════════════════════════════════════════════════════════
const AIRLINE_RULES = {
  default:        { carryOnKg: 7, checkedKg: 23, carryOnDim: { l: 56, w: 36, h: 23 }, checkedCount: 1 },
  'emirates':     { carryOnKg: 7, checkedKg: 30, carryOnDim: { l: 55, w: 38, h: 20 }, checkedCount: 2 },
  'qatar airways':{ carryOnKg: 7, checkedKg: 30, carryOnDim: { l: 50, w: 37, h: 25 }, checkedCount: 2 },
  'delta':        { carryOnKg: 10, checkedKg: 23, carryOnDim: { l: 56, w: 35, h: 23 }, checkedCount: 1 },
  'united':       { carryOnKg: 10, checkedKg: 23, carryOnDim: { l: 56, w: 35, h: 22 }, checkedCount: 1 },
  'british airways': { carryOnKg: 23, checkedKg: 23, carryOnDim: { l: 56, w: 45, h: 25 }, checkedCount: 1 },
  'ryanair':      { carryOnKg: 10, checkedKg: 20, carryOnDim: { l: 55, w: 40, h: 20 }, checkedCount: 1 },
  'easyjet':      { carryOnKg: 15, checkedKg: 23, carryOnDim: { l: 56, w: 45, h: 25 }, checkedCount: 1 },
  'lufthansa':    { carryOnKg: 8, checkedKg: 23, carryOnDim: { l: 55, w: 40, h: 23 }, checkedCount: 1 },
  'air france':   { carryOnKg: 12, checkedKg: 23, carryOnDim: { l: 55, w: 35, h: 25 }, checkedCount: 1 },
  'ethiopian airlines': { carryOnKg: 7, checkedKg: 23, carryOnDim: { l: 55, w: 35, h: 23 }, checkedCount: 2 },
  'kenya airways':{ carryOnKg: 7, checkedKg: 23, carryOnDim: { l: 55, w: 35, h: 25 }, checkedCount: 1 },
  'south african airways': { carryOnKg: 8, checkedKg: 23, carryOnDim: { l: 56, w: 36, h: 23 }, checkedCount: 1 },
  'turkish airlines': { carryOnKg: 8, checkedKg: 23, carryOnDim: { l: 55, w: 40, h: 23 }, checkedCount: 1 },
  'singapore airlines': { carryOnKg: 7, checkedKg: 30, carryOnDim: { l: 55, w: 35, h: 25 }, checkedCount: 2 },
};

const PROHIBITED_ITEMS = [
  'sharp objects', 'flammable liquids', 'fireworks', 'guns', 'ammunition',
  'tear gas', 'large batteries (over 160Wh)', 'e-cigarettes in checked bags',
];

function getAirlineRestrictions(airline) {
  if (!airline) return { ...AIRLINE_RULES.default, prohibitedItems: PROHIBITED_ITEMS };
  const key = airline.toLowerCase().trim();
  const rules = AIRLINE_RULES[key] || AIRLINE_RULES.default;
  return {
    airline: airline,
    carryOnWeight: rules.carryOnKg * 1000, // to grams
    carryOnDimensions: rules.carryOnDim,
    checkedWeight: rules.checkedKg * 1000,
    checkedCount: rules.checkedCount,
    prohibitedItems: PROHIBITED_ITEMS,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// F. PACKING EFFICIENCY SUGGESTIONS (heuristic-based)
// ═══════════════════════════════════════════════════════════════════════
function getEfficiencySuggestions(packingList) {
  const suggestions = [];
  const items = packingList.items || [];

  // 1. Too many items
  if (items.length > 40) {
    suggestions.push({
      type: 'warning',
      message: `You have ${items.length} items — consider trimming to essentials to avoid overpacking.`,
    });
  }

  // 2. Heavy weight
  const totalWeight = items.reduce((s, i) => s + ((i.weight || 0) * (i.quantity || 1)), 0);
  if (totalWeight > 20000) {
    suggestions.push({
      type: 'warning',
      message: `Total weight is ${(totalWeight / 1000).toFixed(1)} kg — many airlines limit checked bags to 23 kg.`,
    });
  }

  // 3. Duplicate categories
  const catCounts = {};
  items.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + (i.quantity || 1); });
  if (catCounts.clothing > 15) {
    suggestions.push({ type: 'tip', message: 'You have many clothing items. Consider versatile pieces that mix and match.' });
  }
  if (catCounts.electronics > 6) {
    suggestions.push({ type: 'tip', message: 'Many electronics — make sure you have enough chargers and adapters.' });
  }

  // 4. Missing essentials check
  const names = new Set(items.map(i => i.name.toLowerCase()));
  const essentials = ['toothbrush', 'passport', 'phone charger', 'underwear'];
  essentials.forEach(e => {
    if (!names.has(e)) {
      suggestions.push({ type: 'missing', message: `Don't forget: ${e.charAt(0).toUpperCase() + e.slice(1)}` });
    }
  });

  // 5. Roll clothes hint
  if (catCounts.clothing > 5) {
    suggestions.push({ type: 'tip', message: 'Roll soft clothes instead of folding — saves ~30% space.' });
  }

  // 6. Carry-on only possibility
  if (totalWeight < 7000 && items.length < 25) {
    suggestions.push({ type: 'tip', message: 'Light packer! You might be able to travel carry-on only.' });
  }

  return suggestions;
}

// ═══════════════════════════════════════════════════════════════════════
// G. DETECT MISSING ITEMS + SHOPPING LINKS
// ═══════════════════════════════════════════════════════════════════════
const SHOP_LINKS = {
  'sunscreen':      'https://www.amazon.com/s?k=travel+sunscreen',
  'universal adapter': 'https://www.amazon.com/s?k=universal+travel+adapter',
  'packing cubes':  'https://www.amazon.com/s?k=packing+cubes',
  'travel towel':   'https://www.amazon.com/s?k=travel+towel+microfiber',
  'power bank':     'https://www.amazon.com/s?k=power+bank+travel',
  'headlamp':       'https://www.amazon.com/s?k=headlamp+hiking',
  'dry bags':       'https://www.amazon.com/s?k=dry+bags+waterproof',
  'travel lock':    'https://www.amazon.com/s?k=tsa+travel+lock',
  'first aid kit':  'https://www.amazon.com/s?k=travel+first+aid+kit',
  'insect repellent': 'https://www.amazon.com/s?k=insect+repellent+travel',
  'sleeping bag':   'https://www.amazon.com/s?k=sleeping+bag+lightweight',
  'trekking poles': 'https://www.amazon.com/s?k=trekking+poles',
  'water bottle':   'https://www.amazon.com/s?k=water+bottle+travel',
  'money belt':     'https://www.amazon.com/s?k=money+belt+travel',
  'travel pillow':  'https://www.amazon.com/s?k=travel+pillow',
  'e-reader':       'https://www.amazon.com/s?k=kindle+e-reader',
};

function getShopLink(itemName) {
  const key = itemName.toLowerCase().trim();
  return SHOP_LINKS[key] || `https://www.amazon.com/s?k=${encodeURIComponent(itemName + ' travel')}`;
}

// ═══════════════════════════════════════════════════════════════════════
// H. MEMORY & LEARNING — Apply past-trip data to reduce / boost items
// ═══════════════════════════════════════════════════════════════════════
async function applyMemoryRules(userId, items) {
  try {
    const [unused, frequent] = await Promise.all([
      PackingHistory.getUnusedItems(userId, 30),
      PackingHistory.getFrequentItems(userId, 30),
    ]);

    const unusedSet = new Set(unused.map(u => u._id.toLowerCase()));
    const frequentSet = new Set(frequent.map(f => f._id.toLowerCase()));

    // Mark items that were unused in past trips
    items.forEach(item => {
      const key = item.name.toLowerCase();
      if (unusedSet.has(key) && !item.isEssential) {
        item._unusedFlag = true; // frontend can show a warning
      }
      if (frequentSet.has(key)) {
        item._favoriteFlag = true;
      }
    });

    // Add frequently used items that are missing
    const currentNames = new Set(items.map(i => i.name.toLowerCase()));
    frequent.forEach(f => {
      if (!currentNames.has(f._id.toLowerCase())) {
        items.push({
          name: f._id, // original casing from aggregation
          category: f.category || 'other',
          quantity: 1,
          source: 'memory',
          _favoriteFlag: true,
        });
      }
    });

    return items;
  } catch (err) {
    logger.error('Memory rules error:', err);
    return items; // fallback: return items unchanged
  }
}

// ═══════════════════════════════════════════════════════════════════════
// MASTER GENERATION — orchestrates everything
// ═══════════════════════════════════════════════════════════════════════
async function generateSmartPackingList({ userId, weatherData, activities, days, countryCode, airline }) {
  // 1. Duration basics
  let items = generateDurationItems(days);

  // 2. Weather essentials
  const weatherItems = generateWeatherItems(weatherData);
  items = items.concat(weatherItems);

  // 3. Activity gear
  const activityItems = generateActivityItems(activities);
  items = items.concat(activityItems);

  // 4. Cultural items
  const { items: culturalItems, notes: culturalNotes } = generateCulturalItems(countryCode);
  items = items.concat(culturalItems);

  // 5. Deduplicate (keep highest quantity, merge flags)
  const deduped = new Map();
  items.forEach(item => {
    const key = item.name.toLowerCase().trim();
    if (deduped.has(key)) {
      const existing = deduped.get(key);
      existing.quantity = Math.max(existing.quantity || 1, item.quantity || 1);
      existing.isEssential = existing.isEssential || item.isEssential;
      if (item.source && existing.source !== item.source) {
        existing.source = existing.source || item.source;
      }
    } else {
      deduped.set(key, { ...item, quantity: item.quantity || 1 });
    }
  });

  let finalItems = Array.from(deduped.values());

  // 6. Attach weight/volume specs
  finalItems = finalItems.map(item => {
    const spec = getItemSpec(item.name);
    return {
      ...item,
      weight: item.weight || spec.w,
      volume: item.volume || spec.v,
      category: item.category || spec.cat,
      shopUrl: getShopLink(item.name),
    };
  });

  // 7. Apply memory rules (user history)
  if (userId) {
    finalItems = await applyMemoryRules(userId, finalItems);
  }

  // 8. Airline restrictions
  const restrictions = getAirlineRestrictions(airline);

  // 9. Efficiency suggestions (run on pseudo-list)
  const suggestions = getEfficiencySuggestions({ items: finalItems });

  return {
    items: finalItems,
    culturalNotes,
    airlineRestrictions: restrictions,
    suggestions,
    metadata: {
      weatherBased: weatherItems.length,
      activityBased: activityItems.length,
      durationBased: items.length, // before dedup
      culturalBased: culturalItems.length,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════
// SEASON HELPER
// ═══════════════════════════════════════════════════════════════════════
function getSeason(date, lat) {
  const month = new Date(date).getMonth(); // 0-11
  const isNorthern = !lat || lat >= 0;
  if (isNorthern) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }
  // Southern hemisphere — seasons flipped
  if (month >= 2 && month <= 4) return 'autumn';
  if (month >= 5 && month <= 7) return 'winter';
  if (month >= 8 && month <= 10) return 'spring';
  return 'summer';
}

// ═══════════════════════════════════════════════════════════════════════
// DUPLICATE DETECTION
// ═══════════════════════════════════════════════════════════════════════
function detectDuplicates(items) {
  const seen = new Map();
  const duplicates = [];
  items.forEach(item => {
    const key = item.name.toLowerCase().trim();
    if (seen.has(key)) {
      duplicates.push({ existingId: seen.get(key), duplicateId: item._id, name: item.name });
    } else {
      seen.set(key, item._id);
    }
  });
  return duplicates;
}

module.exports = {
  generateSmartPackingList,
  generateWeatherItems,
  generateActivityItems,
  generateDurationItems,
  generateCulturalItems,
  getAirlineRestrictions,
  getEfficiencySuggestions,
  getItemSpec,
  getShopLink,
  applyMemoryRules,
  getSeason,
  detectDuplicates,
  ACTIVITY_GEAR,
  AIRLINE_RULES,
  CULTURAL_RULES,
};
