import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../services/api";

// Define what a User looks like
interface User {
  id: string;
  name: string;
  email: string;
  monthlyLimit?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null; // <--- Added user object
  login: (token: string, userData: User) => Promise<void>; // <--- Updated to accept user data
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null); // <--- User State
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in when app starts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userInfo = await AsyncStorage.getItem("user"); // <--- Load user data

        if (token && userInfo) {
          await setAuthToken(token);
          setUser(JSON.parse(userInfo)); // <--- Set user state
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Update login to save user data
  const login = async (token: string, userData: User) => {
    await setAuthToken(token);
    await AsyncStorage.setItem("user", JSON.stringify(userData)); // <--- Persist user
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await setAuthToken(null);
    await AsyncStorage.removeItem("user"); // <--- Clear user
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
