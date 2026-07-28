/**
 * Utilities for formatting Supabase trend data for react-native-chart-kit
 */

export interface RawTrendData {
  month: string;
  age_variance: number;
  case_count: number;
}

export const formatTrendData = (rawData: RawTrendData[]) => {
  if (!rawData || rawData.length === 0) {
    return {
      labels: ["No Data"],
      datasets: [{ data: [0] }],
    };
  }

  // Sort by month
  const sortedData = [...rawData].sort((a, b) =>
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  const labels = sortedData.map(d => {
    const date = new Date(d.month);
    return date.toLocaleString('default', { month: 'short' });
  });

  const varianceData = sortedData.map(d => parseFloat(d.age_variance.toFixed(2)));
  const countData = sortedData.map(d => d.case_count);

  return {
    labels,
    datasets: [
      {
        data: varianceData,
        color: (opacity = 1) => `rgba(0, 121, 107, ${opacity})`, // Primary
        strokeWidth: 2
      }
    ],
    countData, // For dual-purpose toggle
  };
};
