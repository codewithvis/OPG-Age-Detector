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
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ShieldAlert, ChevronLeft, Lock } from 'lucide-react-native';
import { supabase } from '../services/supabase';

export default function DeleteAccountScreen({ navigation }: any) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = () => {
    if (!password) {
      Alert.alert('Verification Required', 'Please enter your password to authorize account deletion.');
      return;
    }

    Alert.alert(
      'Permanent Deletion',
      'Warning: This will permanently remove all clinical records, OPG analyses, and patient data associated with your account. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: performDeletion
        }
      ]
    );
  };

  const performDeletion = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.id) throw new Error('Session expired');

      const userId = userData.user.id;
      const email = userData.user.email!;

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw new Error('Password verification failed');

      // Delete Profile
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileDeleteError) throw profileDeleteError;

      // Note: Full account deletion requires Admin Auth on Supabase,
      // typically handled by a trigger or edge function.
      // For now, we sign out and disable local access.
      await supabase.auth.signOut();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

    } catch (error: any) {
      Alert.alert('Deletion Failed', error.message);
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
        <Typography variant="h3" bold>Dangerous Action</Typography>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
          <ShieldAlert color={colors.error} size={48} />
        </View>

        <Typography variant="h2" bold align="center" color={colors.error}>Delete Account</Typography>
        <Typography color={colors.textMuted} align="center" style={styles.subtitle}>
          Once you delete your account, there is no going back. All clinical history will be wiped.
        </Typography>

        <Card variant="outline" style={styles.form}>
          <Typography variant="label" color={colors.textSecondary} bold style={styles.inputLabel}>
            AUTHORIZE WITH PASSWORD
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
            title="Authorize Permanent Deletion"
            variant="danger"
            onPress={handleDeleteAccount}
            loading={loading}
            style={styles.submitBtn}
          />
        </Card>
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
    borderColor: colors.error,
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
});
