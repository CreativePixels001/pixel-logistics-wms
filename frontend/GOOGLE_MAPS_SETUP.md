# Google Maps API Setup Instructions

## Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click on "Select a project" at the top
4. Click "NEW PROJECT"
5. Enter project name: "Pixel Logistics TMS"
6. Click "CREATE"

### Step 2: Enable Google Maps JavaScript API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click on it and click "ENABLE"
4. Also enable "Directions API" for route drawing

### Step 3: Create API Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS"
3. Select "API key"
4. Copy the API key that appears
5. (Recommended) Click "RESTRICT KEY" to add restrictions:
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain or use `localhost` for testing
   - Under "API restrictions", select "Restrict key"
   - Choose "Maps JavaScript API" and "Directions API"
6. Click "SAVE"

### Step 4: Add API Key to Your Project
1. Open `frontend/tms-tracking.html`
2. Find this line:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>
   ```
3. Replace `YOUR_API_KEY` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAbc123...&callback=initMap" async defer></script>
   ```

### Step 5: Test the Map
1. Open `tms-tracking.html` in your browser
2. You should see:
   - Black and white Google Maps theme
   - 4 moving shipment markers on the map
   - Routes drawn between origin and destination
   - Interactive markers with shipment information

## Features Implemented

### Black & White Design
- Complete monochrome color scheme
- Black background (#000000)
- White text and borders
- Grayscale map styling

### Google Maps Integration
- Custom black and white map styles
- Real-time tracking simulation
- Animated shipment markers
- Route visualization using Directions API
- Interactive info windows on marker click

### Moving Shipments
- 4 active shipments with real coordinates:
  1. Mumbai → Delhi (via Indore)
  2. Bangalore → Chennai (via Vellore)
  3. Hyderabad → Coimbatore (via Mangalore)
  4. Ahmedabad → Jaipur (via Udaipur)
- Markers update position every 2 seconds
- Smooth animation towards destination
- Click shipment card to focus on specific route

### Interactive Controls
- Zoom In/Out buttons
- Recenter map to India view
- Full-screen mode
- Route history (placeholder)
- Click markers for shipment details

## Troubleshooting

### Map Not Loading
- Check if API key is correctly inserted
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Ensure you have billing enabled (Google requires it even for free tier)

### Markers Not Moving
- Markers animate every 2 seconds
- Movement is subtle (0.01 degrees per update)
- Check browser console for JavaScript errors

### Routes Not Showing
- Ensure Directions API is enabled
- Check API key restrictions allow Directions API
- Verify billing is enabled

## Free Tier Limits
- Google Maps offers $200 free credit per month
- Maps JavaScript API: $7 per 1,000 loads
- Directions API: $5 per 1,000 requests
- Free tier covers ~28,500 map loads per month

## Production Considerations
1. Add proper API key restrictions
2. Implement server-side API calls for sensitive operations
3. Add error handling for API failures
4. Cache map data when possible
5. Monitor API usage in Google Cloud Console
6. Consider rate limiting for real-time updates

## API Documentation
- [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Directions API](https://developers.google.com/maps/documentation/directions)
- [Styling Reference](https://developers.google.com/maps/documentation/javascript/styling)
