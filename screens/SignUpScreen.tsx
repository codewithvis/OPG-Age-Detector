import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadows } from '../theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { BrandLogo } from '../components/common/BrandLogo';
import { User, Mail, Lock, CreditCard, ChevronLeft } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import Toast from 'react-native-toast-message';
import { DEFAULT_PROFILE_PHOTO } from '../constants/constants';

export default function SignUpScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !licenseId) {
      Alert.alert('Missing Fields', 'Please fill in all clinical credentials.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            dental_license_student_id: licenseId,
            email_id: email,
            profile_photo_url: DEFAULT_PROFILE_PHOTO
          });

        if (insertError) throw insertError;

        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Welcome to DentAge 2.0',
        });
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.slate} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={28} style={{ marginRight: spacing.xs }} />
          <Typography variant="h3" bold>Create Account</Typography>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Typography variant="h2" bold>Clinical Onboarding</Typography>
          <Typography color={colors.textMuted}>Register your practitioner credentials</Typography>
        </View>

        <Card variant="elevated" style={styles.form}>
          <Typography variant="label" color={colors.textSecondary} bold style={styles.inputLabel}>
            FULL NAME
          </Typography>
          <View style={styles.inputContainer}>
            <User size={20} color={colors.slateMuted} />
            <TextInput
              style={styles.input}
              placeholder="Dr. Sarah Jenkins"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Typography variant="label" color={colors.textSecondary} bold style={styles.inputLabel}>
            WORK EMAIL
          </Typography>
          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.slateMuted} />
            <TextInput
              style={styles.input}
              placeholder="sarah.j@clinic.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Typography variant="label" color={colors.textSecondary} bold style={styles.inputLabel}>
            LICENSE / STUDENT ID
          </Typography>
          <View style={styles.inputContainer}>
            <CreditCard size={20} color={colors.slateMuted} />
            <TextInput
              style={styles.input}
              placeholder="DDS-99283-X"
              value={licenseId}
              onChangeText={setLicenseId}
            />
          </View>

          <Typography variant="label" color={colors.textSecondary} bold style={styles.inputLabel}>
            SECURE PASSWORD
          </Typography>
          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.slateMuted} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title="Register Credentials"
            onPress={handleSignup}
            loading={loading}
            style={styles.submitBtn}
          />
        </Card>

        <View style={styles.footer}>
          <Typography variant="bodyMedium" color={colors.textMuted}>Already registered?</Typography>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Typography variant="bodyMedium" color={colors.primary} bold> Sign In</Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bgSurface,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  intro: {
    marginBottom: spacing.xxl,
    gap: spacing.xs,
  },
  form: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  inputLabel: {
    marginBottom: -spacing.md,
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
  submitBtn: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
});
