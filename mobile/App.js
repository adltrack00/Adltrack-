import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Auth Screens
import LandingScreen from './src/screens/LandingScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import AuthScreen from './src/screens/AuthScreen';

// Caregiver Navigator & Screens
import CaregiverTabs from './src/navigation/CaregiverTabs';
import AICopilotScreen from './src/screens/caregiver/AICopilotScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isDark, theme } = useTheme();

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.background },
          }}
        >
          {!isAuthenticated ? (
            // Auth Stack
            <>
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              <Stack.Screen name="Auth" component={AuthScreen} />
            </>
          ) : (
            // Main App Stack based on role
            <>
              {user?.role === 'caregiver' && (
                <>
                  <Stack.Screen name="CaregiverDashboard" component={CaregiverTabs} />
                  <Stack.Screen 
                    name="AICopilot" 
                    component={AICopilotScreen}
                    options={{
                      presentation: 'modal',
                    }}
                  />
                </>
              )}
              {user?.role === 'family' && (
                <Stack.Screen name="FamilyDashboard" component={CaregiverTabs} />
              )}
              {user?.role === 'agency' && (
                <Stack.Screen name="AgencyDashboard" component={CaregiverTabs} />
              )}
              {/* Fallback to Caregiver if role not set */}
              {!user?.role && (
                <Stack.Screen name="CaregiverDashboard" component={CaregiverTabs} />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
