import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserAccount {
  id: number;
  user_email: string;
  start_balance: number;
  profit_target: number;
  max_drawdown_limit: number;
  challenge_status: string | null;
  created_at: string;
  updated_at: string;
}

interface TradingState {
  id: number;
  user_email: string;
  balance: number;
  equity: number;
  daily_pnl: number;
  status: string;
  last_trade_at: string | null;
  updated_at: string;
}

interface Order {
  id: number;
  user_email: string;
  amount: number;
  status: string;
  created_at: string;
  tier_name?: string;
}

const SuperAdmin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [tradingStates, setTradingStates] = useState<TradingState[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const superAdminPassword = 'sovereign2026admin!'; // Super admin password

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === superAdminPassword) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('superadmin_auth', 'true');
    } else {
      setError('Invalid superadmin password');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user accounts
      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setUsers(userData || []);

      // Load trading states
      const { data: tradingData, error: tradingError } = await supabase
        .from('trading_states')
        .select('*')
        .order('updated_at', { ascending: false });

      if (tradingError) throw tradingError;
      setTradingStates(tradingData || []);

      // Load orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;
      setOrders(orderData || []);

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userEmail: string, status: string) => {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({ challenge_status: status, updated_at: new Date().toISOString() })
        .eq('user_email', userEmail);

      if (error) throw error;

      // Refresh data
      loadData();
      alert(`User ${userEmail} status updated to ${status}`);
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status');
    }
  };

  const resetUserAccount = async (userEmail: string) => {
    if (!confirm(`Are you sure you want to reset ${userEmail}'s account? This will clear their trading data.`)) {
      return;
    }

    try {
      // Reset user account
      const { error: accountError } = await supabase
        .from('user_accounts')
        .update({
          challenge_status: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', userEmail);

      if (accountError) throw accountError;

      // Reset trading state
      const { error: tradingError } = await supabase
        .from('trading_states')
        .update({
          balance: 10000, // Default starting balance
          equity: 10000,
          daily_pnl: 0,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_email', userEmail);

      if (tradingError) throw tradingError;

      loadData();
      alert(`User ${userEmail}'s account has been reset`);
    } catch (err) {
      console.error('Error resetting user account:', err);
      alert('Failed to reset user account');
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-darkbg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-darkcard border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gold mb-2">🔐 Super Admin</h1>
            <p className="text-silver text-sm">Platform Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Super Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-darkbg border border-white/10 rounded-lg p-3 text-silver focus:border-gold outline-none"
                placeholder="Enter super admin password"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold to-neon text-darkbg py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-cyan-400 transition-all"
            >
              Access Super Admin Panel
            </button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-6">
            ⚠️ Authorized personnel only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Super Admin Dashboard</h1>
          <p className="text-silver">Platform management and user oversight</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-darkcard p-1 rounded-lg border border-white/10">
          {[
            { id: 'users', label: 'User Accounts', count: users.length },
            { id: 'trading', label: 'Trading States', count: tradingStates.length },
            { id: 'orders', label: 'Payment Orders', count: orders.length },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gold text-darkbg shadow-lg'
                  : 'text-silver hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gold text-xl">Loading data...</div>
            </div>
          ) : (
            <>
              {/* User Accounts Tab */}
              {activeTab === 'users' && (
                <div className="bg-darkcard border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">User Accounts</h2>
                    <p className="text-silver text-sm">Manage user evaluation accounts</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-darkbg/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit Target</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-sm text-white">{user.user_email}</td>
                            <td className="px-6 py-4 text-sm text-silver">${user.start_balance.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-silver">${user.profit_target.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.challenge_status === 'passed' ? 'bg-green-500/20 text-green-400' :
                                user.challenge_status === 'breached' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {user.challenge_status || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => updateUserStatus(user.user_email, 'passed')}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30"
                              >
                                Pass
                              </button>
                              <button
                                onClick={() => updateUserStatus(user.user_email, 'breached')}
                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                              >
                                Breach
                              </button>
                              <button
                                onClick={() => resetUserAccount(user.user_email)}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30"
                              >
                                Reset
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Trading States Tab */}
              {activeTab === 'trading' && (
                <div className="bg-darkcard border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Trading States</h2>
                    <p className="text-silver text-sm">Real-time trading account status</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-darkbg/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily P&L</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Trade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {tradingStates.map((state) => (
                          <tr key={state.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-sm text-white">{state.user_email}</td>
                            <td className="px-6 py-4 text-sm text-silver">${state.balance.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-silver">${state.equity.toLocaleString()}</td>
                            <td className={`px-6 py-4 text-sm font-medium ${
                              state.daily_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${state.daily_pnl.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                state.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                state.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {state.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {state.last_trade_at ? new Date(state.last_trade_at).toLocaleString() : 'Never'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-darkcard border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Payment Orders</h2>
                    <p className="text-silver text-sm">Payment processing history</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-darkbg/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-sm text-white">{order.user_email}</td>
                            <td className="px-6 py-4 text-sm text-silver">${order.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-silver">{order.tier_name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-darkcard border border-white/10 rounded-2xl p-6">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-2xl font-bold text-white">{users.length}</div>
                    <div className="text-silver text-sm">Total Users</div>
                  </div>
                  <div className="bg-darkcard border border-white/10 rounded-2xl p-6">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-green-400">
                      {users.filter(u => u.challenge_status === 'passed').length}
                    </div>
                    <div className="text-silver text-sm">Passed Evaluations</div>
                  </div>
                  <div className="bg-darkcard border border-white/10 rounded-2xl p-6">
                    <div className="text-3xl mb-2">❌</div>
                    <div className="text-2xl font-bold text-red-400">
                      {users.filter(u => u.challenge_status === 'breached').length}
                    </div>
                    <div className="text-silver text-sm">Breached Accounts</div>
                  </div>
                  <div className="bg-darkcard border border-white/10 rounded-2xl p-6">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-2xl font-bold text-gold">
                      ${orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
                    </div>
                    <div className="text-silver text-sm">Total Revenue</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;