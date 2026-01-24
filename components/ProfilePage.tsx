import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateForm } from '../lib/validation';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  country?: string;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    country: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            country: data.country || ''
          });
        } else {
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || ''
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setError(null);

    // Validate form
    const validation = validateForm(formData, {
      full_name: { required: true, minLength: 2, maxLength: 100 },
      phone: { pattern: /^\+?[\d\s\-\(\)]{10,15}$/ },
      country: { maxLength: 100 }
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          country: formData.country || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-silver">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences.</p>
        </div>

        <div className="bg-darkcard/50 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-silver mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-darkbg/50 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-silver mb-2">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-darkbg/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                  errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-neon focus:ring-neon'
                }`}
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-silver mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-darkbg/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                  errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-neon focus:ring-neon'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-silver mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-darkbg/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:border-neon focus:ring-neon"
              >
                <option value="">Select your country</option>
                <option value="Kenya">Kenya</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="South Africa">South Africa</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Account Info */}
            {profile && (
              <div className="p-4 bg-darkbg/50 rounded-lg border border-white/5">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Account Information</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Member since:</span>
                    <span className="text-white ml-2">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Account ID:</span>
                    <span className="text-white ml-2 font-mono text-xs">
                      {profile.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Profile updated successfully!
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-6 bg-gradient-to-r from-neon to-gold text-darkbg font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;