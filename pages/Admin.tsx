import React, { useState, useEffect } from 'react';

interface ContentItem {
  key: string;
  value: string;
  category: string;
  label: string;
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('sovereign2026!'); // Default fallback

  // Fetch admin password on mount
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const res = await fetch('http://localhost:3005/api/content');
        const data = await res.json();
        if (data.admin_password) {
          setAdminPassword(data.admin_password);
        }
      } catch (err) {
        console.log('Using default password');
      }
    };
    fetchPassword();
    
    // Check if already authenticated
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('admin_auth', 'true');
    } else {
      setError('Invalid password');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchContent = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/content/all');
      const data = await res.json();
      if (Array.isArray(data)) {
        setContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      const response = await fetch('http://localhost:3005/api/content/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (response.ok) {
        setContent(prev => prev.map(item => 
          item.key === key ? { ...item, value } : item
        ));
        alert('✅ Content updated successfully!');
      } else {
        alert('❌ Failed to update content');
      }
    } catch (error) {
      alert('❌ Error saving content');
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  const categories = ['admin', 'home', 'stats', 'nav', 'buttons', 'rules', 'faq', 'footer', 'evaluation', 'scaling', 'dashboard'];

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-darkcard border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gold mb-2">🔒 Admin CMS</h1>
            <p className="text-silver text-sm">Enter password to access the content management system</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Admin Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-darkbg border border-white/10 rounded-lg p-3 text-silver focus:border-gold outline-none"
                placeholder="Enter admin password"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-gold text-darkbg py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
            >
              Access Admin Panel
            </button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-6">
            Unauthorized access is prohibited
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center">
        <div className="text-gold text-xl">Loading CMS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gold">🛠️ Content Management System</h1>
            <p className="text-silver text-sm mt-1">Edit all website text dynamically</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm"
          >
            Logout Admin
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-4">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-gold text-darkbg border-gold' 
                  : 'bg-transparent text-silver border-white/20 hover:border-gold/50'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content Editor */}
        <div className="space-y-6">
          {content
            .filter(item => item.category === selectedCategory)
            .map(item => (
              <div key={item.key} className="bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    {item.label}
                  </label>
                  <span className="text-xs text-gray-600 font-mono">{item.key}</span>
                </div>
                <textarea 
                  className="w-full bg-darkbg border border-white/10 rounded-lg p-4 text-silver focus:border-gold outline-none min-h-[80px] font-mono text-sm"
                  defaultValue={item.value}
                  onChange={(e) => {
                    setContent(prev => prev.map(c => 
                      c.key === item.key ? { ...c, value: e.target.value } : c
                    ));
                  }}
                />
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={() => handleSave(item.key, item.value)}
                    disabled={saving === item.key}
                    className="bg-gold text-darkbg px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {saving === item.key ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              </div>
            ))}
          {content.filter(item => item.category === selectedCategory).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No content found in this category. Run the SQL setup first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;