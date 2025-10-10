'use client';

import { RaceConfig } from '@/types';
import { Calendar, Palette, Ruler, Trophy, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_RACE_CONFIGS: RaceConfig[] = [
  { id: '2016', label: '900m', yearMatch: '2016 et avant', color: '#3b82f6', isParent: false },
  { id: '2017', label: '600m', yearMatch: '2017', color: '#eab308', isParent: false },
  { id: '2018', label: '600m', yearMatch: '2018', color: '#eab308', isParent: false },
  { id: '2019', label: '300m', yearMatch: '2019', color: '#22c55e', isParent: false },
  { id: '2020', label: '300m', yearMatch: '2020', color: '#22c55e', isParent: false },
  { id: 'parent', label: '2.5km / 5km', yearMatch: 'parent', color: '#1f2937', isParent: true },
];

export default function ConfigPage() {
  const [raceConfigs, setRaceConfigs] = useState<RaceConfig[]>(DEFAULT_RACE_CONFIGS);
  const isFirstRender = useRef(true);

  // Load persisted data on mount
  useEffect(() => {
    const savedConfigs = localStorage.getItem('race-configs');
    if (savedConfigs) {
      try {
        setRaceConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Error loading race configs:', error);
      }
    } else {
      // Save default configs if none exist
      localStorage.setItem('race-configs', JSON.stringify(DEFAULT_RACE_CONFIGS));
    }
  }, []);

  // Persist race configs whenever they change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (raceConfigs.length > 0) {
      localStorage.setItem('race-configs', JSON.stringify(raceConfigs));
    }
  }, [raceConfigs]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Trophy size={20} />
              Configuration des Courses
            </h1>
            <a
              href="/"
              style={{
                padding: '8px 8px 6px 8px',
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
              <X size={20} />
            </a>
          </div>

          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 180px 140px 120px',
                gap: '12px',
                fontWeight: '600',
                padding: '10px',
                paddingBottom: '12px',
                borderBottom: '3px solid #e2e8f0',
                color: '#4a5568',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ruler size={16} />
                  Distance
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} />
                  Année
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={16} />
                  Couleur
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} />
                  Adulte?
                </div>
              </div>
              {raceConfigs.map((config, idx) => (
                <div key={config.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 180px 140px 120px',
                  gap: '12px',
                  alignItems: 'center',
                  background: '#f7fafc',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  <input
                    value={config.label}
                    onChange={(e) => {
                      const updated = [...raceConfigs];
                      updated[idx].label = e.target.value;
                      setRaceConfigs(updated);
                    }}
                    placeholder="ex: 900m"
                    style={{
                      padding: '8px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '2px solid #e2e8f0',
                      background: 'white',
                      fontWeight: '600'
                    }}
                  />
                  <input
                    value={config.yearMatch}
                    onChange={(e) => {
                      const updated = [...raceConfigs];
                      updated[idx].yearMatch = e.target.value;
                      setRaceConfigs(updated);
                    }}
                    placeholder="ex: 2020"
                    style={{
                      padding: '8px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '2px solid #e2e8f0',
                      background: 'white'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => {
                        const updated = [...raceConfigs];
                        updated[idx].color = e.target.value;
                        setRaceConfigs(updated);
                      }}
                      style={{
                        width: '30px',
                        height: '36px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    />
                  </div>
                  <label style={{
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}>
                    <input
                      type="checkbox"
                      checked={config.isParent || false}
                      onChange={(e) => {
                        const updated = [...raceConfigs];
                        updated[idx].isParent = e.target.checked;
                        setRaceConfigs(updated);
                      }}
                      style={{
                        marginRight: '8px',
                        cursor: 'pointer',
                        width: '18px',
                        height: '18px'
                      }}
                    />
                    Oui
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

