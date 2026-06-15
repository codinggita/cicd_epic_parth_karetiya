import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Server, Activity, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { api, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/workflows/latest?limit=5')
        ]);
        setStats(statsRes.data.data);
        setRecent(recentRes.data.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  return (
    <div className="content-wrapper animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '4vh' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '600', marginBottom: '16px' }}>
          Welcome, {user?.name ? user.name.split(' ')[0] : 'Engineer'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Here is your CI/CD platform overview.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading context...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Zap size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '8px' }}>Pipelines</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats?.totalWorkflows || 0}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Total configured workflows</p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Activity size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '8px' }}>Success Rate</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {stats?.totalRuns ? Math.round((stats.successfulRuns / stats.totalRuns) * 100) : 0}%
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Based on {stats?.totalRuns || 0} runs</p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Server size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '8px' }}>Avg Time</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats?.avgBuildTime || '2m 14s'}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Average execution duration</p>
            </div>
          </div>

          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRight size={20} /> Recent Executions
            </h2>
            {recent.length === 0 ? (
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent workflow executions found.
              </div>
            ) : (
              <div className="glass-panel">
                {recent.map((wf, idx) => (
                  <div key={wf._id} style={{ 
                    padding: '16px 24px', 
                    borderBottom: idx !== recent.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'background 0.2s', cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{wf.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{wf.runCount || 0} total runs</div>
                    </div>
                    <div>
                      <span className={`badge badge-${wf.status === 'active' ? 'success' : 'warning'}`}>
                        {wf.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
