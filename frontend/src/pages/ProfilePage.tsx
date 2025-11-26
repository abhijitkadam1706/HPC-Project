import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Lock, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    timezone: user?.timezone || 'UTC',
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailOnJobStart: true,
    emailOnJobComplete: true,
    emailOnJobFail: true,
    weeklyDigest: false,
  });

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to update user profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);

    try {
      // TODO: Implement API call to update notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Personal Information
              </h2>
              <p className="text-sm text-gray-500">
                Update your personal details
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePersonalInfo} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={personalInfo.name}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, name: e.target.value })
              }
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={personalInfo.email}
              disabled
              className="opacity-60"
            />
            <Input
              label="Organization"
              value={personalInfo.organization}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, organization: e.target.value })
              }
              placeholder="Optional"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={personalInfo.timezone}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, timezone: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">EST (New York)</option>
                <option value="America/Chicago">CST (Chicago)</option>
                <option value="America/Denver">MST (Denver)</option>
                <option value="America/Los_Angeles">PST (Los Angeles)</option>
                <option value="Europe/London">GMT (London)</option>
                <option value="Europe/Paris">CET (Paris)</option>
                <option value="Asia/Tokyo">JST (Tokyo)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Security - Change Password */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Security</h2>
              <p className="text-sm text-gray-500">
                Change your password
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="p-6">
          <div className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="mt-6">
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Notifications
              </h2>
              <p className="text-sm text-gray-500">
                Configure how you receive updates
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            {
              key: 'emailOnJobStart',
              label: 'Job Start Notifications',
              description: 'Get notified when your jobs start running',
            },
            {
              key: 'emailOnJobComplete',
              label: 'Job Completion Notifications',
              description: 'Get notified when your jobs complete successfully',
            },
            {
              key: 'emailOnJobFail',
              label: 'Job Failure Notifications',
              description: 'Get notified when your jobs fail',
            },
            {
              key: 'weeklyDigest',
              label: 'Weekly Digest',
              description: 'Receive a weekly summary of your job activity',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    [item.key]: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900">
                  {item.label}
                </label>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button onClick={handleSaveNotifications} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Account Information
              </h2>
              <p className="text-sm text-gray-500">
                Your account details
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Account ID</span>
            <span className="text-sm font-medium text-gray-900 font-mono">
              {user?.id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Role</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Member Since</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
