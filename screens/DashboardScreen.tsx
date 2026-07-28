import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { BottomNav } from '../components/common/BottomNav';
import { TrendChart } from '../components/clinical/TrendChart';
import { useStore } from '../store/useStore';
import { Plus, Bell, Settings, FileText, Activity, Users, Wifi, WifiOff } from 'lucide-react-native';
import { openImagePicker } from '../services/expo/imagePicker';
import { supabase } from '../services/supabase';
import { formatTrendData } from '../utils/chartUtils';
import * as Network from 'expo-network';

export const DashboardScreen = ({ navigation }: any) => {
  const { user, recentAnalyses } = useStore();
  const [trends, setTrends] = React.useState<any>(null);
  const [loadingTrends, setLoadingTrends] = React.useState(true);
  const [isConnected, setIsConnected] = React.useState(true);

  React.useEffect(() => {
    fetchPractitionerTrends();
    checkNetwork();

    const interval = setInterval(checkNetwork, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const checkNetwork = async () => {
    const state = await Network.getNetworkStateAsync();
    setIsConnected(!!state.isConnected);
  };

  const fetchPractitionerTrends = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('population_maturity_trends')
        .select('*')
        .eq('clinic_id', user.clinic_id); // Assuming practitioner sees their clinic's trends

      setTrends(formatTrendData(data || []));
    } catch (error) {
      console.error("Error fetching trends:", error);
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleStartAnalysis = () => {
    navigation.navigate('PatientSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={32} style={{ marginRight: spacing.sm }} />
          <View>
            <Typography variant="label" color={colors.textMuted}>WELCOME BACK</Typography>
            <Typography variant="h2" bold>Dr. {user?.full_name || 'Jenkins'}</Typography>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={[styles.networkStatus, { backgroundColor: isConnected ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)' }]}>
            {isConnected ? <Wifi size={14} color={colors.success} /> : <WifiOff size={14} color={colors.error} />}
            <Typography variant="label" color={isConnected ? colors.success : colors.error} bold>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </Typography>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={24} color={colors.slate} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Settings size={24} color={colors.slate} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Clinical Stats Overview */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="elevated">
            <Activity color={colors.primary} size={20} />
            <Typography variant="h3" bold style={styles.statValue}>24</Typography>
            <Typography variant="label" color={colors.textMuted}>WEEKLY CASES</Typography>
          </Card>
          <Card style={styles.statCard} variant="elevated">
            <Users color={colors.info} size={20} />
            <Typography variant="h3" bold style={styles.statValue}>152</Typography>
            <Typography variant="label" color={colors.textMuted}>TOTAL PATIENTS</Typography>
          </Card>
        </View>

        {/* Quick Action - Start Analysis */}
        <TouchableOpacity
          style={styles.heroAction}
          activeOpacity={0.9}
          onPress={handleStartAnalysis}
        >
          <View style={styles.heroActionContent}>
            <Typography variant="h3" color={colors.textOnPrimary} bold>Start New Analysis</Typography>
            <Typography variant="bodyMedium" color={colors.textOnPrimary} style={{opacity: 0.8}}>
              Upload OPG for AI age estimation
            </Typography>
          </View>
          <View style={styles.heroActionIcon}>
            <Plus color={colors.primary} size={32} />
          </View>
        </TouchableOpacity>

        {/* Practitioner Trends */}
        <TrendChart
          data={trends}
          title="Diagnostic Accuracy Trend"
          loading={loadingTrends}
          height={180}
        />

        {/* Recent Assessments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" bold>Recent Assessments</Typography>
            <TouchableOpacity>
              <Typography variant="label" color={colors.primary} bold>VIEW ALL</Typography>
            </TouchableOpacity>
          </View>

          {recentAnalyses.length > 0 ? (
            recentAnalyses.map((item) => (
              <Card key={item.id} style={styles.analysisCard} variant="outline">
                <View style={styles.analysisIcon}>
                  <FileText color={colors.primary} size={24} />
                </View>
                <View style={styles.analysisDetails}>
                  <Typography variant="bodyLarge" bold>{item.patients?.name || `Case #${item.case_id}`}</Typography>
                  <Typography variant="label" color={colors.textMuted}>
                    {new Date(item.created_at).toLocaleDateString()} • {item.case_id}
                  </Typography>
                </View>
                <View style={styles.analysisResult}>
                  <Typography variant="h3" color={colors.primary} bold>{item.dental_age}y</Typography>
                  <Typography variant="label" color={colors.textMuted}>EST. AGE</Typography>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Typography color={colors.textMuted} align="center">
                No recent assessments found. Start a new one above.
              </Typography>
            </Card>
          )}
        </View>
      </ScrollView>

      <BottomNav activeTab="Home" navigation={navigation} />
    </SafeAreaView>
  );
};

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  iconBtn: {
    padding: spacing.sm,
    backgroundColor: colors.bgScreen,
    borderRadius: radius.md,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  statValue: {
    marginTop: spacing.sm,
  },
  heroAction: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroActionContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  heroActionIcon: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.full,
  },
  section: {
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  analysisIcon: {
    backgroundColor: colors.primaryExtraLight,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  analysisDetails: {
    flex: 1,
  },
  analysisResult: {
    alignItems: 'flex-end',
  },
  emptyCard: {
    padding: spacing.xxxl,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.slateMuted,
    backgroundColor: 'transparent',
  },
});
