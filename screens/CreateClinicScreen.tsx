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
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { ChevronLeft, Building2, MapPin } from 'lucide-react-native';
import { createClinic } from '../api/enterprise';
import { useAuth } from '../provider/AuthProvider';
import { supabase } from '../services/supabase';

export default function CreateClinicScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const handleCreate = async () => {
    if (!name || !location) {
      Alert.alert('Missing Data', 'Please provide a facility name and location.');
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session?.user?.id)
        .single();

      if (profile?.org_id) {
        await createClinic(profile.org_id, name, location);
        Alert.alert('Success', 'Facility created successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
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
          <Typography variant="h3" bold>New Facility</Typography>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Typography variant="h2" bold>Add Diagnostic Center</Typography>
        <Typography color={colors.textMuted}>Register a new clinic facility within your chain.</Typography>

        <Card variant="elevated" style={styles.formCard}>
          <Typography variant="label" bold color={colors.textSecondary}>FACILITY NAME</Typography>
          <View style={styles.inputWrapper}>
             <Building2 size={20} color={colors.slateMuted} />
             <TextInput
               style={styles.input}
               placeholder="e.g. City Orthodontics"
               value={name}
               onChangeText={setName}
             />
          </View>

          <Typography variant="label" bold color={colors.textSecondary} style={{ marginTop: spacing.xl }}>LOCATION</Typography>
          <View style={styles.inputWrapper}>
             <MapPin size={20} color={colors.slateMuted} />
             <TextInput
               style={styles.input}
               placeholder="e.g. Mumbai South, Wing A"
               value={location}
               onChangeText={setLocation}
             />
          </View>

          <Button
            title="Create Facility"
            onPress={handleCreate}
            loading={loading}
            style={{ marginTop: spacing.xxxl }}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bgSurface,
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, padding: spacing.xl },
  formCard: { marginTop: spacing.xxl, padding: spacing.xl },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.xs,
  },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: 18, color: colors.textPrimary },
});
