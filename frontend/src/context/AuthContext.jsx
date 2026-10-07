import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Sync latest profile fields from backend
        // getProfile now returns the unwrapped user object directly
        authService.getProfile()
          .then((freshUser) => {
            if (freshUser && typeof freshUser === 'object' && freshUser.role) {
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          })
          .catch(() => {});
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const data = await authService.login(identifier, password);
      const { token, user: userData } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    setLoading(true);
    try {
      const data = await authService.googleLogin(credential);
      const { token, user: userData } = data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeAcademicProfile = async (academicData) => {
    try {
      const data = await authService.completeAcademicProfile(academicData);
      const updatedUser = data?.user ?? data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      // updateProfile now returns the unwrapped user object directly
      const updatedUser = await authService.updateProfile(profileData);
      const userObj = updatedUser?.role ? updatedUser : (updatedUser?.user ?? updatedUser);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      return userObj;
    } catch (error) {
      throw error;
    }
  };

  const updateProfilePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const data = await authService.uploadProfilePhoto(formData);
      const updatedUser = data?.user ?? data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const removeProfilePhoto = async () => {
    try {
      const data = await authService.deleteProfilePhoto();
      const updatedUser = data?.user ?? data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isStaff = () => user?.role === 'staff';
  const isStudent = () => user?.role === 'student';

  const value = {
    user,
    setUser,
    loading,
    login,
    googleLogin,
    completeAcademicProfile,
    logout,
    updateProfile,
    updateProfilePhoto,
    removeProfilePhoto,
    isAdmin,
    isStaff,
    isStudent,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
