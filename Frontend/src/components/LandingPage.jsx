import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowRight, Activity, Database, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { token } = useAuth();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 48px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-sidebar)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <Hexagon size={28} color="var(--primary)" />
          <span>Nexus CI/CD</span>
        </div>
        <div>
          {token ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ marginRight: '16px' }}>Sign In</Link>
              <Link to="/login" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '800', 
            marginBottom: '24px',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Automate Everything.<br />
            <span style={{ color: 'var(--primary)' }}>Deploy with Confidence.</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-muted)', 
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px auto',
            lineHeight: '1.6'
          }}>
            A next-generation platform for building, testing, and deploying your applications with unparalleled speed and security. Designed for modern development teams.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {token ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                Start Building Free <ArrowRight size={20} />
              </Link>
            )}
            <a href="#features" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Explore Features
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px', 
          marginTop: '96px',
          maxWidth: '1200px',
          width: '100%',
          textAlign: 'left'
        }}>
          <div className="glass-card">
            <div style={{ background: 'rgba(76, 209, 214, 0.15)', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              <Zap size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Lightning Fast Pipelines</h3>
            <p style={{ color: 'var(--text-muted)' }}>Execute complex workflows in seconds with our optimized distributed runner infrastructure.</p>
          </div>
          <div className="glass-card">
            <div style={{ background: 'rgba(76, 209, 214, 0.15)', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              <Shield size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Enterprise Security</h3>
            <p style={{ color: 'var(--text-muted)' }}>Built-in secret management, vulnerability scanning, and robust access controls.</p>
          </div>
          <div className="glass-card">
            <div style={{ background: 'rgba(76, 209, 214, 0.15)', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              <Activity size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Real-time Monitoring</h3>
            <p style={{ color: 'var(--text-muted)' }}>Get instant insights into pipeline health, build durations, and deployment success rates.</p>
          </div>
          <div className="glass-card">
            <div style={{ background: 'rgba(76, 209, 214, 0.15)', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              <Database size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Infrastructure as Code</h3>
            <p style={{ color: 'var(--text-muted)' }}>Manage your environments using standardized, version-controlled configuration templates.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '32px 48px', 
        borderTop: '1px solid var(--border-color)', 
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.875rem'
      }}>
        <span>&copy; {new Date().getFullYear()} Nexus CI/CD. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Terms</a>
          <a href="#" style={{ color: 'var(--text-muted)' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
