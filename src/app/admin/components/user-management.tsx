'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Users, ClipboardList } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  groups: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserGroup {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  assignedSurveys: string[];
}

interface Survey {
  _id: string;
  title: string;
  assignedGroups: string[];
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

async function fetchGroups(): Promise<UserGroup[]> {
  const response = await fetch('/api/groups');
  if (!response.ok) {
    throw new Error('Failed to fetch groups');
  }
  return response.json();
}

async function fetchSurveys(): Promise<Survey[]> {
  const response = await fetch('/api/surveys');
  if (!response.ok) {
    throw new Error('Failed to fetch surveys');
  }
  return response.json();
}

async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role: newRole }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }
}

async function createGroup(name: string, description: string): Promise<UserGroup> {
  const response = await fetch('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to create group');
  }
  return response.json();
}

async function assignUsersToGroup(groupId: string, userIds: string[]) {
  const response = await fetch(`/api/groups/${groupId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to assign users to group');
  }
}

async function assignSurveyToGroups(surveyId: string, groupIds: string[]) {
  const response = await fetch(`/api/surveys/${surveyId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to assign survey to groups');
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedSurvey, setSelectedSurvey] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, groupsData, surveysData] = await Promise.all([
          fetchUsers(),
          fetchGroups(),
          fetchSurveys(),
        ]);
        setUsers(usersData);
        setGroups(groupsData);
        setSurveys(surveysData);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? { ...user, role: newRole } : user))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const newGroup = await createGroup(newGroupName, newGroupDescription);
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignUsersToGroup = async () => {
    if (selectedGroup && selectedUsers.length > 0) {
      try {
        await assignUsersToGroup(selectedGroup, selectedUsers);
        // Refresh users and groups data after assignment
        const [updatedUsers, updatedGroups] = await Promise.all([fetchUsers(), fetchGroups()]);
        setUsers(updatedUsers);
        setGroups(updatedGroups);
        setSelectedUsers([]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAssignSurveyToGroups = async () => {
    if (selectedSurvey && selectedGroup) {
      try {
        await assignSurveyToGroups(selectedSurvey, [selectedGroup]);
        // Refresh surveys and groups data after assignment
        const [updatedSurveys, updatedGroups] = await Promise.all([fetchSurveys(), fetchGroups()]);
        setSurveys(updatedSurveys);
        setGroups(updatedGroups);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => console.log('Open add user dialog')}>
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedUsers.length === users.length}
                onCheckedChange={(checked) => {
                  setSelectedUsers(checked ? users.map((u) => u._id) : []);
                }}
              />
            </TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onCheckedChange={() => toggleUserSelection(user._id)}
                />
              </TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(newRole) => handleRoleChange(user._id, newRole as 'admin' | 'user')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{user.groups ? user.groups.join(', ') : ''}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(user.updatedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex space-x-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Users className="mr-2 h-4 w-4" /> Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Input
                placeholder="Group Description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger>
            <SelectValue placeholder="Select Group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group._id} value={group._id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleAssignUsersToGroup} disabled={!selectedGroup || selectedUsers.length === 0}>
          Assign Users to Group
        </Button>
      </div>

      <div className="flex space-x-4">
        <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
          <SelectTrigger>
            <SelectValue placeholder="Select Survey" />
          </SelectTrigger>
          <SelectContent>
            {surveys.map((survey) => (
              <SelectItem key={survey._id} value={survey._id}>
                {survey.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleAssignSurveyToGroups} disabled={!selectedSurvey || !selectedGroup}>
          <ClipboardList className="mr-2 h-4 w-4" /> Assign Survey to Group
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Assigned Surveys</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group._id}>
              <TableCell>{group.name}</TableCell>
              <TableCell>{group.description}</TableCell>
              <TableCell>{group.members.length}</TableCell>
              <TableCell>
                {group.assignedSurveys && group.assignedSurveys.length > 0
                  ? group.assignedSurveys
                    .map((surveyId) => {
                      const survey = surveys.find((s) => s._id === surveyId);
                      return survey ? survey.title : 'Unknown Survey';
                    })
                    .join(', ')
                  : 'No assigned surveys'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}