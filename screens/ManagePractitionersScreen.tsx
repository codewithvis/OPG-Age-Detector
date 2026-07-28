import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { ChevronLeft, Search, UserPlus, X } from 'lucide-react-native';
import { PractitionerCard } from '../components/enterprise/PractitionerCard';
import { getPractitionersByClinic, searchPractitioner, assignPractitionerToClinic } from '../api/enterprise';

export default function ManagePractitionersScreen({ route, navigation }: any) {
  const { clinic } = route.params;
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchPractitioners();
  }, []);

  const fetchPractitioners = async () => {
    try {
      const data = await getPractitionersByClinic(clinic.id);
      setPractitioners(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch practitioners.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const data = await searchPractitioner(searchQuery);
      setSearchResult(data);
    } catch (error: any) {
      Alert.alert('Not Found', 'No practitioner found with this ID or Email.');
    } finally {
      setSearching(false);
    }
  };

  const handleAssign = async () => {
    if (!searchResult) return;
    try {
      setLoading(true);
      await assignPractitionerToClinic(searchResult.id, clinic.id, clinic.org_id);
      Alert.alert('Success', `${searchResult.full_name} has been assigned to ${clinic.name}.`);
      setSearchResult(null);
      setSearchQuery('');
      fetchPractitioners();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to assign practitioner.');
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
          <Typography variant="h3" bold>Manage Staff</Typography>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.clinicDetails}>
          <Typography variant="label" color={colors.primary} bold>TARGET FACILITY</Typography>
          <Typography variant="h2" bold>{clinic.name}</Typography>
        </View>

        <View style={styles.searchSection}>
          <Typography variant="label" bold color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
            SEARCH PRACTITIONER (ID / EMAIL)
          </Typography>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. DDS-99283-X"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              {searching ? <ActivityIndicator size="small" color={colors.white} /> : <Search size={20} color={colors.white} />}
            </TouchableOpacity>
          </View>
        </View>

        {searchResult && (
          <Card variant="elevated" style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Typography variant="label" bold color={colors.success}>PRACTITIONER FOUND</Typography>
              <TouchableOpacity onPress={() => setSearchResult(null)}>
                <X size={20} color={colors.slateMuted} />
              </TouchableOpacity>
            </View>
            <PractitionerCard practitioner={searchResult} />
            <Button
              title={`Assign to ${clinic.name}`}
              onPress={handleAssign}
              icon={<UserPlus size={20} color={colors.white} />}
            />
          </Card>
        )}

        <Typography variant="h3" bold style={styles.sectionLabel}>Active Staff Members</Typography>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {practitioners.length > 0 ? (
              practitioners.map((p) => (
                <PractitionerCard key={p.id} practitioner={p} />
              ))
            ) : (
              <Typography color={colors.textMuted} align="center" style={{ marginTop: spacing.xl }}>
                No practitioners assigned to this clinic yet.
              </Typography>
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
  clinicDetails: { marginBottom: spacing.xl },
  searchSection: { marginBottom: spacing.xl },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 16 },
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: { padding: spacing.lg, marginBottom: spacing.xl, borderColor: colors.success, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionLabel: { marginBottom: spacing.lg },
});
