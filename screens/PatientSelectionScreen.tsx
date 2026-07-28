import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { ChevronLeft, Search, UserPlus, User, Calendar, ArrowRight } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { Patient } from '../types';

export default function PatientSelectionScreen({ navigation }: any) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New Patient Form
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [chronicAilments, setChronicAilments] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch patients.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newName || !newDob) {
      Alert.alert('Incomplete Fields', 'Please provide name and date of birth.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          name: newName,
          date_of_birth: newDob,
          clinical_notes: chronicAilments,
          // Storing clinical history as JSON in clinical_history column (if exists, or notes)
          clinical_history: {
            medical_conditions: medicalConditions.split(',').map(s => s.trim()),
            chronic_ailments: chronicAilments
          }
        })
        .select()
        .single();

      if (error) throw error;

      navigation.navigate('XRayAnalysis', { patient: data });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.slate} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={28} style={{ marginRight: spacing.xs }} />
          <Typography variant="h3" bold>Select Patient</Typography>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {!isCreating ? (
          <>
            <View style={styles.searchBar}>
              <Search size={20} color={colors.slateMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search clinical records..."
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => setIsCreating(true)}
              >
                <View style={styles.createIcon}>
                  <UserPlus size={24} color={colors.primary} />
                </View>
                <Typography variant="bodyLarge" bold color={colors.primary}>Register New Patient</Typography>
              </TouchableOpacity>

              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <Card key={p.id} variant="outline" style={styles.patientCard}>
                    <TouchableOpacity
                      style={styles.patientInner}
                      onPress={() => navigation.navigate('XRayAnalysis', { patient: p })}
                    >
                      <View style={styles.patientAvatar}>
                        <User size={20} color={colors.slateMuted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="bodyLarge" bold>{p.name}</Typography>
                        <View style={styles.dobRow}>
                          <Calendar size={14} color={colors.textMuted} />
                          <Typography variant="label" color={colors.textMuted}>{p.date_of_birth}</Typography>
                          {p.last_scanned_at && (
                             <>
                               <View style={styles.dotSeparator} />
                               <Typography variant="label" color={colors.primary}>LAST SCAN: {new Date(p.last_scanned_at).toLocaleDateString()}</Typography>
                             </>
                          )}
                        </View>
                      </View>
                      <ArrowRight size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </Card>
                ))
              ) : (
                <Typography color={colors.textMuted} align="center" style={{ marginTop: spacing.xxxl }}>
                  No matching clinical records found.
                </Typography>
              )}
            </ScrollView>
          </>
        ) : (
          <View style={styles.form}>
            <Typography variant="h2" bold>New Clinical Record</Typography>
            <Typography color={colors.textMuted}>Enter patient identification details</Typography>

            <Card variant="elevated" style={styles.formCard}>
              <Typography variant="label" bold color={colors.textSecondary}>FULL NAME</Typography>
              <TextInput
                style={styles.input}
                placeholder="e.g. Benjamin Thorne"
                value={newName}
                onChangeText={setNewName}
              />

              <Typography variant="label" bold color={colors.textSecondary} style={{ marginTop: spacing.lg }}>
                DATE OF BIRTH (YYYY-MM-DD)
              </Typography>
              <TextInput
                style={styles.input}
                placeholder="2012-05-14"
                value={newDob}
                onChangeText={setNewDob}
              />

              <Typography variant="label" bold color={colors.textSecondary} style={{ marginTop: spacing.lg }}>
                MEDICAL CONDITIONS (COMMA SEPARATED)
              </Typography>
              <TextInput
                style={styles.input}
                placeholder="e.g. Asthma, Dental anxiety"
                value={medicalConditions}
                onChangeText={setMedicalConditions}
              />

              <Typography variant="label" bold color={colors.textSecondary} style={{ marginTop: spacing.lg }}>
                CHRONIC AILMENTS / CLINICAL NOTES
              </Typography>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Brief clinical overview..."
                value={chronicAilments}
                onChangeText={setChronicAilments}
                multiline
              />

              <Button
                title="Create & Start Scan"
                onPress={handleCreatePatient}
                loading={loading}
                style={{ marginTop: spacing.xl }}
              />
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsCreating(false)}
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          </View>
        )}
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
    padding: spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientCard: {
    padding: 0,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
    borderColor: colors.border,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
  patientInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgScreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  form: {
    gap: spacing.sm,
  },
  formCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});
