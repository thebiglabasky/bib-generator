'use client';

import BibTemplateDesigner from '@/components/BibTemplateDesigner';
import { Palette } from 'lucide-react';

export default function TemplatePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px 20px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Palette size={24} />
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>
                Designer de Dossard
              </h1>
            </div>
            <a
              href="/"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#667eea',
                textDecoration: 'none',
                border: '1px solid #667eea',
                borderRadius: '6px',
                display: 'inline-block',
                transition: 'all 0.2s'
              }}
            >
              ← Retour
            </a>
          </div>

          <BibTemplateDesigner />
        </div>
      </div>
    </div>
  );
}
