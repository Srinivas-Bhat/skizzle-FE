import { colors } from '@/constants/theme'
import React from 'react'
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet, View } from 'react-native'

const Loading: React.FC<ActivityIndicatorProps> = ({size ='large', color = colors.primaryDark}) => {
  return (
    <View style={{flex: 1, justifyContent: 'center',alignItems: 'center'}} >
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

export default Loading

const styles = StyleSheet.create({})