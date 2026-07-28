import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { ChevronLeft, Plus, Building2, MapPin, Users, Activity, ChevronRight } from 'lucide-react-native';
import { getClinics } from '../api/enterprise';
import { useAuth } from '../provider/AuthProvider';
import { supabase } from '../services/supabase';

export default function ManageClinicsScreen({ navigation }: any) {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session?.user?.id)
        .single();

      if (profile?.org_id) {
        const data = await getClinics(profile.org_id);
        setClinics(data || []);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch facilities.');
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
          <Typography variant="h3" bold>Manage Facilities</Typography>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Button
          title="Add New Clinic"
          onPress={() => navigation.navigate('CreateClinic')}
          icon={<Plus size={20} color={colors.white} />}
          style={{ marginBottom: spacing.xl }}
        />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {clinics.length > 0 ? (
              clinics.map((clinic) => (
                <Card key={clinic.id} variant="elevated" style={styles.clinicCard}>
                  <TouchableOpacity
                    style={styles.clinicInner}
                    onPress={() => navigation.navigate('ManagePractitioners', { clinic })}
                  >
                    <View style={styles.clinicHeader}>
                      <View style={styles.iconContainer}>
                        <Building2 size={24} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="h3" bold>{clinic.name}</Typography>
                        <View style={styles.locationRow}>
                          <MapPin size={14} color={colors.textMuted} />
                          <Typography variant="label" color={colors.textMuted}>{clinic.location}</Typography>
                        </View>
                      </View>
                      <ChevronRight size={20} color={colors.slateMuted} />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Users size={16} color={colors.primary} />
                        <Typography variant="bodyMedium" bold>{clinic.practitioners?.[0]?.count || 0}</Typography>
                        <Typography variant="label" color={colors.textMuted}>Staff</Typography>
                      </View>
                      <View style={styles.statItem}>
                        <Activity size={16} color={colors.info} />
                        <Typography variant="bodyMedium" bold>{clinic.scans?.[0]?.count || 0}</Typography>
                        <Typography variant="label" color={colors.textMuted}>Scans</Typography>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))
            ) : (
              <Card variant="outline" style={styles.emptyCard}>
                <Typography color={colors.textMuted} align="center">
                  No facilities found. Create your first clinic to start managing practitioners.
                </Typography>
              </Card>
            )}
          </ScrollView>
        )}
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
  clinicCard: { padding: 0, marginBottom: spacing.lg, overflow: 'hidden' },
  clinicInner: { padding: spacing.lg },
  clinicHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.xxl },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emptyCard: { padding: spacing.xxxl, borderStyle: 'dashed' },
});
