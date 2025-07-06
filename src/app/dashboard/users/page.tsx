"use client";

import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Users,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import { UserRole, UserPermissions } from "@/types/database";
import {
  getPermissionsForRole,
  getRoleDisplayName,
  getRoleDescription,
  canPerformAction,
} from "@/lib/permissions";

interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        email: "admin@tilemanager.com",
        role: "admin",
        name: "Admin User",
        phone: "+91 9876543210",
        created_at: "2024-01-01",
        last_login: "2024-01-15T10:30:00Z",
        is_active: true,
      },
      {
        id: "2",
        email: "manager@tilemanager.com",
        role: "manager",
        name: "Manager User",
        phone: "+91 9876543211",
        created_at: "2024-01-02",
        last_login: "2024-01-14T15:45:00Z",
        is_active: true,
      },
      {
        id: "3",
        email: "user@tilemanager.com",
        role: "user",
        name: "Regular User",
        phone: "+91 9876543212",
        created_at: "2024-01-03",
        last_login: "2024-01-13T09:15:00Z",
        is_active: true,
      },
      {
        id: "4",
        email: "viewer@tilemanager.com",
        role: "viewer",
        name: "Viewer User",
        phone: "+91 9876543213",
        created_at: "2024-01-04",
        last_login: "2024-01-12T14:20:00Z",
        is_active: false,
      },
    ];

    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email || "",
      role: userData.role || "user",
      name: userData.name,
      phone: userData.phone,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    setUsers([...users, newUser]);
    setShowAddUser(false);
    toast({
      title: "User Added",
      description: "New user has been created successfully.",
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
    setEditingUser(null);
    toast({
      title: "User Updated",
      description: "User information has been updated successfully.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map((user) =>
      user.id === userId ? { ...user, is_active: !user.is_active } : user
    ));
    toast({
      title: "User Status Updated",
      description: "User status has been updated successfully.",
    });
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full bg-background min-h-screen pb-24">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span>Loading users...</span>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "User Management" }]} />

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account with appropriate role and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <AddUserForm onSubmit={handleAddUser} onCancel={() => setShowAddUser(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Manage user accounts and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || "No Name"}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getRoleDisplayName(user.role)}
                          </Badge>
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <div className="text-sm text-muted-foreground">
                            {new Date(user.last_login).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Never</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                              {user.is_active ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          {editingUser && (
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Update user information and permissions.
                  </DialogDescription>
                </DialogHeader>
                <EditUserForm
                  user={editingUser}
                  onSubmit={handleUpdateUser}
                  onCancel={() => setEditingUser(null)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </>
  );
}

// Add User Form Component
function AddUserForm({ onSubmit, onCancel }: { onSubmit: (data: Partial<User>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user" as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          {getRoleDescription(formData.role)}
        </p>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Create User
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Edit User Form Component
function EditUserForm({ user, onSubmit, onCancel }: { user: User; onSubmit: (data: User) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    is_active: user.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...user, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Full Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
        />
      </div>
      <div>
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>
      <div>
        <Label htmlFor="edit-role">Role</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          {getRoleDescription(formData.role)}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="edit-active">Active User</Label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Update User
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
} 