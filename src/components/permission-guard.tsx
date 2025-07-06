"use client";

import React from "react";
import { UserPermissions } from "@/types/database";
import { canPerformAction } from "@/lib/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: UserPermissions;
  module: keyof UserPermissions;
  action: keyof UserPermissions[keyof UserPermissions];
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permissions,
  module,
  action,
  fallback = null,
}: PermissionGuardProps) {
  const hasPermission = canPerformAction(permissions, module, action);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PageGuardProps {
  children: React.ReactNode;
  permissions: UserPermissions;
  module: keyof UserPermissions;
  fallback?: React.ReactNode;
}

export function PageGuard({
  children,
  permissions,
  module,
  fallback = (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  ),
}: PageGuardProps) {
  const canAccess = permissions[module].view === true;

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ActionButtonProps {
  children: React.ReactNode;
  permissions: UserPermissions;
  module: keyof UserPermissions;
  action: keyof UserPermissions[keyof UserPermissions];
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ActionButton({
  children,
  permissions,
  module,
  action,
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
}: ActionButtonProps) {
  const hasPermission = canPerformAction(permissions, module, action);

  if (!hasPermission) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className}`}
    >
      {children}
    </button>
  );
}

interface PermissionBadgeProps {
  permissions: UserPermissions;
  module: keyof UserPermissions;
  action: keyof UserPermissions[keyof UserPermissions];
  children: React.ReactNode;
  className?: string;
}

export function PermissionBadge({
  permissions,
  module,
  action,
  children,
  className = "",
}: PermissionBadgeProps) {
  const hasPermission = canPerformAction(permissions, module, action);

  if (!hasPermission) {
    return null;
  }

  return <span className={className}>{children}</span>;
} 