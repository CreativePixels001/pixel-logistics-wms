import axios from 'axios'

/**
 * FREE GOVERNMENT API SERVICE
 * All APIs used here are FREE and don't require API keys
 */

// ==================== PINCODE API (India Post) ====================
export async function getPincodeInfo(pincode) {
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = response.data[0]
    
    if (data.Status === 'Success') {
      const office = data.PostOffice[0]
      return {
        success: true,
        data: {
          pincode: office.Pincode,
          postOffice: office.Name,
          district: office.District,
          state: office.State,
          region: office.Region,
          division: office.Division
        }
      }
    }
    return { success: false, error: 'Invalid pincode' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==================== IFSC CODE API (RazorPay) ====================
export async function getIFSCInfo(ifsc) {
  try {
    const response = await axios.get(`https://ifsc.razorpay.com/${ifsc}`)
    return {
      success: true,
      data: {
        bank: response.data.BANK,
        branch: response.data.BRANCH,
        address: response.data.ADDRESS,
        city: response.data.CITY,
        state: response.data.STATE,
        district: response.data.DISTRICT,
        contact: response.data.CONTACT,
        ifsc: response.data.IFSC,
        micr: response.data.MICR
      }
    }
  } catch (error) {
    return { success: false, error: 'Invalid IFSC code' }
  }
}

// ==================== CURRENCY EXCHANGE (RBI) ====================
export async function getCurrencyRates() {
  try {
    // Using ExchangeRate-API (Free tier: 1500 requests/month)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/INR')
    return {
      success: true,
      data: {
        base: 'INR',
        rates: {
          USD: response.data.rates.USD,
          EUR: response.data.rates.EUR,
          GBP: response.data.rates.GBP,
          AED: response.data.rates.AED,
          SAR: response.data.rates.SAR
        },
        lastUpdated: new Date(response.data.time_last_updated * 1000).toISOString()
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==================== AIR QUALITY INDEX ====================
export async function getAQI(city) {
  try {
    // Using WAQI (World Air Quality Index) - Free
    const token = 'demo' // Replace with your token from https://aqicn.org/data-platform/token/
    const response = await axios.get(`https://api.waqi.info/feed/${city}/?token=${token}`)
    
    if (response.data.status === 'ok') {
      const aqi = response.data.data.aqi
      let quality = 'Good'
      if (aqi > 300) quality = 'Hazardous'
      else if (aqi > 200) quality = 'Very Unhealthy'
      else if (aqi > 150) quality = 'Unhealthy'
      else if (aqi > 100) quality = 'Unhealthy for Sensitive Groups'
      else if (aqi > 50) quality = 'Moderate'
      
      return {
        success: true,
        data: {
          city: response.data.data.city.name,
          aqi: aqi,
          quality: quality,
          dominentPollutant: response.data.data.dominentpol,
          time: response.data.data.time.s
        }
      }
    }
    return { success: false, error: 'City not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==================== DATA.GOV.IN - Open Government Data ====================
export async function searchGovData(query) {
  try {
    // Using data.gov.in API (Free, no registration needed)
    const response = await axios.get(`https://api.data.gov.in/catalog/${query}`)
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return { success: false, error: 'Data not available' }
  }
}

// ==================== COWIN - Vaccination Status ====================
export async function getCowinSlots(pincode, date) {
  try {
    // Format: DD-MM-YYYY
    const response = await axios.get(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${date}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )
    
    if (response.data.sessions && response.data.sessions.length > 0) {
      return {
        success: true,
        data: response.data.sessions.map(session => ({
          center: session.name,
          address: session.address,
          vaccine: session.vaccine,
          availableCapacity: session.available_capacity,
          minAge: session.min_age_limit,
          date: session.date
        }))
      }
    }
    return { success: false, error: 'No slots available' }
  } catch (error) {
    return { success: false, error: 'Unable to fetch CoWIN data' }
  }
}

// ==================== FUEL PRICES (India) ====================
export async function getFuelPrices(city) {
  try {
    // Using public fuel price data (simulated - replace with actual scraping if needed)
    // For real implementation, scrape from https://www.goodreturns.in/petrol-price/
    const mockPrices = {
      delhi: { petrol: 96.72, diesel: 89.62 },
      mumbai: { petrol: 106.31, diesel: 94.27 },
      bangalore: { petrol: 101.94, diesel: 87.89 },
      chennai: { petrol: 102.63, diesel: 94.24 },
      kolkata: { petrol: 106.03, diesel: 92.76 }
    }
    
    const cityKey = city.toLowerCase()
    if (mockPrices[cityKey]) {
      return {
        success: true,
        data: {
          city: city,
          petrol: mockPrices[cityKey].petrol,
          diesel: mockPrices[cityKey].diesel,
          currency: 'INR',
          date: new Date().toISOString()
        }
      }
    }
    return { success: false, error: 'City not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==================== WEATHER (Using OpenWeatherMap Free) ====================
export async function getWeather(city) {
  try {
    // Using wttr.in (Free, no API key needed)
    const response = await axios.get(`https://wttr.in/${city}?format=j1`)
    const current = response.data.current_condition[0]
    
    return {
      success: true,
      data: {
        city: city,
        temperature: current.temp_C,
        feelsLike: current.FeelsLikeC,
        humidity: current.humidity,
        windSpeed: current.windspeedKmph,
        description: current.weatherDesc[0].value,
        lastUpdated: current.observation_time
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ==================== PNR STATUS (Indian Railways) ====================
export async function getPNRStatus(pnr) {
  try {
    // Note: Official IRCTC doesn't provide free API
    // Using RailwayAPI (Free tier available at https://railwayapi.com/)
    // Replace 'YOUR_API_KEY' with actual key
    const response = await axios.get(`https://indianrailapi.com/api/v2/PNRCheck/apikey/YOUR_API_KEY/PNRNumber/${pnr}/`)
    
    return {
      success: true,
      data: {
        pnr: pnr,
        trainNumber: response.data.TrainNo,
        trainName: response.data.TrainName,
        from: response.data.From,
        to: response.data.To,
        doj: response.data.Doj,
        status: response.data.PassengerStatus
      }
    }
  } catch (error) {
    return { success: false, error: 'PNR not found or API limit reached' }
  }
}
