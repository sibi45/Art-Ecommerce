import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Key,
  Package,
  Heart,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ProfileScreenProps {
  onOpenAuth: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, isAdmin, logout, refreshUser } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [ordersCount, setOrdersCount] = useState<number>(0);

  // Sync user details to form
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');

      api.getMyInquiries()
        .then((orders) => setOrdersCount(orders.length))
        .catch(() => {});
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      await api.updateMe({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
      });

      await refreshUser();
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // If unauthenticated, show friendly sign-in prompt
  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '48px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f0fdf4',
            color: '#1b3b2b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <UserIcon size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
            Account Profile
          </h2>
          <p style={{ fontSize: '15px', color: '#6b7280', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 1.5 }}>
            Please sign in to view and manage your profile details, shipping address, saved wishlist, and orders.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            style={{
              backgroundColor: '#1b3b2b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#142c20')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b3b2b')}
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Member';

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div style={{ backgroundColor: '#fcfbf8', minHeight: '80vh', padding: '36px 20px 60px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Profile Header Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '28px 32px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#1b3b2b',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.05em'
            }}>
              {userInitials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {user?.full_name}
                </h1>
                <span style={{
                  backgroundColor: user?.role === 'admin' ? '#eff6ff' : '#f0fdf4',
                  color: user?.role === 'admin' ? '#1d4ed8' : '#1b3b2b',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: user?.role === 'admin' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {user?.role === 'admin' ? 'Store Admin' : 'Customer'}
                </span>
              </div>
              <div style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span>{user?.email}</span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> Joined {memberSince}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/home');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              backgroundColor: '#fff5f5',
              color: '#dc2626',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff5f5')}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Quick Activity Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Orders Card */}
          <Link
            to="/orders"
            style={{
              textDecoration: 'none',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              color: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1b3b2b';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1b3b2b'
              }}>
                <Package size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Orders Placed
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                  {ordersCount}
                </div>
              </div>
            </div>
            <ArrowRight size={16} color="#9ca3af" />
          </Link>

          {/* Wishlist Card */}
          <Link
            to="/wishlist"
            style={{
              textDecoration: 'none',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              color: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1b3b2b';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <Heart size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Saved Wishlist
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                  {wishlistCount}
                </div>
              </div>
            </div>
            <ArrowRight size={16} color="#9ca3af" />
          </Link>

          {/* Admin Dashboard (if admin) */}
          {isAdmin && (
            <Link
              to="/admin"
              style={{
                textDecoration: 'none',
                backgroundColor: '#f0fdf4',
                borderRadius: '10px',
                border: '1px solid #bbf7d0',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                color: '#1b3b2b'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dcfce7';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1b3b2b',
                  border: '1px solid #bbf7d0'
                }}>
                  <LayoutDashboard size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Admin Controls
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b3b2b' }}>
                    Dashboard
                  </div>
                </div>
              </div>
              <ArrowRight size={16} color="#166534" />
            </Link>
          )}
        </div>

        {/* Profile Content Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fafafa'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1,
                padding: '16px 20px',
                fontSize: '14.5px',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                color: activeTab === 'profile' ? '#1b3b2b' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === 'profile' ? '2px solid #1b3b2b' : '2px solid transparent',
                backgroundColor: activeTab === 'profile' ? '#ffffff' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease'
              }}
            >
              <UserIcon size={16} /> Personal Details & Address
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                flex: 1,
                padding: '16px 20px',
                fontSize: '14.5px',
                fontWeight: activeTab === 'security' ? 700 : 500,
                color: activeTab === 'security' ? '#1b3b2b' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === 'security' ? '2px solid #1b3b2b' : '2px solid transparent',
                backgroundColor: activeTab === 'security' ? '#ffffff' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease'
              }}
            >
              <Lock size={16} /> Account Security & Password
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} style={{ maxWidth: '680px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                  Personal Information
                </h2>
                <p style={{ fontSize: '13.5px', color: '#6b7280', marginBottom: '24px' }}>
                  Update your contact details and default shipping address for quick checkout.
                </p>

                {profileSuccess && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    color: '#166534',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    marginBottom: '20px'
                  }}>
                    <CheckCircle2 size={16} /> {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#991b1b',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    marginBottom: '20px'
                  }}>
                    <AlertCircle size={16} /> {profileError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <UserIcon size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      City / State
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai, Maharashtra"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Delivery Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      placeholder="Street address, apartment, suite, postal code..."
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#1b3b2b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 24px',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                      opacity: isSavingProfile ? 0.7 : 1,
                      fontFamily: 'inherit',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#142c20')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b3b2b')}
                  >
                    <Save size={16} />
                    {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} style={{ maxWidth: '520px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                  Change Account Password
                </h2>
                <p style={{ fontSize: '13.5px', color: '#6b7280', marginBottom: '24px' }}>
                  Ensure your account is protected with a strong password (minimum 6 characters).
                </p>

                {passwordSuccess && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    color: '#166534',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    marginBottom: '20px'
                  }}>
                    <CheckCircle2 size={16} /> {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#991b1b',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    marginBottom: '20px'
                  }}>
                    <AlertCircle size={16} /> {passwordError}
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Confirm New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#1b3b2b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 24px',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      cursor: isSavingPassword ? 'not-allowed' : 'pointer',
                      opacity: isSavingPassword ? 0.7 : 1,
                      fontFamily: 'inherit',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#142c20')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b3b2b')}
                  >
                    <Key size={16} />
                    {isSavingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
