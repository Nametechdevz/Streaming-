import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../utils/theme';
import LiveTVScreen from '../screens/LiveTVScreen';
import MoviesScreen from '../screens/MoviesScreen';
import SeriesScreen from '../screens/SeriesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false
      }}
    >
      <Tab.Screen
        name="LiveTV"
        component={LiveTVScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📡" label="Live TV" focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Movies"
        component={MoviesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎬" label="Movies" focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Series"
        component={SeriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎭" label="Series" focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0d0d15',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 4
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: theme.radius.md,
    minWidth: 60
  },
  tabIconFocused: {
    backgroundColor: 'rgba(229,9,20,0.12)'
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 2
  },
  tabEmojiFocused: {
    // could scale or apply filter
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.textMuted
  },
  tabLabelFocused: {
    color: theme.colors.accent,
    fontWeight: '700'
  }
});
