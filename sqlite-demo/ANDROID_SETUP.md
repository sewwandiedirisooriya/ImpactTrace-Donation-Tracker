# 📱 Running the App on Android Device

## Prerequisites
- Android smartphone
- Computer and phone on the **same Wi-Fi network**
- Backend server running on your computer
- Expo Go app installed on your phone

## Step-by-Step Instructions

### 1️⃣ Install Expo Go on Your Android Phone
1. Open **Google Play Store**
2. Search for **"Expo Go"**
3. Install the app

### 2️⃣ Start the Backend Server
Open a terminal and run:
```bash
cd C:\projects\NGODonation\project\backend
node server.js
```
✅ You should see: "ImpactTrace Server running on port 5000"

### 3️⃣ Start the Expo Development Server
Open another terminal and run:
```bash
cd C:\projects\NGODonation\project\sqlite-demo
npm start
```
✅ You should see a QR code in the terminal

### 4️⃣ Connect Your Phone
**Make sure both your phone and computer are on the SAME Wi-Fi network!**

#### Option A: Scan QR Code (Easiest)
1. Open **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Point camera at the QR code in your terminal
4. Wait for the app to load

#### Option B: Manual URL Entry
1. Open **Expo Go** app
2. Tap **"Enter URL manually"**
3. Enter: `exp://10.91.171.98:8081`
4. Tap **"Connect"**

### 5️⃣ Test the App
- The app should load on your phone
- Try submitting a beneficiary application
- Test the date pickers (they work natively on Android!)
- Check if data is being saved to the backend

## 🔧 Troubleshooting

### Problem: Cannot connect to backend
**Solution:** Update the API URL with your current IP address

1. Get your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update `sqlite-demo/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_HERE:5000/api';
   ```

3. Restart the Expo server

### Problem: QR Code not scanning
- Make sure Expo Go has camera permissions
- Try entering the URL manually instead
- Check that both devices are on the same Wi-Fi

### Problem: App loads but shows network errors
- Check if backend server is running (`node server.js`)
- Verify the IP address in `api.ts` is correct
- Check if your firewall is blocking port 5000

### Problem: Date picker not showing
- Make sure you're running on a physical Android device (not web)
- DateTimePicker requires native functionality

## 📝 Important Notes

### Current Configuration
- **Backend URL:** `http://10.91.171.98:5000/api`
- **Expo Server:** `exp://10.91.171.98:8081`

### If Your IP Address Changes
Your computer's local IP may change when you:
- Reconnect to Wi-Fi
- Restart your router
- Connect to a different network

If this happens, you'll need to:
1. Get your new IP address (`ipconfig`)
2. Update `services/api.ts`
3. Restart the Expo server

### For Development on Web
If you want to develop on web browser (localhost), change the API URL back to:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🚀 Alternative: Build APK for Android

If you want to create a standalone Android app (APK):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure the project
eas build:configure

# Build for Android
eas build -p android --profile preview
```

This will create an APK file you can install directly on your phone without needing Expo Go.

## 📱 Features Working on Android
- ✅ Date/Time pickers (native Android UI)
- ✅ Form validation
- ✅ Backend API calls
- ✅ SQLite database operations
- ✅ Image loading
- ✅ Navigation
- ✅ All native components

## 🎯 Testing Checklist
- [ ] App loads successfully
- [ ] Login/Signup works
- [ ] Can view applications list
- [ ] Can submit new application
- [ ] Date pickers open and work
- [ ] Category/Type pickers work
- [ ] Form validation works
- [ ] Data appears in backend database
- [ ] Navigation between screens works

---

**Need Help?** If you encounter any issues, check:
1. Both devices are on the same Wi-Fi
2. Backend server is running
3. IP address in api.ts is correct
4. Firewall isn't blocking the connection
