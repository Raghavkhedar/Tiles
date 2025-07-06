"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle, Home, Menu, Settings, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { getRoleDisplayName } from "@/lib/permissions";
import { Badge } from "./ui/badge";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const { user, isAdmin, hasPermission } = useUser();

  return (
    <nav className="w-full border-b border-border bg-background py-3 md:py-4 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" prefetch className="text-lg md:text-xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
            TileManager Pro
          </Link>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          {/* User Role Badge */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 md:h-9 md:w-9 hover:bg-muted focus:ring-2 focus:ring-orange-500"
              >
                <UserCircle className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* User Info */}
              {user && (
                <>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-xs">{getRoleDisplayName(user.role)}</div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* Settings Link */}
              {hasPermission("settings", "view") && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}
              
              {/* User Management Link (Admin Only) */}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/users" className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.refresh();
                }}
                className="cursor-pointer hover:bg-red-50 hover:text-red-600"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
