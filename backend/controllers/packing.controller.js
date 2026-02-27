const PackingList = require('../models/packing.model');
const PackingHistory = require('../models/packing-history.model');
const PackingTemplate = require('../models/packing-template.model');
const Trip = require('../models/trip.model');
const logger = require('../utils/logger');
const packingService = require('../services/packing.service');

// @desc    Get or create packing list for a trip
// @route   GET /api/packing/:tripId
// @access  Private
const getPackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    let list = await PackingList.getForTrip(tripId);

    if (!list) {
      // Auto-create an empty list linked to the trip
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
      list = await PackingList.create({
        tripId,
        owner: req.user._id,
        collaborators: trip.collaborators.map(c => ({ user: c, role: 'editor' })),
        items: [],
        luggage: [{ name: 'Main Bag', type: 'checked', maxWeight: 23000, maxVolume: 62000 }],
      });
      list = await PackingList.getForTrip(tripId);
    }

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    logger.error('getPackingList error:', error);
    res.status(500).json({ success: false, message: 'Failed to load packing list', error: error.message });
  }
};

// @desc    Generate smart packing list for a trip
// @route   POST /api/packing/:tripId/generate
// @access  Private
const generateList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { activities, airline, countryCode } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Calculate duration
    let days = 3;
    if (trip.dates && trip.dates.startDate && trip.dates.endDate) {
      days = Math.max(1, Math.ceil((new Date(trip.dates.endDate) - new Date(trip.dates.startDate)) / 86400000));
    }

    // Fetch weather data from our own weather endpoint
    let weatherData = null;
    const destination = trip.destination?.name || req.body.destination || '';
    if (destination) {
      try {
        const config = require('../config/env.config');
        const apiKey = config.apis.weather;
        if (apiKey && apiKey !== 'your_weather_api_key') {
          const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(destination)}&days=${Math.min(days, 10)}&aqi=no`;
          const wRes = await fetch(url);
          if (wRes.ok) {
            const wData = await wRes.json();
            weatherData = {
              current: {
                temp_c: wData.current.temp_c,
                uv: wData.current.uv,
                condition: wData.current.condition.text,
              },
              forecast: wData.forecast.forecastday.map(d => ({
                date: d.date,
                mintemp_c: d.day.mintemp_c,
                maxtemp_c: d.day.maxtemp_c,
                condition: mapConditionSimple(d.day.condition.code),
                chance_of_rain: d.day.daily_chance_of_rain,
              })),
            };
          }
        }
      } catch (wErr) {
        logger.warn('Weather fetch for packing failed, continuing without weather data:', wErr.message);
      }
    }

    // Determine activities from trip category or explicit param
    const effectiveActivities = activities || (trip.category ? [trip.category] : ['exploring']);
    const effectiveCountry = countryCode || trip.destination?.country || '';

    // Generate the smart list
    const generated = await packingService.generateSmartPackingList({
      userId: req.user._id,
      weatherData,
      activities: effectiveActivities,
      days,
      countryCode: effectiveCountry,
      airline: airline || '',
    });

    // Save to database — upsert
    let list = await PackingList.findOne({ tripId });
    if (!list) {
      list = new PackingList({
        tripId,
        owner: req.user._id,
        collaborators: trip.collaborators.map(c => ({ user: c, role: 'editor' })),
        items: [],
        luggage: [{ name: 'Main Bag', type: 'checked', maxWeight: 23000, maxVolume: 62000 }],
      });
    }

    // Add generated items (don't duplicate existing manual items)
    const existingNames = new Set(list.items.map(i => i.name.toLowerCase()));
    const newItems = generated.items
      .filter(i => !existingNames.has(i.name.toLowerCase()))
      .map(i => ({
        name: i.name,
        category: i.category,
        quantity: i.quantity || 1,
        weight: i.weight || 0,
        volume: i.volume || 0,
        isEssential: i.isEssential || false,
        source: i.source || 'manual',
        shopUrl: i.shopUrl || null,
        addedBy: req.user._id,
        packed: false,
        _unusedFlag: i._unusedFlag || false,
        _favoriteFlag: i._favoriteFlag || false,
      }));

    list.items.push(...newItems);
    list.generatedFrom = {
      weather: !!weatherData,
      activities: effectiveActivities,
      duration: days,
      destination,
      destinationCountry: effectiveCountry,
      temperature: weatherData ? {
        avgC: weatherData.current?.temp_c,
        minC: Math.min(...(weatherData.forecast || []).map(f => f.mintemp_c)),
        maxC: Math.max(...(weatherData.forecast || []).map(f => f.maxtemp_c)),
      } : undefined,
      conditions: weatherData ? [...new Set(weatherData.forecast.map(f => f.condition))] : [],
    };

    if (airline) {
      list.airlineRestrictions = packingService.getAirlineRestrictions(airline);
    }

    await list.save();
    const populated = await PackingList.getForTrip(tripId);

    res.status(200).json({
      success: true,
      data: populated,
      generation: {
        culturalNotes: generated.culturalNotes,
        suggestions: generated.suggestions,
        metadata: generated.metadata,
      },
    });
  } catch (error) {
    logger.error('generateList error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate packing list', error: error.message });
  }
};

// @desc    Add item to packing list
// @route   POST /api/packing/:tripId/items
// @access  Private
const addItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, category, quantity, weight, volume, isEssential, isShared, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    let list = await PackingList.findOne({ tripId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Packing list not found' });
    }

    const spec = packingService.getItemSpec(name);
    const newItem = {
      name: name.trim(),
      category: category || spec.cat,
      quantity: quantity || 1,
      weight: weight || spec.w,
      volume: volume || spec.v,
      isEssential: isEssential || false,
      isShared: isShared || false,
      notes: notes || '',
      source: 'manual',
      addedBy: req.user._id,
      shopUrl: packingService.getShopLink(name),
    };

    // Check for duplicates
    const duplicates = packingService.detectDuplicates([...list.items, newItem]);

    list.items.push(newItem);
    await list.save();

    const populated = await PackingList.getForTrip(tripId);
    const addedItem = populated.items[populated.items.length - 1];

    res.status(201).json({
      success: true,
      data: addedItem,
      duplicates: duplicates.length > 0 ? duplicates : undefined,
      list: populated,
    });
  } catch (error) {
    logger.error('addItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item', error: error.message });
  }
};

// @desc    Update item (toggle packed, assign, edit)
// @route   PUT /api/packing/:tripId/items/:itemId
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const updates = req.body; // { packed, assignedTo, quantity, notes, etc. }

    const list = await PackingList.findOne({ tripId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Packing list not found' });
    }

    const item = list.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Apply updates
    if (updates.packed !== undefined) {
      item.packed = updates.packed;
      item.packedBy = updates.packed ? req.user._id : null;
      item.packedAt = updates.packed ? new Date() : null;
    }
    if (updates.assignedTo !== undefined) item.assignedTo = updates.assignedTo;
    if (updates.quantity !== undefined) item.quantity = updates.quantity;
    if (updates.notes !== undefined) item.notes = updates.notes;
    if (updates.name !== undefined) item.name = updates.name;
    if (updates.category !== undefined) item.category = updates.category;
    if (updates.isShared !== undefined) item.isShared = updates.isShared;
    if (updates.isEssential !== undefined) item.isEssential = updates.isEssential;

    await list.save();
    const populated = await PackingList.getForTrip(tripId);

    res.status(200).json({ success: true, data: populated.items.id(itemId), list: populated });
  } catch (error) {
    logger.error('updateItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to update item', error: error.message });
  }
};

// @desc    Remove item from packing list
// @route   DELETE /api/packing/:tripId/items/:itemId
// @access  Private
const removeItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;

    const list = await PackingList.findOne({ tripId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Packing list not found' });
    }

    list.items.pull({ _id: itemId });
    await list.save();
    const populated = await PackingList.getForTrip(tripId);

    res.status(200).json({ success: true, message: 'Item removed', list: populated });
  } catch (error) {
    logger.error('removeItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item', error: error.message });
  }
};

// @desc    Add / update luggage
// @route   POST /api/packing/:tripId/luggage
// @access  Private
const addLuggage = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, type, maxWeight, maxVolume, airline, color } = req.body;

    const list = await PackingList.findOne({ tripId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Packing list not found' });
    }

    list.luggage.push({
      name: name || 'New Bag',
      type: type || 'checked',
      maxWeight: maxWeight || 23000,
      maxVolume: maxVolume || 62000,
      airline: airline || '',
      color: color || '#3a5a40',
    });
    await list.save();
    const populated = await PackingList.getForTrip(tripId);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    logger.error('addLuggage error:', error);
    res.status(500).json({ success: false, message: 'Failed to add luggage', error: error.message });
  }
};

// @desc    Remove luggage
// @route   DELETE /api/packing/:tripId/luggage/:luggageId
// @access  Private
const removeLuggage = async (req, res) => {
  try {
    const { tripId, luggageId } = req.params;

    const list = await PackingList.findOne({ tripId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Packing list not found' });
    }

    list.luggage.pull({ _id: luggageId });
    await list.save();
    const populated = await PackingList.getForTrip(tripId);

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    logger.error('removeLuggage error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove luggage', error: error.message });
  }
};

// @desc    Get efficiency suggestions + airline compliance
// @route   GET /api/packing/:tripId/suggestions
// @access  Private
const getSuggestions = async (req, res) => {
  try {
    const { tripId } = req.params;
    const list = await PackingList.findOne({ tripId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Packing list not found' });
    }

    const suggestions = packingService.getEfficiencySuggestions(list);

    // Airline compliance check
    let compliance = null;
    if (list.airlineRestrictions && list.airlineRestrictions.airline) {
      const totalWeight = list.items.reduce((s, i) => s + (i.weight * i.quantity), 0);
      compliance = {
        airline: list.airlineRestrictions.airline,
        carryOnLimit: list.airlineRestrictions.carryOnWeight,
        checkedLimit: list.airlineRestrictions.checkedWeight,
        totalWeight,
        overweight: totalWeight > list.airlineRestrictions.checkedWeight,
        overweightBy: Math.max(0, totalWeight - list.airlineRestrictions.checkedWeight),
      };
    }

    res.status(200).json({ success: true, data: { suggestions, compliance } });
  } catch (error) {
    logger.error('getSuggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get suggestions', error: error.message });
  }
};

// @desc    Report item usage after trip (memory / learning)
// @route   POST /api/packing/:tripId/report
// @access  Private
const reportUsage = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { items } = req.body; // [{ name, wasUsed: bool, isFavorite: bool }]

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const season = packingService.getSeason(
      trip.dates?.startDate || new Date(),
      trip.destination?.coordinates?.lat
    );

    const historyDocs = items.map(item => ({
      userId: req.user._id,
      tripId,
      itemName: item.name,
      category: item.category || 'other',
      wasUsed: item.wasUsed,
      isFavorite: item.isFavorite || false,
      destination: trip.destination?.name || '',
      destinationCountry: trip.destination?.country || '',
      season,
      tripCategory: trip.category || 'other',
    }));

    await PackingHistory.insertMany(historyDocs);

    res.status(201).json({ success: true, message: `Reported ${historyDocs.length} items`, count: historyDocs.length });
  } catch (error) {
    logger.error('reportUsage error:', error);
    res.status(500).json({ success: false, message: 'Failed to report usage', error: error.message });
  }
};

// @desc    Get user packing memory (unused + favorites)
// @route   GET /api/packing/memory
// @access  Private
const getMemory = async (req, res) => {
  try {
    const [unused, frequent, favorites] = await Promise.all([
      PackingHistory.getUnusedItems(req.user._id),
      PackingHistory.getFrequentItems(req.user._id),
      PackingHistory.find({ userId: req.user._id, isFavorite: true })
        .distinct('itemName'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        unusedItems: unused,
        frequentItems: frequent,
        favoriteItems: favorites,
      },
    });
  } catch (error) {
    logger.error('getMemory error:', error);
    res.status(500).json({ success: false, message: 'Failed to load packing memory', error: error.message });
  }
};

// @desc    Get / create templates
// @route   GET /api/packing/templates
// @access  Private
const getTemplates = async (req, res) => {
  try {
    const { tripCategory, season } = req.query;
    const query = { isActive: true };
    if (tripCategory) query.tripCategory = tripCategory;
    if (season) query.season = season;

    // System + user's templates
    query.$or = [
      { type: 'system' },
      { createdBy: req.user._id },
    ];

    const templates = await PackingTemplate.find(query).sort({ usageCount: -1 }).limit(20);

    // If no system templates exist yet, seed them
    if (templates.length === 0) {
      await seedSystemTemplates();
      const seeded = await PackingTemplate.find(query).sort({ usageCount: -1 }).limit(20);
      return res.status(200).json({ success: true, data: seeded });
    }

    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    logger.error('getTemplates error:', error);
    res.status(500).json({ success: false, message: 'Failed to load templates', error: error.message });
  }
};

// @desc    Apply a template to a packing list
// @route   POST /api/packing/:tripId/apply-template
// @access  Private
const applyTemplate = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { templateId } = req.body;

    const template = await PackingTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    let list = await PackingList.findOne({ tripId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Packing list not found' });
    }

    const existingNames = new Set(list.items.map(i => i.name.toLowerCase()));
    const newItems = template.items
      .filter(ti => !existingNames.has(ti.name.toLowerCase()))
      .map(ti => ({
        name: ti.name,
        category: ti.category,
        quantity: ti.quantity || 1,
        weight: ti.weight || packingService.getItemSpec(ti.name).w,
        volume: ti.volume || packingService.getItemSpec(ti.name).v,
        isEssential: ti.isEssential || false,
        source: 'template',
        addedBy: req.user._id,
        shopUrl: packingService.getShopLink(ti.name),
      }));

    list.items.push(...newItems);
    await list.save();

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    const populated = await PackingList.getForTrip(tripId);

    res.status(200).json({
      success: true,
      data: populated,
      added: newItems.length,
    });
  } catch (error) {
    logger.error('applyTemplate error:', error);
    res.status(500).json({ success: false, message: 'Failed to apply template', error: error.message });
  }
};

// ─── Helper: Simplified weather condition mapper ──────────────────────
function mapConditionSimple(code) {
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'Stormy';
  if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) return 'Rainy';
  if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1003, 1006, 1009, 1030, 1135, 1147].includes(code)) return 'Cloudy';
  return 'Sunny';
}

// ─── Helper: Seed system templates ────────────────────────────────────
async function seedSystemTemplates() {
  const templates = [
    {
      name: 'Weekend Getaway',
      description: 'Perfect for a 2-3 day trip',
      type: 'system',
      durationRange: { min: 1, max: 3 },
      items: [
        { name: 'T-Shirt', category: 'clothing', quantity: 3, isEssential: true },
        { name: 'Underwear', category: 'clothing', quantity: 3, isEssential: true },
        { name: 'Socks', category: 'clothing', quantity: 3, isEssential: true },
        { name: 'Jeans', category: 'clothing', quantity: 1 },
        { name: 'Shorts', category: 'clothing', quantity: 1 },
        { name: 'Toothbrush', category: 'toiletries', quantity: 1, isEssential: true },
        { name: 'Toothpaste', category: 'toiletries', quantity: 1, isEssential: true },
        { name: 'Deodorant', category: 'toiletries', quantity: 1 },
        { name: 'Phone Charger', category: 'electronics', quantity: 1, isEssential: true },
        { name: 'Passport', category: 'documents', quantity: 1, isEssential: true },
      ],
    },
    {
      name: 'Hiking Adventure',
      description: 'Essential gear for trail exploration',
      type: 'system',
      tripCategory: 'hiking',
      items: packingService.ACTIVITY_GEAR.hiking.map(g => ({
        name: g.name, category: g.category, quantity: 1, isEssential: g.isEssential,
        weight: packingService.getItemSpec(g.name).w,
        volume: packingService.getItemSpec(g.name).v,
      })),
    },
    {
      name: 'Beach Vacation',
      description: 'Sun, sand, and sea essentials',
      type: 'system',
      tripCategory: 'beach',
      items: packingService.ACTIVITY_GEAR.beach.map(g => ({
        name: g.name, category: g.category, quantity: 1, isEssential: g.isEssential,
        weight: packingService.getItemSpec(g.name).w,
        volume: packingService.getItemSpec(g.name).v,
      })),
    },
    {
      name: 'Business Trip',
      description: 'Professional travel essentials',
      type: 'system',
      tripCategory: 'business',
      items: packingService.ACTIVITY_GEAR.business.map(g => ({
        name: g.name, category: g.category, quantity: 1, isEssential: g.isEssential,
        weight: packingService.getItemSpec(g.name).w,
        volume: packingService.getItemSpec(g.name).v,
      })),
    },
    {
      name: 'Winter Essentials',
      description: 'Cold weather packing template',
      type: 'system',
      season: 'winter',
      items: [
        { name: 'Heavy Jacket', category: 'clothing', quantity: 1, isEssential: true },
        { name: 'Thermal Base Layer', category: 'clothing', quantity: 2, isEssential: true },
        { name: 'Sweater', category: 'clothing', quantity: 2, isEssential: true },
        { name: 'Gloves', category: 'accessories', quantity: 1, isEssential: true },
        { name: 'Beanie', category: 'accessories', quantity: 1, isEssential: true },
        { name: 'Scarf', category: 'accessories', quantity: 1 },
        { name: 'Hiking Boots', category: 'footwear', quantity: 1, isEssential: true },
        { name: 'Lip Balm', category: 'toiletries', quantity: 1 },
      ],
    },
  ];

  try {
    await PackingTemplate.insertMany(templates);
    logger.info('Seeded system packing templates');
  } catch (err) {
    logger.warn('Template seeding skipped (may already exist):', err.message);
  }
}

module.exports = {
  getPackingList,
  generateList,
  addItem,
  updateItem,
  removeItem,
  addLuggage,
  removeLuggage,
  getSuggestions,
  reportUsage,
  getMemory,
  getTemplates,
  applyTemplate,
};
