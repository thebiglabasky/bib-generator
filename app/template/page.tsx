'use client';

import BibTemplateDesigner from '@/components/BibTemplateDesigner';
import { Palette } from 'lucide-react';

export default function TemplatePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '10px', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Palette size={40} />
            Designer de Dossard
          </h1>
            <p style={{ color: '#718096', fontSize: '16px' }}>Créez et personnalisez le design de vos dossards</p>
            <div style={{ marginTop: '20px' }}>
              <a
                href="/"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#667eea',
                  textDecoration: 'none',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}
              >
                ← Retour à l'accueil
              </a>
            </div>
          </div>

          <BibTemplateDesigner />
        </div>
      </div>
    </div>
  );
}
