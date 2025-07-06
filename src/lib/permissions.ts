import { UserRole, UserPermissions } from "@/types/database";

// Predefined permission sets for each role
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    inventory: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    suppliers: { view: true, create: true, edit: true, delete: true },
    billing: { view: true, create: true, edit: true, delete: true },
    purchase_orders: { view: true, create: true, edit: true, delete: true },
    deliveries: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, export: true },
    settings: { view: true, edit: true },
    users: { view: true, create: true, edit: true, delete: true },
  },
  manager: {
    inventory: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    suppliers: { view: true, create: true, edit: true, delete: false },
    billing: { view: true, create: true, edit: true, delete: false },
    purchase_orders: { view: true, create: true, edit: true, delete: false },
    deliveries: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, export: true },
    settings: { view: true, edit: false },
    users: { view: true, create: false, edit: false, delete: false },
  },
  user: {
    inventory: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    suppliers: { view: true, create: false, edit: false, delete: false },
    billing: { view: true, create: true, edit: false, delete: false },
    purchase_orders: { view: true, create: false, edit: false, delete: false },
    deliveries: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, export: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
  },
  viewer: {
    inventory: { view: true, create: false, edit: false, delete: false },
    customers: { view: true, create: false, edit: false, delete: false },
    suppliers: { view: true, create: false, edit: false, delete: false },
    billing: { view: true, create: false, edit: false, delete: false },
    purchase_orders: { view: true, create: false, edit: false, delete: false },
    deliveries: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, export: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
  },
};

// Helper function to get permissions for a role
export function getPermissionsForRole(role: UserRole): UserPermissions {
  return ROLE_PERMISSIONS[role];
}

// Helper function to check if user has specific permission
export function hasPermission(
  userPermissions: UserPermissions,
  module: keyof UserPermissions,
  action: keyof UserPermissions[typeof module]
): boolean {
  return userPermissions[module][action as keyof UserPermissions[typeof module]] === true;
}

// Helper function to check if user can perform action
export function canPerformAction(
  userPermissions: UserPermissions,
  module: keyof UserPermissions,
  action: keyof UserPermissions[typeof module]
): boolean {
  return hasPermission(userPermissions, module, action);
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    admin: 'Administrator',
    manager: 'Manager',
    user: 'User',
    viewer: 'Viewer',
  };
  return roleNames[role];
}

// Helper function to get role description
export function getRoleDescription(role: UserRole): string {
  const roleDescriptions = {
    admin: 'Full access to all features and settings',
    manager: 'Can manage business operations but cannot delete or modify settings',
    user: 'Can perform daily operations but limited access to sensitive features',
    viewer: 'Read-only access to view data and reports',
  };
  return roleDescriptions[role];
}

// Helper function to check if user can access a page
export function canAccessPage(
  userPermissions: UserPermissions,
  page: keyof UserPermissions
): boolean {
  return userPermissions[page].view === true;
}

// Helper function to get available actions for a module
export function getAvailableActions(
  userPermissions: UserPermissions,
  module: keyof UserPermissions
): string[] {
  const permissions = userPermissions[module];
  const actions: string[] = [];
  
  Object.entries(permissions).forEach(([action, allowed]) => {
    if (allowed) {
      actions.push(action);
    }
  });
  
  return actions;
} 