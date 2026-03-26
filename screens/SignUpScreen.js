import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

const ASSETS = {
  toothIcon: 'https://www.figma.com/api/mcp/asset/49d306fa-08c4-463e-bc96-c5d169afefaa',
};

import { supabase } from '../services/supabase';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [password, setPassword] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateData = async () => {
      const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!fullName.trim() || !email.trim() || !password.trim() || !licenseId.trim()) {
        Alert.alert("All fields are required.");
        return false;
      }
  
      if (password.length < 8) {
        Alert.alert("Password too short", "Password must be at least 8 characters.");
        return false;
      }
  
      if (!passwordRegex.test(password)) {
        Alert.alert("Invalid Password", "Password must include letters, numbers, and special characters.");
        return false;
      }
  
      if (!emailRegex.test(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return false;
      }
  
      return true;
    };


  const handleSignup = async () => {
    const validatedData = validateData();
    if (!validateData) {
      setErrorMsg('Please fill out all fields.');
      return;
    }

    if (!tosAccepted){
      setErrorMsg("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    const user = data.user;

    if (user) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: fullName,
          dental_license_student_id: licenseId,
          email_id: email,
          profile_photo_url: DEFAULT_PROFILE_PHOTO
        });
        
      if (insertError) {
        Toast.show({
          type: 'error', // 'success' | 'error' | 'info'
          text1: 'Account creation unsuccessful',
          position: 'bottom', // or 'bottom'
          visibilityTime: 1500
        });
      }
      else {
        Toast.show({
          type: 'success', // 'success' | 'error' | 'info'
          text1: 'Account creation successful',
          position: 'bottom', // or 'bottom'
          visibilityTime: 1500
        });
      }
    }
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Create patient profile indirectly or just wait
      navigation?.replace('Home');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgScreen} />

      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={{ uri: ASSETS.toothIcon }} style={styles.brandIcon} />
          <Text style={styles.brandName}>OPG Age Calculator</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative vertical line (right side accent) */}
        <View style={styles.decorLine} />

        {/* Sign Up Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join DentaAge</Text>
          <Text style={styles.cardSubtitle}>
            Create your professional{'\n'}diagnostic account
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {errorMsg ? <Text style={{color: 'red', marginBottom: 8}}>{errorMsg}</Text> : null}

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputEmoji}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Dr. Sarah Jenkins"
                  placeholderTextColor={colors.textPlaceholder}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputEmoji}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="sarah.j@clinic.com"
                  placeholderTextColor={colors.textPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* License/ID */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dental License / Student ID</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputEmoji}>🪪</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DDS-99283-X"
                  placeholderTextColor={colors.textPlaceholder}
                  value={licenseId}
                  onChangeText={setLicenseId}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Create Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputEmoji}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* TOS Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setTosAccepted(!tosAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, tosAccepted && styles.checkboxActive]} />
              <Text style={styles.checkboxLabel}>
                I agree to the{' '}
                <Text style={styles.checkboxLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.checkboxLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, !tosAccepted && styles.submitButtonDisabled]}
              activeOpacity={0.85}
              disabled={!tosAccepted || loading}
              onPress={handleSignup}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
              <Text style={styles.submitButtonArrow}> →</Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerCopy}>
            © 2024 Clinical Sanctuary Dental Systems.{'\n'}Precision Diagnostic Tool.
          </Text>
          <View style={styles.footerLinks}>
            {['Privacy Policy', 'Terms of Service', 'Support'].map((link) => (
              <TouchableOpacity key={link}>
                <Text style={styles.footerLink}>{link}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  header: {
    height: 64,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247,250,253,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  decorLine: {
    position: 'absolute',
    right: 40,
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: colors.primaryExtraLight,
    opacity: 0.6,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 33,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  inputEmoji: {
    fontSize: 15,
    marginRight: 10,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    padding: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgInput,
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  checkboxLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginTop: 8,
    ...shadows.button,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  submitButtonArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signinText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  signinLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    marginTop: 24,
    backgroundColor: '#f1f4f7',
    borderRadius: radius.md,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  footerCopy: {
    fontSize: 12,
    color: colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    fontSize: 12,
    color: colors.textDisabled,
    opacity: 0.8,
  },
});
