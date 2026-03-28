import React from 'react'
import { StyleSheet, View } from 'react-native'

export function WireframeSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>
}

const styles = StyleSheet.create({
  section: { gap: 12 },
})
