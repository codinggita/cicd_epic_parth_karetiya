import React from 'react';
import { FileCode, CheckCircle } from 'lucide-react';

const YamlTools = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>YAML Tools</h1>
        <p style={{ color: 'var(--text-muted)' }}>Validate, format, and convert your CI/CD configuration files.</p>
      </header>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }}><CheckCircle size={18} /> Validate YAML</button>
          <button className="btn btn-secondary" style={{ flex: 1 }}><FileCode size={18} /> Format</button>
          <button className="btn btn-secondary" style={{ flex: 1 }}>Convert to JSON</button>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ color: 'white' }}>YAML Content</label>
          <textarea 
            className="form-control" 
            rows="15" 
            placeholder="name: CI Pipeline&#10;on: push&#10;jobs:&#10;  build:&#10;    runs-on: ubuntu-latest"
            style={{ fontFamily: 'monospace', fontSize: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#10b981' }}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default YamlTools;
