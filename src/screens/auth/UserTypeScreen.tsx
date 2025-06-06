import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const UserTypeScreen = ({ navigation }: any) => {
  const { setUserType } = useAuth();

  const userTypes = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Browse and book camping spots',
      icon: require('../../assets/customer-icon.png'),
    },
    {
      id: 'vendor',
      title: 'Vendor',
      description: 'List and manage your camping spots',
      icon: require('../../assets/vendor-icon.png'),
    },
    // {
    //   id: 'admin',
    //   title: 'Admin',
    //   description: 'Manage the entire platform',
    //   icon: require('../../assets/admin-icon.png'),
    // },
  ];

  const handleSelect = (typeId: string) => {
    setUserType(typeId);
    navigation.navigate('Registration', { userType: typeId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Welcome to CampingWala</Text>
        <Text style={styles.subtitle}>Please select your account type</Text>

        <View style={styles.typesContainer}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeCard}
              onPress={() => handleSelect(type.id)}
            >
              <Image source={type.icon} style={styles.typeIcon} />
              <Text style={styles.typeTitle}>{type.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  typesContainer: {
    marginBottom: 30,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default UserTypeScreen;
