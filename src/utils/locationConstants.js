// src/utils/locationConstants.js
// Standardized location data for enterprise HRMS

// ─── Countries ───────────────────────────────────────────────
export const COUNTRIES = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'SG', label: 'Singapore' },
  { value: 'DE', label: 'Germany' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NP', label: 'Nepal' }
]

// ─── Indian States & UTs ─────────────────────────────────────
export const INDIAN_STATES = [
  { value: 'AN', label: 'Andaman and Nicobar Islands', code: '35' },
  { value: 'AP', label: 'Andhra Pradesh', code: '28' },
  { value: 'AR', label: 'Arunachal Pradesh', code: '12' },
  { value: 'AS', label: 'Assam', code: '18' },
  { value: 'BR', label: 'Bihar', code: '10' },
  { value: 'CH', label: 'Chandigarh', code: '04' },
  { value: 'CT', label: 'Chhattisgarh', code: '22' },
  { value: 'DL', label: 'Delhi', code: '07' },
  { value: 'GA', label: 'Goa', code: '30' },
  { value: 'GJ', label: 'Gujarat', code: '24' },
  { value: 'HR', label: 'Haryana', code: '06' },
  { value: 'HP', label: 'Himachal Pradesh', code: '02' },
  { value: 'JK', label: 'Jammu and Kashmir', code: '01' },
  { value: 'JH', label: 'Jharkhand', code: '20' },
  { value: 'KA', label: 'Karnataka', code: '29' },
  { value: 'KL', label: 'Kerala', code: '32' },
  { value: 'LA', label: 'Ladakh', code: '37' },
  { value: 'LD', label: 'Lakshadweep', code: '31' },
  { value: 'MP', label: 'Madhya Pradesh', code: '23' },
  { value: 'MH', label: 'Maharashtra', code: '27' },
  { value: 'MN', label: 'Manipur', code: '14' },
  { value: 'ML', label: 'Meghalaya', code: '17' },
  { value: 'MZ', label: 'Mizoram', code: '15' },
  { value: 'NL', label: 'Nagaland', code: '13' },
  { value: 'OR', label: 'Odisha', code: '21' },
  { value: 'PY', label: 'Puducherry', code: '34' },
  { value: 'PB', label: 'Punjab', code: '03' },
  { value: 'RJ', label: 'Rajasthan', code: '08' },
  { value: 'SK', label: 'Sikkim', code: '11' },
  { value: 'TN', label: 'Tamil Nadu', code: '33' },
  { value: 'TG', label: 'Telangana', code: '36' },
  { value: 'TR', label: 'Tripura', code: '16' },
  { value: 'UP', label: 'Uttar Pradesh', code: '09' },
  { value: 'UT', label: 'Uttarakhand', code: '05' },
  { value: 'WB', label: 'West Bengal', code: '19' }
]

// ─── Major Cities by State ────────────────────────────────────
export const CITIES_BY_STATE = {
  'AN': ['Port Blair'],
  'AP': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Rajahmundry'],
  'AR': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  'AS': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
  'BR': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  'CH': ['Chandigarh'],
  'CT': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  'DL': ['New Delhi', 'Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
  'GA': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'GJ': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Gandhidham'],
  'HR': ['Gurugram', 'Faridabad', 'Panipat', 'Karnal', 'Rohtak', 'Hisar', 'Sonipat', 'Ambala'],
  'HP': ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Kangra', 'Una'],
  'JK': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Katra'],
  'JH': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Dumka'],
  'KA': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belgaum', 'Gulbarga', 'Shimoga', 'Davangere', 'Bellary'],
  'KL': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad'],
  'LA': ['Leh', 'Kargil'],
  'LD': ['Kavaratti'],
  'MP': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Raipur'],
  'MH': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Thane', 'Kolhapur', 'Navi Mumbai'],
  'MN': ['Imphal'],
  'ML': ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
  'MZ': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  'NL': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  'OR': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  'PY': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'PB': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur'],
  'RJ': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bharatpur', 'Sikar'],
  'SK': ['Gangtok', 'Namchi', 'Pelling', 'Geyzing'],
  'TN': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Erode'],
  'TG': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Secunderabad'],
  'TR': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar'],
  'UP': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Noida', 'Ghaziabad', 'Meerut', 'Aligarh', 'Gorakhpur', 'Bareilly', 'Mathura', 'Moradabad'],
  'UT': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie', 'Roorkee', 'Rudrapur'],
  'WB': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol', 'Darjeeling', 'Kharagpur', 'Haldia']
}

// ─── Get Cities for Selected State ───────────────────────────
export const getCitiesForState = (stateCode) => {
  return CITIES_BY_STATE[stateCode] || []
}

// ─── Get State Name from Code ────────────────────────────────
export const getStateName = (stateCode) => {
  const state = INDIAN_STATES.find(s => s.value === stateCode)
  return state?.label || stateCode
}

// ─── Get State Code from Name ────────────────────────────────
export const getStateCode = (stateName) => {
  const state = INDIAN_STATES.find(s => 
    s.label.toLowerCase() === stateName?.toLowerCase()
  )
  return state?.value || null
}

// ─── PT State Codes (Professional Tax applicable states) ────
export const PT_STATES = ['AP', 'DL', 'KA', 'KL', 'MH', 'MP', 'OR', 'TG', 'TN', 'WB']

// ─── Timezones by Region ──────────────────────────────────────
export const TIMEZONES = {
  'IN': 'Asia/Kolkata',
  'US_EAST': 'America/New_York',
  'US_WEST': 'America/Los_Angeles',
  'UK': 'Europe/London',
  'AE': 'Asia/Dubai',
  'AU_EAST': 'Australia/Sydney',
  'CA_EAST': 'America/Toronto',
  'CA_WEST': 'America/Vancouver',
  'SG': 'Asia/Singapore',
  'DE': 'Europe/Berlin',
  'NP': 'Asia/Kathmandu'
}

// ─── Currency by Country ──────────────────────────────────────
export const CURRENCIES = {
  'IN': 'INR',
  'US': 'USD',
  'UK': 'GBP',
  'AE': 'AED',
  'AU': 'AUD',
  'CA': 'CAD',
  'SG': 'SGD',
  'DE': 'EUR',
  'NP': 'NPR'
}
