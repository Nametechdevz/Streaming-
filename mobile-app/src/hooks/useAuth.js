import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      const savedUser = await AsyncStorage.getItem('user_data');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {}
    setLoading(false);
  };

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    await AsyncStorage.setItem('user_token', data.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    await AsyncStorage.multiRemove(['user_token', 'user_data']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
