import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { FaSave, FaCamera } from 'react-icons/fa';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import PhoneInput from '../components/ui/PhoneInput';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Avatar from '../components/ui/Avatar';
import {
  AvatarCropDialog,
  RemovePhotoDialog,
  GoogleAccountLinkSection,
} from '../components/profile';

export const Profile = () => {
  const { user, setUser, updateProfile, updateProfilePhoto, removeProfilePhoto } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    registrationNumber: user?.registration_number || '',
    department: user?.department || '',
  });
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  // Photo Cropping & Selection State
  const fileInputRef = useRef(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // Remove photo dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  // Password rotation state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        registrationNumber: user.registration_number || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Handle Photo Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
      toast.error('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image exceeds 15 MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected if cancelled
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Photo Upload Callback from Crop Dialog
  const handlePhotoUploaded = async (compressedFile) => {
    await updateProfilePhoto(compressedFile);
  };

  // Remove Photo action
  const handleConfirmRemovePhoto = async () => {
    setRemovingPhoto(true);
    try {
      await removeProfilePhoto();
      toast.success('Profile photo removed.');
      setRemoveDialogOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove profile photo.');
    } finally {
      setRemovingPhoto(false);
    }
  };

  // Google Sign-In linking
  const handleLinkGoogle = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    setLinkingGoogle(true);
    try {
      const res = await authService.linkGoogle(credentialResponse.credential);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      toast.success('Google account connected successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect Google account.');
    } finally {
      setLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!window.confirm('Are you sure you want to unlink your Google account?')) return;
    setLinkingGoogle(true);
    try {
      const res = await authService.unlinkGoogle();
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      toast.success('Google account unlinked.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unlink Google account.');
    } finally {
      setLinkingGoogle(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Name field cannot be left blank.');
      return;
    }

    if (user?.role === 'student') {
      if (!profileData.registrationNumber?.trim()) {
        toast.error('Registration number is required.');
        return;
      }
      if (!profileData.department?.trim()) {
        toast.error('Please select your department.');
        return;
      }
    }

    setUpdatingDetails(true);
    try {
      await updateProfile({
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        registration_number: profileData.registrationNumber?.trim().toUpperCase(),
        department: profileData.department,
      });
      toast.success('Account profile details updated.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Account password updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed. Verify current password.';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <PageHeader
        title="Account profile & credentials"
        subtitle="Review your institutional role, update personal contact details, and rotate your account password."
      />

      {/* Summary Card with Interactive Avatar Management */}
      <Card noPadding className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <Avatar
                src={user?.profile_photo_url}
                name={user?.name}
                size="lg"
                source={user?.profile_photo_source}
                className="ring-4 ring-[var(--md-sys-color-surface-container-high)]"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change photo"
                aria-label="Change photo"
              >
                <FaCamera className="text-xl" />
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <div>
              <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                <h2 className="text-xl font-medium text-[var(--md-sys-color-on-surface)]">
                  {user?.name}
                </h2>
                <Chip variant="primary" className="capitalize">
                  {user?.role}
                </Chip>
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono mt-1">{user?.email}</p>
              {user?.phone && (
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono mt-0.5">{user?.phone}</p>
              )}

              {/* Photo Action Buttons */}
              <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<FaCamera className="text-xs" />}
                >
                  Change photo
                </Button>

                {user?.profile_photo_url && (
                  <button
                    type="button"
                    onClick={() => setRemoveDialogOpen(true)}
                    className="text-xs text-[var(--md-sys-color-error)] hover:underline cursor-pointer font-medium"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Source-specific or guideline note */}
              <div className="mt-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                {user?.profile_photo_source === 'google_imported' ? (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    Imported from your Google account. Upload a new photo to replace it.
                  </span>
                ) : (
                  <span>JPG or PNG, up to 15 MB. We resize it automatically.</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-[var(--md-sys-color-outline-variant)] pt-4 sm:pt-0 sm:pl-6 text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1.5 w-full sm:w-auto">
            <p><strong>Account ID:</strong> <span className="font-mono">#{user?.id}</span></p>
            {user?.registration_number && (
              <p><strong>Reg Number:</strong> <span className="font-mono font-medium text-[var(--md-sys-color-primary)]">{user.registration_number}</span></p>
            )}
            {user?.department && (
              <p><strong>Department:</strong> <span className="font-medium text-[var(--md-sys-color-on-surface)]">{user.department}</span></p>
            )}
            <p><strong>Status:</strong> <span className="text-[var(--md-sys-color-success)] font-medium">Active & verified</span></p>
          </div>
        </div>
      </Card>

      {/* Avatar Crop & Compression Dialog */}
      <AvatarCropDialog
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setImageSrc(null);
        }}
        imageSrc={imageSrc}
        onPhotoUploaded={handlePhotoUploaded}
      />

      {/* Remove Photo Confirmation Dialog */}
      <RemovePhotoDialog
        isOpen={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        onConfirm={handleConfirmRemovePhoto}
        removing={removingPhoto}
      />

      {/* Two Cards Side by Side: Details & Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1: Personal Details */}
        <Card
          title="Personal details"
          subtitle={user?.role === 'student' ? "Manage your institutional & personal details" : "Modify your name and contact phone"}
        >
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <TextField
              label="Full legal name"
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />

            {user?.role === 'student' && (
              <div className="space-y-4 pt-1 pb-1">
                <div className="p-3 bg-[var(--md-sys-color-surface-container)] rounded-xl border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-[var(--md-sys-color-primary)]">Institutional Credentials (Read-only)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[var(--md-sys-color-on-surface-variant)] block">Registration Number</span>
                      <span className="font-mono font-medium text-[var(--md-sys-color-on-surface)]">{user.registration_number || 'Not assigned'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--md-sys-color-on-surface-variant)] block">Department</span>
                      <span className="font-medium text-[var(--md-sys-color-on-surface)]">{user.department_name || user.department || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <PhoneInput
              label="Contact phone number"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              helperText="Used for status notifications and mobile sign in"
            />

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="filled"
                loading={updatingDetails}
                icon={<FaSave className="text-xs" />}
              >
                Save details
              </Button>
            </div>
          </form>
        </Card>

        {/* Card 2: Password Rotation */}
        <Card
          title="Security & password"
          subtitle="Rotate your authentication password"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <TextField
              label="Current password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              autoComplete="current-password"
            />

            <TextField
              label="New password (min 8 characters)"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              autoComplete="new-password"
            />

            <TextField
              label="Confirm new password"
              type="password"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              required
              autoComplete="new-password"
            />

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="filled"
                loading={updatingPassword}
                icon={<FaSave className="text-xs" />}
              >
                Update password
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Card 3: Connected Services */}
      <GoogleAccountLinkSection
        isLinked={!!user?.google_sub}
        onLinkGoogle={handleLinkGoogle}
        onUnlinkGoogle={handleUnlinkGoogle}
        loading={linkingGoogle}
      />
    </div>
  );
};

export default Profile;
