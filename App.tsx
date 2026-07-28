import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from './services/supabase';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import { DashboardScreen as HomeScreen } from './screens/DashboardScreen';
import { AnalysisView as XRayAnalysisScreen } from './screens/AnalysisView';
import StageClassificationScreen from './screens/StageClassificationScreen';
import ResultsDashboardScreen from './screens/ResultsDashboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import DeleteAccountScreen from './screens/DeleteAccountScreen';
import PatientSelectionScreen from './screens/PatientSelectionScreen';
import EnterpriseAdminDashboard from './screens/EnterpriseAdminDashboard';
import ManageClinicsScreen from './screens/ManageClinicsScreen';
import CreateClinicScreen from './screens/CreateClinicScreen';
import ManagePractitionersScreen from './screens/ManagePractitionersScreen';

// Providers
import AuthProvider from './provider/AuthProvider';
import QueryProvider from './provider/QueryProvider';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['app://'],
  config: {
    screens: {
      ForgotPasswordScreen: 'reset-password',
      Login: 'login',
      SignUp: 'signup',
      Home: 'home',
    },
  },
};

export default function App() {
  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;

      const hash = url.split('#')[1];
      if (!hash) return;

      const params = Object.fromEntries(
        hash.split('&').map((param) => param.split('='))
      );

      const access_token = params.access_token;
      const refresh_token = params.refresh_token;

      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
      }
    };

    Linking.getInitialURL().then(handleDeepLink);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueryProvider>
          <NavigationContainer linking={linking}>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom',
                contentStyle: { backgroundColor: '#F5F7F8' }
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="PatientSelection" component={PatientSelectionScreen} />
              <Stack.Screen name="XRayAnalysis" component={XRayAnalysisScreen} />
              <Stack.Screen name="StageClassification" component={StageClassificationScreen} />
              <Stack.Screen name="Results" component={ResultsDashboardScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="EnterpriseAdmin" component={EnterpriseAdminDashboard} />
              <Stack.Screen name="ManageClinics" component={ManageClinicsScreen} />
              <Stack.Screen name="CreateClinic" component={CreateClinicScreen} />
              <Stack.Screen name="ManagePractitioners" component={ManagePractitionersScreen} />
              <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
              <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
              <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </QueryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
