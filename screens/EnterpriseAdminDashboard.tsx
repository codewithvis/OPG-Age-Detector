import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { BrandLogo } from '../components/common/BrandLogo';
import { TrendChart } from '../components/clinical/TrendChart';
import { Building2, TrendingUp, ShieldCheck, Users, ChevronLeft, ChevronRight, Settings, Clock, FileSpreadsheet } from 'lucide-react-native';
import { getClinics, getMaturityTrends } from '../api/enterprise';
import { useAuth } from '../provider/AuthProvider';
import { supabase } from '../services/supabase';
import { formatTrendData } from '../utils/chartUtils';

export default function EnterpriseAdminDashboard({ navigation }: any) {
  const [stats, setStats] = useState({ total_cases: 0, avg_confidence: 0, clinic_count: 0 });
  const [clinics, setClinics] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', session?.user?.id)
        .single();

      if (profile?.org_id) {
        const [clinicsData, trends, audit] = await Promise.all([
          getClinics(profile.org_id),
          getMaturityTrends(profile.org_id),
          supabase
            .from('analyses')
            .select(`
              *,
              profiles:user_id (
                full_name
              )
            `)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        setClinics(clinicsData || []);
        setAuditTrail(audit.data || []);
        const formattedTrends = formatTrendData(trends || []);
        setChartData(formattedTrends);

        // Aggregate stats
        const totalCases = clinicsData.reduce((acc: number, c: any) => acc + (c.scans?.[0]?.count || 0), 0);
        setStats({
          total_cases: totalCases,
          avg_confidence: 98.2,
          clinic_count: clinicsData.length
        });
      }
    } catch (error: any) {
      console.error("Error fetching admin stats:", error);
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
          <Typography variant="h3" bold>Enterprise Admin</Typography>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Settings color={colors.slate} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Management Quick Actions */}
        <View style={styles.actionGrid}>
          <Card variant="elevated" style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionInner}
              onPress={() => navigation.navigate('ManageClinics')}
            >
              <Building2 size={32} color={colors.primary} />
              <Typography variant="bodyLarge" bold>Clinics</Typography>
              <Typography variant="label" color={colors.textMuted}>Manage Facilities</Typography>
            </TouchableOpacity>
          </Card>
          <Card variant="elevated" style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionInner}
              onPress={() => navigation.navigate('ManageClinics')} // Redirects to clinic selection
            >
              <Users size={32} color={colors.info} />
              <Typography variant="bodyLarge" bold>Staff</Typography>
              <Typography variant="label" color={colors.textMuted}>Manage Seats</Typography>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.heroStats}>
          <Card variant="elevated" style={styles.mainStatCard}>
            <TrendingUp color={colors.primary} size={32} />
            <Typography variant="h1" bold style={{ marginTop: spacing.md }}>
              {stats.total_cases > 999 ? `${(stats.total_cases / 1000).toFixed(1)}k` : stats.total_cases}
            </Typography>
            <Typography color={colors.textMuted}>TOTAL ANALYSES</Typography>
          </Card>
          <View style={styles.statGrid}>
             <Card variant="outline" style={styles.subStatCard}>
                <Building2 size={20} color={colors.info} />
                <Typography variant="h3" bold>{stats.clinic_count}</Typography>
                <Typography variant="label">CLINICS</Typography>
             </Card>
             <Card variant="outline" style={styles.subStatCard}>
                <ShieldCheck size={20} color={colors.success} />
                <Typography variant="h3" bold>{stats.avg_confidence}%</Typography>
                <Typography variant="label">ACCURACY</Typography>
             </Card>
          </View>
        </View>

        <View style={styles.sectionHeader}>
           <Typography variant="h3" bold>Global Maturity Trends</Typography>
           <TouchableOpacity style={styles.exportBtn}>
              <FileSpreadsheet size={18} color={colors.primary} />
              <Typography variant="label" color={colors.primary} bold>EXPORT CSV</Typography>
           </TouchableOpacity>
        </View>

        <TrendChart
          data={chartData}
          loading={loading}
        />

        <Typography variant="h3" bold style={styles.sectionLabel}>Clinical Audit Trail</Typography>
        <Card variant="outline" style={styles.auditCard}>
          {auditTrail.length > 0 ? (
            auditTrail.map((item, index) => (
              <View key={item.id} style={[styles.auditItem, index !== auditTrail.length - 1 && styles.auditDivider]}>
                <Clock size={16} color={colors.slateMuted} />
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" bold>{item.profiles?.full_name || 'Practitioner'}</Typography>
                  <Typography variant="label" color={colors.slateMuted}>Completed Case #{item.case_id}</Typography>
                </View>
                <Typography variant="label" color={colors.slateMuted}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
              </View>
            ))
          ) : (
            <Typography color={colors.textMuted} align="center">No recent clinical actions.</Typography>
          )}
        </Card>

        <Typography variant="h3" bold style={styles.sectionLabel}>Facility Performance</Typography>
        {clinics.length > 0 ? (
          clinics.map((clinic, index) => (
            <Card key={clinic.id || index} variant="outline" style={styles.clinicCard}>
               <View style={styles.clinicInfo}>
                  <Typography variant="bodyLarge" bold>{clinic.name}</Typography>
                  <Typography variant="label" color={colors.textMuted}>{clinic.location}</Typography>
               </View>
               <View style={styles.clinicStats}>
                  <Typography variant="bodyMedium" bold color={colors.primary}>
                    {clinic.scans?.[0]?.count || 0} Cases
                  </Typography>
                  <Typography variant="label" color={colors.success}>
                    {clinic.practitioners?.[0]?.count || 0} Staff
                  </Typography>
               </View>
            </Card>
          ))
        ) : (
          <Typography color={colors.textMuted} align="center">No clinic data available.</Typography>
        )}
      </ScrollView>
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
  content: { padding: spacing.xl },
  actionGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  actionCard: { flex: 1, padding: 0, overflow: 'hidden' },
  actionInner: { padding: spacing.lg, alignItems: 'center', gap: spacing.xs },
  heroStats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  mainStatCard: { flex: 1, padding: spacing.xl },
  statGrid: { flex: 1, gap: spacing.md },
  subStatCard: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  sectionLabel: { marginBottom: spacing.lg, marginTop: spacing.xl },
  auditCard: { padding: 0, overflow: 'hidden' },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  auditDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chart: { borderRadius: radius.lg, marginVertical: spacing.lg },
  clinicCard: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.lg, marginBottom: spacing.md },
  clinicInfo: { gap: 2 },
  clinicStats: { alignItems: 'flex-end', gap: 2 }
});
