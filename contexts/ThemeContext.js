import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Update isDark based on themeMode and system preference
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  // Save theme preference
  const updateThemeMode = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';
    await updateThemeMode(newMode);
  };

  const theme = {
    mode: themeMode,
    isDark,
    colors: {
      // Light mode colors
      primary: isDark ? '#38BDF8' : '#0EA5E9',      // Sky blue (light) / Lighter blue (dark)
      secondary: isDark ? '#2DD4BF' : '#14B8A6',    // Teal (light) / Lighter teal (dark)
      background: isDark ? '#0F172A' : '#FFFFFF',
      surface: isDark ? '#1E293B' : '#F8FAFC',
      card: isDark ? '#1E293B' : '#FFFFFF',
      text: isDark ? '#F1F5F9' : '#0F172A',
      textSecondary: isDark ? '#94A3B8' : '#64748B',
      border: isDark ? '#334155' : '#E2E8F0',
      success: isDark ? '#4ADE80' : '#22C55E',
      error: isDark ? '#F87171' : '#EF4444',
      warning: isDark ? '#FBBF24' : '#F59E0B',
      info: isDark ? '#38BDF8' : '#0EA5E9',
      isDark, // Include isDark in colors for convenience
    },
    updateThemeMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
