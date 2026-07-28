import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors, spacing, typography, radius, shadows } from '../theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { BrandLogo } from '../components/common/BrandLogo';
import { Mail, ChevronLeft, KeyRound } from 'lucide-react-native';
import { supabase } from '../services/supabase';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your clinical email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'app://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Email Sent',
        'A secure reset link has been dispatched to your inbox.',
        [{ text: 'Return to Login', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
          <Typography variant="h3" bold>Recovery</Typography>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <KeyRound color={colors.primary} size={48} />
        </View>

        <Typography variant="h2" bold align="center">Recover Password</Typography>
        <Typography color={colors.textMuted} align="center" style={styles.subtitle}>
          Enter your professional email to receive a secure password restoration link.
        </Typography>

        <Card variant="elevated" style={styles.form}>
          <Typography variant="label" color={colors.textSecondary} bold style={styles.inputLabel}>
            CLINICAL EMAIL
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

          <Button
            title="Dispatch Link"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.submitBtn}
          />
        </Card>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Typography variant="bodyMedium" color={colors.primary} bold>Back to Login</Typography>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
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
  backBtn: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
});
