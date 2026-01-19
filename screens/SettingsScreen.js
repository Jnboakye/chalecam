import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FAQIcon } from '../components/Icons';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { mode: themeMode, updateThemeMode, toggleTheme, colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const displayName =
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Guest';
  const handle =
    user?.username ||
    (user?.email ? `@${user.email.split('@')[0]}` : '@guest');

  const handleSupportPress = (type) => {
    Alert.alert(
      'Coming soon',
      `${type} support will be available in a future update.`
    );
  };

  const handleTermsPress = () => {
    Alert.alert(
      'Terms of use',
      'We will add a detailed Terms of Use screen here later.'
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Privacy',
      'We will add a detailed Privacy Policy screen here later.'
    );
  };

  const handleBusinessPress = () => {
    Alert.alert(
      'Business inquiries',
      'We will add a business inquiries contact form here later.'
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Account deletion',
      'We will add a secure account deletion flow here later.'
    );
  };

  const handleLogout = async () => {
    const result = await logout();
    if (!result?.success) {
      Alert.alert('Logout', result?.error || 'Authentication is not configured yet.');
      return;
    }
    Alert.alert('Logged out', 'You have been logged out successfully.');
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    headerTitle: { color: colors.text },
    sectionLabel: { color: colors.textSecondary },
    accountCard: { backgroundColor: colors.card },
    accountName: { color: colors.text },
    accountHandle: { color: colors.textSecondary },
    sectionCard: { backgroundColor: colors.card },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Fixed Header */}
      <View 
        style={[
          styles.headerContainer,
          { 
            backgroundColor: colors.background,
            paddingTop: insets.top + 10,
          }
        ]}
      >
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Settings</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 100 } // Add space for tab bar + safe area
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Card */}
        <TouchableOpacity style={[styles.accountCard, { backgroundColor: colors.card }]} activeOpacity={0.8}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={[styles.accountName, { color: colors.text }]}>{displayName}</Text>
            <Text style={[styles.accountHandle, { color: colors.textSecondary }]}>{handle}</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        {/* Support Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SUPPORT</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <SettingsRow
            icon="💬"
            label="Text"
            onPress={() => handleSupportPress('Text')}
            colors={colors}
          />
          <SettingsRow
            icon="✉️"
            label="Email"
            onPress={() => handleSupportPress('Email')}
            colors={colors}
          />
          <SettingsRow
            icon={<FAQIcon size={20} color={colors.primary} />}
            label="FAQ"
            onPress={() => handleSupportPress('FAQ')}
            isLast
            colors={colors}
          />
        </View>

        {/* Display Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DISPLAY</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <SettingsRow
            icon="🌓"
            label={themeMode === 'dark' || (themeMode === 'system' && isDark) ? 'Light mode' : 'Dark mode'}
            onPress={toggleTheme}
            rightLabel={themeMode === 'system' ? (isDark ? 'Dark' : 'Light') : (themeMode === 'dark' ? 'Dark' : 'Light')}
            colors={colors}
          />
          <SettingsRow
            icon="🌙"
            label="System"
            onPress={() => updateThemeMode('system')}
            isSelected={themeMode === 'system'}
            isLast
            colors={colors}
          />
        </View>

        {/* Data Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <SettingsRow
            icon="📄"
            label="Terms of use"
            onPress={handleTermsPress}
            colors={colors}
          />
          <SettingsRow
            icon="🔒"
            label="Privacy"
            onPress={handlePrivacyPress}
            isLast
            colors={colors}
          />
        </View>

        {/* Get in touch Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>GET IN TOUCH</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <SettingsRow
            icon="✨"
            label="Business inquiries"
            onPress={handleBusinessPress}
            isLast
            colors={colors}
          />
        </View>

        {/* Account actions */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT ACTIONS</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <SettingsRow
            icon="🚪"
            label="Logout"
            onPress={handleLogout}
            isDestructive
            colors={colors}
          />
          <SettingsRow
            icon="🗑️"
            label="Delete account"
            onPress={handleDeleteAccount}
            isDestructive
            isLast
            colors={colors}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const SettingsRow = ({
  icon,
  label,
  onPress,
  isLast,
  isDestructive,
  isSelected,
  rightLabel,
  colors,
}) => (
  <TouchableOpacity
    style={[
      styles.row,
      { borderBottomColor: colors.border },
      isLast && styles.rowLast,
    ]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.rowLeft}>
      <View style={styles.rowIconContainer}>
        {typeof icon === 'string' ? (
          <Text style={styles.rowIcon}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: colors.text },
          isDestructive && styles.rowLabelDestructive,
          isSelected && { color: colors.primary, fontWeight: '700' },
        ]}
      >
        {label}
      </Text>
    </View>
    {rightLabel ? (
      <View style={[styles.rightBadge, { backgroundColor: colors.surface }]}>
        <Text style={[styles.rightBadgeText, { color: colors.text }]}>{rightLabel}</Text>
      </View>
    ) : (
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderRadius: 24,
    padding: 16,
    marginBottom: 32,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountHandle: {
    color: '#9e9e9e',
    fontSize: 14,
  },
  sectionLabel: {
    color: '#6e6e6e',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: '#151515',
    borderRadius: 24,
    marginBottom: 28,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#282828',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowIcon: {
    fontSize: 18,
  },
  rowLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  rowLabelDestructive: {
    color: '#ff4d4f',
  },
  rowLabelSelected: {
    color: '#c084f5',
    fontWeight: '700',
  },
  rightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#262626',
  },
  rightBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    color: '#6e6e6e',
    fontSize: 20,
    marginLeft: 8,
  },
});

export default SettingsScreen;

