// services/config.ts
// Configuration for API endpoints

// Set to true when developing on web/localhost
// Set to false when testing on Android device
const USE_LOCALHOST = false;

// Your computer's local IP address (found using 'ipconfig' command)
// Update this if your IP changes
const LOCAL_IP = '10.91.171.98';

// Automatically choose the correct API URL
export const API_BASE_URL = USE_LOCALHOST 
  ? 'http://localhost:5000/api' 
  : `http://${LOCAL_IP}:5000/api`;

// Export for other configurations
export const config = {
  useLocalhost: USE_LOCALHOST,
  localIP: LOCAL_IP,
  apiBaseUrl: API_BASE_URL,
  apiPort: 5000,
};

// Helper to print current configuration
export const printConfig = () => {
  console.log('🔧 API Configuration:');
  console.log(`   Mode: ${USE_LOCALHOST ? 'Localhost (Web)' : 'Network (Android)'}`);
  console.log(`   API URL: ${API_BASE_URL}`);
  console.log(`   Local IP: ${LOCAL_IP}`);
};
