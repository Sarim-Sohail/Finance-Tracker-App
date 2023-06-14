import { StyleSheet} from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import themeConfig from '../themeConfig'
import Ionicons from '@expo/vector-icons/Ionicons'

const Tab = createBottomTabNavigator()

import Home from './Home'
import Stats from './Stats'
import Profile from './Profile'
import Position from './Position'

const Main = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: themeConfig.primary,
        tabBarLabelStyle: focused => ({
          color: focused ? themeConfig.primary : themeConfig.black
        }),
        tabBarStyle: styles.tabBar
      }}
    >
      <Tab.Screen
        name='Home'
        component={Home}
        options={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          tabBarIcon: tabInfo => {
            return (
              <Ionicons
                name='home'
                style={styles.container}
                size={25}
                color={
                  tabInfo.focused ? themeConfig.primary : themeConfig.black
                }
              />
            )
          }
        }}
      />
      <Tab.Screen
        name='Stats'
        component={Stats}
        options={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          tabBarIcon: tabInfo => {
            return (
              <Ionicons
                name='stats-chart'
                style={styles.container}
                size={25}
                color={
                  tabInfo.focused ? themeConfig.primary : themeConfig.black
                }
              />
            )
          }
        }}
      />
      <Tab.Screen
        name='Location'
        component={Position}
        options={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          tabBarIcon: tabInfo => {
            return (
              <Ionicons
                name='md-map'
                style={styles.container}
                size={25}
                color={
                  tabInfo.focused ? themeConfig.primary : themeConfig.black
                }
              />
            )
          }
        }}
      />
      <Tab.Screen
        name='Profile'
        component={Profile}
        style={styles.header}
        options={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          tabBarIcon: tabInfo => {
            return (
              <Ionicons
                name='person'
                size={25}
                style={styles.container}
                color={
                  tabInfo.focused ? themeConfig.primary : themeConfig.black
                }
              />
            )
          }
        }}
      />
    </Tab.Navigator>
  )
}

export default Main

const styles = StyleSheet.create({
  container: {
    
  },
  tint: {
    color: themeConfig.primary
  },
  tabBar: {
    borderTopWidth: 2, 
    borderTopColor: themeConfig.primary 
  },
  header: {
    backgroundColor: themeConfig.primary
  },
  headerTitle: {
    color: themeConfig.white
  }
})
