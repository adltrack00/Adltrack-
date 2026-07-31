import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const colors = {
  light: {
    background: '#ffffff',
    card: '#f5f5f7',
    cardHover: '#ebebed',
    text: '#1c1c1e',
    textSecondary: '#6e6e73',
    border: '#e5e5ea',
    primary: '#00c896',
    primaryHover: '#00a87a',
    danger: '#ff4757',
    dangerLight: '#fff0f1',
  },
  dark: {
    background: '#000000',
    card: '#18181f',
    cardHover: '#1e1e28',
    text: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.50)',
    border: 'rgba(255,255,255,0.08)',
    primary: '#00c896',
    primaryHover: '#00a87a',
    danger: '#ff4757',
    dangerLight: 'rgba(255,71,87,0.12)',
    // Extra premium tokens
    layer1: '#0a0a0f',
    layer2: '#111118',
    layer3: '#18181f',
    layer4: '#1e1e28',
    glow: 'rgba(0,200,150,0.25)',
    glowViolet: 'rgba(111,94,245,0.20)',
    brandGradient: ['#00c896', '#00a87a'],
    violet: '#6f5ef5',
    warning: '#ffa733',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem('theme');
      if (stored !== null) {
        setIsDark(stored === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const setDarkMode = async (dark) => {
    setIsDark(dark);
    await AsyncStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const theme = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
