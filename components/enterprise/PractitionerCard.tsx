import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors, spacing, radius } from '../../theme';
import { Typography } from '../common/Typography';
import { Card } from '../common/Card';
import { User, ShieldCheck } from 'lucide-react-native';
import { DEFAULT_PROFILE_PHOTO } from '../../constants/constants';

interface PractitionerCardProps {
  practitioner: any;
}

export const PractitionerCard: React.FC<PractitionerCardProps> = ({ practitioner }) => {
  return (
    <Card variant="outline" style={styles.container}>
      <View style={styles.avatar}>
        {practitioner.profile_photo_url ? (
          <Image source={{ uri: practitioner.profile_photo_url }} style={styles.image} />
        ) : (
          <User size={24} color={colors.slateMuted} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Typography variant="bodyLarge" bold>{practitioner.full_name}</Typography>
        <Typography variant="label" color={colors.textMuted}>{practitioner.email_id}</Typography>

        <View style={styles.licenseRow}>
          <ShieldCheck size={14} color={colors.primary} />
          <Typography variant="label" color={colors.primary} bold>
            {practitioner.dental_license_student_id || 'LICENSE PENDING'}
          </Typography>
        </View>
      </View>

      <View style={styles.roleBadge}>
         <Typography variant="label" color={colors.primaryDark} bold>
           {practitioner.role === 'practitioner' ? 'PRACTITIONER' : 'CLINIC ADMIN'}
         </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.bgScreen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.primaryExtraLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
