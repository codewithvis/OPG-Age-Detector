import React from 'react';
import { View, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, radius, typography } from '../../theme';
import { Typography } from '../common/Typography';

const screenWidth = Dimensions.get("window").width;

interface TrendChartProps {
  data: any;
  title?: string;
  loading?: boolean;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  loading,
  height = 220
}) => {
  if (loading) {
    return (
      <View style={[styles.container, { height, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const hasData = data && data.labels && data.labels[0] !== "No Data";

  return (
    <View style={styles.container}>
      {title && <Typography variant="label" bold color={colors.textMuted} style={styles.title}>{title}</Typography>}

      {!hasData ? (
        <View style={[styles.emptyContainer, { height }]}>
          <Typography color={colors.slateMuted} align="center">
            Insufficient clinical data to generate trends.
          </Typography>
        </View>
      ) : (
        <LineChart
          data={data}
          width={screenWidth - spacing.xl * 2}
          height={height}
          chartConfig={{
            backgroundColor: colors.bgSurface,
            backgroundGradientFrom: colors.bgSurface,
            backgroundGradientTo: colors.bgSurface,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 121, 107, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(69, 90, 100, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.primary
            }
          }}
          bezier
          style={styles.chart}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chart: {
    borderRadius: radius.lg,
  },
  emptyContainer: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.xl,
  }
});
