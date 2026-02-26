import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    createdAt: string;
}

// Get cuurent user data
export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Check if user is logged in
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const loginStatus = await AsyncStorage.getItem('isLoggedIn');
    return loginStatus === 'true';
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Logout user
export const logout = async (routerInstance?: any) => {
  try {
    console.log('Logout started - clearing AsyncStorage...');
    
    // Remove all user-related data from AsyncStorage
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userRole');
  
    console.log('AsyncStorage cleared successfully');
    
    // Verify data was cleared
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    const userData = await AsyncStorage.getItem('userData');
    console.log('Verification - isLoggedIn:', isLoggedIn, 'userData:', userData);
    
    // Navigate to onboarding screen
    if (routerInstance) {
      console.log('Navigating to onboarding with provided router...');
      routerInstance.replace('/onboarding');
    } else {
      console.log('Navigating to onboarding with default router...');
      router.replace('/onboarding');
    }
    
    console.log('Navigation triggered');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// Get user role
export const getUserRole = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userRole');
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Clear all data (for testing)
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};