# Climatiq API Integration - Restoration Complete ✅

## Overview
The Climatiq API integration provides **real-time carbon footprint tracking** for user trips and activities. This feature calculates accurate CO2 emissions for transport, accommodation, food, and activities using verified scientific data.

---

## What Was Restored

The Climatiq integration files were accidentally deleted when restructuring the project. I've successfully restored and integrated them into the current architecture.

### Restored Files

1. **Backend Service** (`backend/services/climatiq.service.js`)
   - Core Climatiq API integration
   - Emission calculation functions
   - Caching system for API responses
   - Fallback calculations when API unavailable

2. **Backend Controller** (`backend/controllers/climatiq.controller.js`)
   - API endpoints for emission calculations
   - Request validation and error handling

3. **Backend Routes** (`backend/routes/climatiq.routes.js`)
   - RESTful routes for carbon calculations

4. **Frontend Component** (`components/ClimatiqStatus.tsx`)
   - Visual status indicator for API connection
   - Real-time connection monitoring
   - Fallback emission factors display

5. **Environment Configuration** (`backend/.env`)
   - Added Climatiq API key
   - Added Climatiq data version

---

## Features

### 🌍 Real-Time Carbon Tracking

#### Transport Emissions
- **Flights**: Domestic/international, cabin class variations
- **Trains**: National rail with fuel source tracking
- **Buses**: Public transport emissions
- **Cars**: Petrol, diesel, electric vehicle options
- **Ferries**: Water transport calculations

#### Accommodation Emissions
- **Hotels**: Star rating considerations
- **Hostels**: Budget accommodation
- **Vacation Rentals**: Private accommodations
- **Camping**: Low-impact lodging

#### Food Emissions
- **Vegan**: Lowest carbon footprint
- **Vegetarian**: Plant-based options
- **Local Produce**: Regional food sources
- **Meat-Heavy**: High-impact meals
- **Average Meal**: Standard diet emissions

#### Activities Emissions
- Duration-based calculations
- Participant count considerations
- Country-specific factors

---

## API Endpoints

### Validate Connection
```
GET /api/climatiq/validate
```
Check if Climatiq API is operational.

**Response:**
```json
{
  "success": true,
  "connected": true,
  "message": "Climatiq API is connected and operational"
}
```

### Calculate Transport Emissions
```
POST /api/climatiq/transport
Authorization: Required
```

**Request Body:**
```json
{
  "mode": "flight",
  "distance": 500,
  "passengers": 2,
  "fuel_type": "petrol",
  "cabin_class": "economy"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emissions": 127.5,
    "unit": "kg CO2e",
    "mode": "flight",
    "distance": 500
  }
}
```

### Calculate Accommodation Emissions
```
POST /api/climatiq/accommodation
Authorization: Required
```

**Request Body:**
```json
{
  "type": "hotel",
  "nights": 3,
  "country": "US",
  "star_rating": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emissions": 75,
    "unit": "kg CO2e",
    "type": "hotel",
    "nights": 3
  }
}
```

### Calculate Food Emissions
```
POST /api/climatiq/food
Authorization: Required
```

**Request Body:**
```json
{
  "meal_type": "vegetarian",
  "country_code": "US",
  "number_of_meals": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emissions": 10,
    "unit": "kg CO2e",
    "meal_type": "vegetarian",
    "number_of_meals": 10
  }
}
```

### Calculate Total Trip Emissions
```
POST /api/climatiq/trip
Authorization: Required
```

**Request Body:**
```json
{
  "transport": [
    { "mode": "flight", "distance": 500, "passengers": 1 }
  ],
  "accommodation": [
    { "type": "hotel", "nights": 3, "country": "US" }
  ],
  "activities": [
    { "type": "hiking", "duration": 4, "participants": 1, "country": "US" }
  ],
  "food": [
    { "meal_type": "average_meal", "country_code": "US", "number_of_meals": 9 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transport": 127.5,
    "accommodation": 75,
    "activities": 5,
    "food": 16.2,
    "total": 223.7,
    "breakdown": {
      "transport_details": [...],
      "accommodation_details": [...],
      "activity_details": [...],
      "food_details": [...]
    }
  }
}
```

### Calculate Real-Time Emissions
```
POST /api/climatiq/realtime
Authorization: Required
```

**Request Body:**
```json
{
  "destination": "US",
  "duration": 5,
  "transport_mode": "car",
  "distance": 300,
  "accommodation_type": "hotel",
  "activities": ["hiking", "sightseeing"],
  "food_types": ["vegetarian", "average_meal"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_emissions": 185.3,
    "emissions_per_day": 37.06,
    "comparison_to_average": -25.88,
    "recommendations": [
      "Consider train or bus instead of flying...",
      "Choose eco-certified accommodation..."
    ]
  }
}
```

---

## Configuration

### Environment Variables

Add to `backend/.env`:
```env
# Climatiq API (Carbon Footprint Tracking)
CLIMATIQ_API_KEY=MMTJR3DHYX08F71T3R0X21JAEG
CLIMATIQ_DATA_VERSION=22.22
```

**API Key**: The key is already configured and working
**Data Version**: Using version 22.22 of Climatiq's emission factor database

---

## Fallback System

When the Climatiq API is unavailable, the system automatically uses **scientifically-based fallback calculations**:

### Fallback Emission Factors

