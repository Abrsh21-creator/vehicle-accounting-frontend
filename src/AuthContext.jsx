import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// User roles and permissions
export const ROLES = {
  ADMIN: 'admin',
  KES_YESHALEM: 'kes_yeshalem',
  SMENEH: 'smeneh',
  AMSALU: 'amsalu',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canEdit: true,
    canDelete: true,
    canComment: true,
    canViewAll: true,
    canModifyInputs: true,
    displayName: 'Administrator',
    displayNameAm: 'አስተዳዳሪ',
  },
  [ROLES.KES_YESHALEM]: {
    canEdit: false,
    canDelete: false,
    canComment: false,
    canViewAll: true,
    canModifyInputs: false,
    displayName: 'Kes Yeshalem',
    displayNameAm: 'ቄስ የሻለም',
    shareholderKey: 'kesYeshalem',
  },
  [ROLES.SMENEH]: {
    canEdit: false,
    canDelete: false,
    canComment: false,
    canViewAll: true,
    canModifyInputs: false,
    displayName: 'Smeneh',
    displayNameAm: 'ስመኔህ',
    shareholderKey: 'smeneh',
  },
  [ROLES.AMSALU]: {
    canEdit: false,
    canDelete: false,
    canComment: false,
    canViewAll: true,
    canModifyInputs: false,
    displayName: 'Amsalu',
    displayNameAm: 'አምሳሉ',
    shareholderKey: 'amsalu',
  },
};

// Mock users (In production, this would come from your backend/database)
const USERS = [
  { username: 'Abrham', password: 'Abrham123', role: ROLES.ADMIN, name: 'Administrator' },
  { username: 'kesyeshalem', password: 'kes123', role: ROLES.KES_YESHALEM, name: 'Kes Yeshalem' },
  { username: 'smeneh', password: 'smeneh123', role: ROLES.SMENEH, name: 'Smeneh' },
  { username: 'amsalu', password: 'amsalu123', role: ROLES.AMSALU, name: 'Amsalu' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const foundUser = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = {
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        permissions: PERMISSIONS[foundUser.role],
      };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions[permission] === true;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isAdmin: user?.role === ROLES.ADMIN,
    loading,
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
