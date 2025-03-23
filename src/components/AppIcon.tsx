import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';

interface AppIconProps {
  type?: 'material' | 'fontawesome' | 'ionicons';
  name: string;
  size?: number;
  color?: string;
}

const AppIcon: React.FC<AppIconProps> = ({ 
  type = 'material', 
  name, 
  size = 24, 
  color = '#000' 
}) => {
  try {
    switch (type) {
      case 'material':
        return <MaterialIcons name={name} size={size} color={color} />;
      case 'fontawesome':
        return <FontAwesome name={name} size={size} color={color} />;
      case 'ionicons':
        return <Ionicons name={name} size={size} color={color} />;
      default:
        return <MaterialIcons name={name} size={size} color={color} />;
    }
  } catch (error) {
    console.error(`Icon error: ${error}`);
    return (
      <View style={[styles.fallbackIcon, { width: size, height: size }]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.5, color }]}>?</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  fallbackIcon: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontWeight: 'bold',
  },
});

export default AppIcon; 