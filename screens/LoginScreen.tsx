import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../services/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Incomplete Login', 'Please provide your clinical credentials.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <BrandLogo size={60} />
          </View>
          <Typography variant="h1" bold align="center">DentAge 2.0</Typography>
          <Typography variant="bodyLarge" color={colors.textMuted} align="center">
            Clinical Dental Age Estimation
          </Typography>
        </View>

        <View style={styles.form}>
          <Typography variant="label" color={colors.textSecondary} bold style={styles.inputLabel}>
            WORK EMAIL
          </Typography>
          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.slateMuted} />
            <TextInput
              style={styles.input}
              placeholder="name@clinic.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Typography variant="label" color={colors.textSecondary} bold style={[styles.inputLabel, { marginTop: spacing.xl }]}>
            PASSWORD
          </Typography>
          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.slateMuted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color={colors.slateMuted} /> : <Eye size={20} color={colors.slateMuted} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPasswordScreen')}>
            <Typography variant="label" color={colors.primary} bold>FORGOT PASSWORD?</Typography>
          </TouchableOpacity>

          <Button
            title="Secure Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <View style={styles.footer}>
            <Typography variant="bodyMedium" color={colors.textMuted}>Don't have a clinical account?</Typography>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Typography variant="bodyMedium" color={colors.primary} bold> Sign Up</Typography>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.legal}>
          <Typography variant="label" color={colors.slateMuted} align="center">
            Protected by Clinical-Grade Encryption
          </Typography>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  form: {
    backgroundColor: colors.bgSurface,
    padding: spacing.xl,
    borderRadius: radius.xxl,
    ...shadows.lg,
  },
  inputLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgScreen,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  loginBtn: {
    paddingVertical: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  legal: {
    marginTop: spacing.xxxl,
  },
});
