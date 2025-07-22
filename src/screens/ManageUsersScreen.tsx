import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../store/auth';
import { deleteUserById, fetchAllUsers } from '../services/user.api';

const ManageUsersScreen = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
  try {
    const users: any = await fetchAllUsers();
    setUsers(users);
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Failed to fetch users');
  }
};

const handleDelete = async (id: string) => {
  try {
    await deleteUserById(id);
    Alert.alert('Success', 'User deleted successfully');
    fetchUsers();
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'An error occurred');
  }
};

  const renderItem = ({ item }: any) => (
    <View style={styles.userCard}>
      <Text style={styles.username}>
        {item.firstName} {item.lastName} {' '}
        <Text style={styles.userType}>({item.userType})</Text>
      </Text>
      <Text style={styles.email}>{item.email}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.deleteBtn]}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>

        {/* Future buttons can go here */}
        {/* <TouchableOpacity style={[styles.button, styles.activateBtn]}>
          <Text style={styles.buttonText}>Activate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deactivateBtn]}>
          <Text style={styles.buttonText}>Deactivate</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ManageUsersScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userType: {
    fontSize: 14,
    color: '#888',
    fontWeight: '400',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#E53935',
  },
  activateBtn: {
    backgroundColor: '#43A047',
  },
  deactivateBtn: {
    backgroundColor: '#FB8C00',
  },
});

