import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

const InfraGuides = () => {
  const { api } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await api.get('/infra/k8s');
        if (res.data.success) {
          setGuides(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, [api]);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Infrastructure Guides</h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore documentation and templates for your deployments.</p>
      </header>

      {loading ? (
        <div>Loading guides...</div>
      ) : (
        <div className="dashboard-grid">
          {guides.length > 0 ? guides.map((guide, idx) => (
            <div key={idx} className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary)" /> {guide.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{guide.description}</p>
              <span className="badge badge-primary">{guide.category || 'kubernetes'}</span>
            </div>
          )) : (
            <div className="glass-card">
              <h3>Kubernetes Deployment Standard</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>A standard guide for deploying services to Kubernetes clusters using Helm.</p>
              <div style={{ marginTop: '16px' }}><span className="badge badge-primary">k8s</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfraGuides;
