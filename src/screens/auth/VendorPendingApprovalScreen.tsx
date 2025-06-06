import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VendorPendingApprovalScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Registration In Progress</Text>
    <Text style={styles.subtitle}>
      Your registration as a vendor is pending admin approval. You will be notified once approved.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default VendorPendingApprovalScreen;
