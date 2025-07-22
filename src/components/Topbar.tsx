import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { DrawerParamList } from '../types/navigation';
import { useAuthStore } from '../store/auth';

const TopBar = ({ searchText, setSearchText, onSearch, user }: any) => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { logout } = useAuthStore();

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const onSelectProfile = () => {
    setMenuVisible(false);
    navigation.navigate('ProfileSettings', { user });
  };

  const onSelectLogout = () => {
    setMenuVisible(false);
    logout();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Icon name="menu" size={28} color="#000" />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={onSearch}>
          <Icon name="search" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={toggleMenu}>
        <Image source={require('../assets/user.png')} style={styles.avatar} />
      </TouchableOpacity>

      {/* Custom dropdown menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={onSelectProfile} style={styles.menuItem}>
            <Text style={styles.menuText}>Profile Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSelectLogout} style={styles.menuItem}>
            <Text style={[styles.menuText, { color: 'red' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 60, // Just below the top bar
    right: 16, // Align right edge with avatar
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
});
