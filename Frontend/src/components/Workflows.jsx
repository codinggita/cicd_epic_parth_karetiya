import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Search, Plus, Terminal } from 'lucide-react';

const Workflows = () => {
  const { api } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows');
      setWorkflows(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line
  }, []);

  const handleRun = async (id) => {
    try {
      const res = await api.post(`/workflows/${id}/run`, { triggeredBy: 'React UI' });
      if (res.data.success) {
        alert('Execution triggered: ' + res.data.runId);
        fetchWorkflows();
      }
    } catch (err) {
      alert('Error triggering run');
    }
  };

  const filteredWorkflows = workflows.filter(wf => 
    wf.name.toLowerCase().includes(search.toLowerCase()) || 
    (wf.description && wf.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="content-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '8px' }}>Pipelines</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure and execute your automation tasks.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Create
        </button>
      </div>

      <div style={{ marginBottom: '32px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '13px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="form-control" 
          style={{ paddingLeft: '48px', borderRadius: '8px' }} 
          placeholder="Search pipelines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Fetching pipelines...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredWorkflows.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No matches found.</p>
          ) : (
            filteredWorkflows.map(wf => (
              <div key={wf._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={18} color="var(--primary)" />
                      {wf.name}
                    </h3>
                    <span className={`badge badge-${wf.status === 'active' ? 'success' : 'warning'}`}>
                      {wf.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    {wf.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {wf.tags?.map(t => (
                      <span key={t} className="badge badge-primary" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '12px 20px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                    <span>Executions: {wf.runCount || 0}</span>
                    <span>Success: {wf.successCount || 0}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={() => handleRun(wf._id)} style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent' }}>
                    <Play size={14} /> Execute
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Workflows;