| Category | Factor | Unit |
|----------|--------|------|
| **Transport** | | |
| Flight | 255g | CO2/km per passenger |
| Train | 41g | CO2/km per passenger |
| Bus | 89g | CO2/km per passenger |
| Car | 171g | CO2/km per passenger |
| Ferry | 113g | CO2/km per passenger |
| **Accommodation** | | |
| Hotel | 25kg | CO2 per night |
| Hostel | 12kg | CO2 per night |
| Vacation Rental | 18kg | CO2 per night |
| Camping | 2kg | CO2 per night |
| **Food** | | |
| Vegan | 0.7kg | CO2 per meal |
| Vegetarian | 1.0kg | CO2 per meal |
| Local Produce | 1.2kg | CO2 per meal |
| Meat-Heavy | 3.5kg | CO2 per meal |
| Average Meal | 1.8kg | CO2 per meal |

---

## Frontend Integration

### Using the ClimatiqStatus Component

```tsx
import ClimatiqStatus from './components/ClimatiqStatus';

function Dashboard() {
  const handleConnectionChange = (connected: boolean) => {
    console.log('Climatiq connection:', connected ? 'online' : 'offline');
  };

  return (
    <div>
      <ClimatiqStatus onConnectionChange={handleConnectionChange} />
      {/* Rest of your dashboard */}
    </div>
  );
}
```

### Making API Calls

```typescript
// Calculate trip emissions
const calculateEmissions = async (tripData) => {
  const response = await fetch('/api/climatiq/realtime', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(tripData)
  });
  
  const data = await response.json();
  return data;
};
```

---

## Caching System

The Climatiq service includes an intelligent caching system:

- **Cache Duration**: 24 hours (86400000ms)
- **Cache Key**: Generated from endpoint + request parameters
- **Benefits**:
  - Reduces API calls (lower costs)
  - Faster response times
  - Works offline with cached data
  - Automatic cache invalidation after TTL

---

## Testing

### Test Connection
```bash
curl http://localhost:3005/api/climatiq/validate
```

Expected response:
```json
{
  "success": true,
  "connected": true,
  "message": "Climatiq API is connected and operational"
}
```

### Test Transport Calculation
```bash
curl -X POST http://localhost:3005/api/climatiq/transport \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "mode": "car",
    "distance": 100,
    "passengers": 2
  }'
```

---

## How It Works

### 1. User Plans Trip
User enters trip details (destination, dates, transport, accommodation)

### 2. Real-Time Calculation
App sends data to `/api/climatiq/realtime` endpoint

### 3. API Processing
- Climatiq service calculates emissions for each category
- Uses Climatiq API when available
- Falls back to local calculations if API unavailable

### 4. Results Display
- Total emissions in kg CO2e
- Emissions per day
- Comparison to average trip
- Personalized recommendations

### 5. Recommendations
Based on emissions breakdown:
- "Consider train instead of flying" (if transport > 60%)
- "Choose eco-certified accommodation" (if lodging > threshold)
- "Select low-impact activities" (if activities high)
- "Reduce meat-heavy meals" (if food emissions high)

---

## Benefits

✅ **Accurate Tracking**: Uses verified scientific emission factors  
✅ **Real-Time Feedback**: Instant calculations as users plan  
✅ **Offline Support**: Fallback calculations always available  
✅ **Personalized Tips**: Context-aware sustainability recommendations  
✅ **Performance**: Caching reduces latency and API costs  
✅ **Transparent**: Users see exact emission sources  

---

## Dependencies

- **node-fetch**: HTTP requests to Climatiq API (installed ✅)
- **Climatiq API**: Third-party carbon calculation service
- **Express.js**: API routing
- **MongoDB**: Emission data storage (optional)

---

## Future Enhancements

1. **Historical Tracking**: Store user's carbon footprint over time
2. **Carbon Offsetting**: Direct integration with offset programs
3. **Gamification**: Badges for low-carbon trips
4. **Social Features**: Compare emissions with friends
5. **AI Suggestions**: ML-powered trip optimization
6. **More Categories**: Shipping, events, digital activities

---

## Troubleshooting

### API Connection Failed
- Check `CLIMATIQ_API_KEY` in `.env`
- Verify internet connection
- System automatically uses fallback calculations

### Inaccurate Results
- Ensure correct country codes (ISO 3166-1 alpha-2)
- Verify mode/type matches enum values
- Check distance units (km required)

### Cache Issues
- Cache auto-expires after 24 hours
- Restart server to clear cache
- Check memory usage if cache grows large

---

## Related Files

- `backend/services/climatiq.service.js` - Core logic
- `backend/controllers/climatiq.controller.js` - API endpoints
- `backend/routes/climatiq.routes.js` - Route definitions
- `components/ClimatiqStatus.tsx` - Frontend status indicator
- `backend/.env` - Configuration

---

## Resources

- [Climatiq API Documentation](https://www.climatiq.io/docs)
- [Emission Factor Database](https://www.climatiq.io/data)
- [Carbon Calculation Methodology](https://www.climatiq.io/methodology)

---

## Summary

🎉 **Climatiq API integration is fully restored and operational!**

- ✅ Real-time carbon footprint tracking
- ✅ Multiple emission categories supported
- ✅ Fallback system for offline operation
- ✅ Frontend status monitoring component
- ✅ Comprehensive API endpoints
- ✅ Smart caching for performance
- ✅ Scientific accuracy with verified data

Your users can now see the environmental impact of their trips in real-time and receive personalized recommendations for more sustainable travel choices! 🌿
