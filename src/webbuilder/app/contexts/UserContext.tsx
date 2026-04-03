"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isLockedUser: boolean;
  setUserName: (name: string) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  createUser: (name: string) => Promise<User>;
  listUsers: () => Promise<User[]>;
}

const UserContext = createContext<UserContextType | null>(null);

const USER_STORAGE_KEY = "webbuilder-current-user-id";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLockedUser, setIsLockedUser] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check URL params first
        const params = new URLSearchParams(window.location.search);
        const urlUserId = params.get("userId");
        const urlUserName = params.get("userName");
        const urlIdeaId = params.get("ideaId");
        const urlIdeaTitle = params.get("ideaTitle");

        if (urlUserId) {
          // Try to load the user by the URL-provided id
          const response = await fetch(`/api/user?userId=${encodeURIComponent(urlUserId)}`);
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem(USER_STORAGE_KEY, data.user.id);
            setIsLockedUser(true);
            if (urlIdeaId || urlIdeaTitle) {
              const patchRes = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: urlUserId, ideaId: urlIdeaId, ideaTitle: urlIdeaTitle }),
              });
              if (patchRes.ok) {
                const patchData = await patchRes.json();
                setUser(patchData.user);
              }
            }
          } else {
            // User not found — create them with the URL-provided id and name
            const name = urlUserName || urlUserId;
            const createRes = await fetch("/api/user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, userId: urlUserId, ideaId: urlIdeaId, ideaTitle: urlIdeaTitle }),
            });
            const createData = await createRes.json();
            setUser(createData.user);
            localStorage.setItem(USER_STORAGE_KEY, createData.user.id);
            setIsLockedUser(true);
          }
        } else {
          const savedUserId = localStorage.getItem(USER_STORAGE_KEY);
          if (savedUserId) {
            const response = await fetch(`/api/user?userId=${savedUserId}`);
            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
            } else {
              await createDefaultUser();
            }
          } else {
            await createDefaultUser();
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        await createDefaultUser();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const createDefaultUser = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Guest" }),
      });
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem(USER_STORAGE_KEY, data.user.id);
    } catch (error) {
      console.error("Failed to create default user:", error);
    }
  };

  const setUserName = useCallback(async (name: string) => {
    if (!user) return;
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name }),
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Failed to update user name:", error);
      throw error;
    }
  }, [user]);

  const switchUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/user?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, userId);
      }
    } catch (error) {
      console.error("Failed to switch user:", error);
      throw error;
    }
  }, []);

  const createUser = useCallback(async (name: string): Promise<User> => {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    setUser(data.user);
    localStorage.setItem(USER_STORAGE_KEY, data.user.id);
    return data.user;
  }, []);

  const listUsers = useCallback(async (): Promise<User[]> => {
    try {
      const response = await fetch("/api/user?list=true");
      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to list users:", error);
      return [];
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, isLockedUser, setUserName, switchUser, createUser, listUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
