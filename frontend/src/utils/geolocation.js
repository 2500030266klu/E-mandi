export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
        (error) => reject(error)
      );
    }
  });
};

export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) throw new Error('Geocoding API failed');
    
    const data = await response.json();
    const address = data.address;
    
    // OpenStreetMap returns various keys for district/state depending on region
    let state = address.state || '';
    let district = address.state_district || address.county || address.city || '';
    
    // Clean up "District" suffix if present
    if (district.toLowerCase().includes('district')) {
      district = district.replace(/district/i, '').trim();
    }
    
    return { state, district, success: true };
  } catch (error) {
    console.error("Reverse geocoding failed, using fallback:", error);
    // Fallback for prototype stability if API is rate limited
    return { state: 'Uttar Pradesh', district: 'Lucknow', success: false };
  }
};
