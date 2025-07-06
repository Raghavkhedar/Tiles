"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserRole, UserPermissions } from "@/types/database";
import { getPermissionsForRole } from "@/lib/permissions";

interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  permissions: UserPermissions;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  hasPermission: (module: keyof UserPermissions, action: keyof UserPermissions[keyof UserPermissions]) => boolean;
  canAccessPage: (module: keyof UserPermissions) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
  isViewer: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize with default admin user for development
  useEffect(() => {
    const defaultUser: User = {
      id: "1",
      email: "admin@tilemanager.com",
      role: "admin",
      name: "Admin User",
      phone: "+91 9876543210",
      permissions: getPermissionsForRole("admin"),
    };

    setUser(defaultUser);
    setLoading(false);
  }, []);

  const hasPermission = (
    module: keyof UserPermissions,
    action: keyof UserPermissions[keyof UserPermissions]
  ): boolean => {
    if (!user) return false;
    // Defensive: check if module and action exist
    const modulePerms = user.permissions[module];
    if (!modulePerms) return false;
    return modulePerms[action as keyof typeof modulePerms] === true;
  };

  const canAccessPage = (module: keyof UserPermissions): boolean => {
    if (!user) return false;
    return user.permissions[module].view === true;
  };

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isUser = user?.role === "user";
  const isViewer = user?.role === "viewer";

  const value: UserContextType = {
    user,
    loading,
    setUser,
    hasPermission,
    canAccessPage,
    isAdmin,
    isManager,
    isUser,
    isViewer,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Hook for checking permissions
export function usePermission(module: keyof UserPermissions, action: keyof UserPermissions[keyof UserPermissions]) {
  const { hasPermission } = useUser();
  return hasPermission(module, action);
}

// Hook for checking page access
export function usePageAccess(module: keyof UserPermissions) {
  const { canAccessPage } = useUser();
  return canAccessPage(module);
}

// Hook for role-based checks
export function useRole() {
  const { user, isAdmin, isManager, isUser, isViewer } = useUser();
  return {
    user,
    isAdmin,
    isManager,
    isUser,
    isViewer,
    role: user?.role,
  };
} 