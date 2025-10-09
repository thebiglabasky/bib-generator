'use client';

import { processCSVToBibs } from '@/lib/bib-processor';
import { ColumnMapping, ParsedRow, RaceConfig } from '@/types';
import { Calendar, Palette, Printer, RotateCcw, Ruler, User, Users } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_RACE_CONFIGS: RaceConfig[] = [
  { id: '2016', label: '900m', yearMatch: '2016 et avant', color: '#3b82f6', isParent: false },
  { id: '2017', label: '600m', yearMatch: '2017', color: '#eab308', isParent: false },
  { id: '2018', label: '600m', yearMatch: '2018', color: '#eab308', isParent: false },
  { id: '2019', label: '300m', yearMatch: '2019', color: '#22c55e', isParent: false },
  { id: '2020', label: '300m', yearMatch: '2020', color: '#22c55e', isParent: false },
  { id: 'parent', label: '2.5km / 5km', yearMatch: 'parent', color: '#1f2937', isParent: true },
];

export default function Home() {
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [raceConfigs, setRaceConfigs] = useState<RaceConfig[]>(DEFAULT_RACE_CONFIGS);
  const [step, setStep] = useState<'upload' | 'map' | 'config' | 'preview'>('upload');
  const [fileName, setFileName] = useState<string>('');
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

    const savedCsvData = localStorage.getItem('csv-data');
    const savedHeaders = localStorage.getItem('csv-headers');
    const savedMapping = localStorage.getItem('csv-mapping');
    const savedFileName = localStorage.getItem('csv-filename');

    if (savedCsvData && savedHeaders && savedMapping) {
      try {
        setCsvData(JSON.parse(savedCsvData));
        setHeaders(JSON.parse(savedHeaders));
        setMapping(JSON.parse(savedMapping));
        setFileName(savedFileName || '');
        setStep('map');
      } catch (error) {
        console.error('Error loading CSV data:', error);
      }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length > 0) {
          const parsedHeaders = data[0];
          setHeaders(parsedHeaders);

          const rows = data.slice(1).map((row) => {
            const obj: ParsedRow = {};
            parsedHeaders.forEach((header, idx) => {
              obj[header] = row[idx] || '';
            });
            return obj;
          });
          setCsvData(rows);

          // Auto-map columns based on known CSV structure
          const autoMapping: ColumnMapping = {
            orderRef: parsedHeaders.findIndex(h => h.includes('Référence commande')),
            familyName: parsedHeaders.findIndex(h => h.includes('Nom de famille')),
            adultFirstName: parsedHeaders.findIndex(h => h.includes('Prénom Adulte 1')),
            childFirstName: parsedHeaders.findIndex(h => h.includes('Prénom de l\'enfant')),
            birthYear: parsedHeaders.findIndex(h => h.includes('Année de naissance')),
            relay: parsedHeaders.findIndex(h => h.includes('Relais Adulte')),
            adult2FirstName: parsedHeaders.findIndex(h => h.includes('Prénom Adulte 2')),
          };

          // Replace -1 with undefined for not found columns
          Object.keys(autoMapping).forEach(key => {
            if (autoMapping[key as keyof ColumnMapping] === -1) {
              autoMapping[key as keyof ColumnMapping] = undefined;
            }
          });

          setMapping(autoMapping);

          // Persist CSV data
          localStorage.setItem('csv-data', JSON.stringify(rows));
          localStorage.setItem('csv-headers', JSON.stringify(parsedHeaders));
          localStorage.setItem('csv-mapping', JSON.stringify(autoMapping));
          localStorage.setItem('csv-filename', file.name);

          setStep('map');
        }
      },
    });
  };

  const handleGenerateBibs = () => {
    const bibs = processCSVToBibs(csvData, mapping, raceConfigs);
    sessionStorage.setItem('bibs', JSON.stringify(bibs));
    window.open('/print', '_blank');
  };

  const handleStartOver = () => {
    localStorage.removeItem('csv-data');
    localStorage.removeItem('csv-headers');
    localStorage.removeItem('csv-mapping');
    localStorage.removeItem('csv-filename');
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setFileName('');
    setStep('upload');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <User size={20} />
              Générateur de Dossards
            </h1>
            <a
              href="/template"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#667eea',
                textDecoration: 'none',
                border: '2px solid #667eea',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Palette size={16} />
              Designer de Dossard
            </a>
          </div>

          {step === 'upload' && (
            <div>
              {/* Progress indicator */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', gap: '8px' }}>
                <button onClick={() => setStep('upload')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}>1</div>
                  <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>Import</span>
                </button>
                <div style={{ width: '40px', height: '2px', background: '#cbd5e0' }} />
                <button onClick={() => csvData.length > 0 && setStep('map')} disabled={csvData.length === 0} style={{ background: 'none', border: 'none', cursor: csvData.length > 0 ? 'pointer' : 'not-allowed', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', opacity: csvData.length > 0 ? 1 : 0.5 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#cbd5e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}>2</div>
                  <span style={{ color: '#cbd5e0', fontWeight: '600', fontSize: '14px' }}>Colonnes</span>
                </button>
                <div style={{ width: '40px', height: '2px', background: '#cbd5e0' }} />
                <button onClick={() => csvData.length > 0 && setStep('config')} disabled={csvData.length === 0} style={{ background: 'none', border: 'none', cursor: csvData.length > 0 ? 'pointer' : 'not-allowed', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', opacity: csvData.length > 0 ? 1 : 0.5 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#cbd5e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}>3</div>
                  <span style={{ color: '#cbd5e0', fontWeight: '600', fontSize: '14px' }}>Courses</span>
                </button>
              </div>

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  border: '3px dashed #cbd5e0',
                  borderRadius: '12px',
                  padding: '40px 30px',
                  background: '#f7fafc',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <p style={{ color: '#718096', marginBottom: '20px', fontSize: '14px' }}>Déposez votre fichier ou cliquez pour sélectionner</p>
                <label style={{
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'inline-block',
                  transition: 'all 0.2s'
                }}>
                  Choisir un fichier
                  <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                {fileName && (
                  <div style={{ marginTop: '20px', color: '#22c55e', fontWeight: '600' }}>
                    ✓ {fileName}
                  </div>
                )}
              </div>
            </div>
            </div>
          )}

      {step === 'map' && (
        <div>
          {/* Progress indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
            <button onClick={() => setStep('upload')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#22c55e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>1</div>
              <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '14px' }}>Import</span>
            </button>
            <div style={{ width: '40px', height: '2px', background: '#22c55e' }} />
            <button onClick={() => setStep('map')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#667eea',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>2</div>
              <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>Colonnes</span>
            </button>
            <div style={{ width: '40px', height: '2px', background: '#cbd5e0' }} />
            <button onClick={() => setStep('config')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#cbd5e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>3</div>
              <span style={{ color: '#cbd5e0', fontWeight: '600', fontSize: '14px' }}>Courses</span>
            </button>
          </div>

          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={handleStartOver}
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '2px solid #cbd5e0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#4a5568'
                }}
              >
                <RotateCcw size={16} /> Recommencer
              </button>
              <button
                onClick={() => setStep('config')}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Configurer courses
              </button>
              <div style={{ flex: 1 }} />
              <button
                onClick={handleGenerateBibs}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Printer size={16} />
                Générer les dossards
              </button>
            </div>

          <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '8px' }}>
            {[
              { key: 'orderRef', label: 'Référence commande', icon: '🔢' },
              { key: 'familyName', label: 'Nom de famille', icon: '👨‍👩‍👧‍👦' },
              { key: 'adultFirstName', label: 'Prénom Adulte 1', icon: '👤' },
              { key: 'childFirstName', label: 'Prénom de l\'enfant', icon: '🧒' },
              { key: 'birthYear', label: 'Année de naissance', icon: '📅' },
              { key: 'relay', label: 'Relais Adulte', icon: '🔄' },
              { key: 'adult2FirstName', label: 'Prénom Adulte 2', icon: '👥' },
            ].map(({ key, label, icon }, idx, arr) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingBottom: idx < arr.length - 1 ? '10px' : '0',
                marginBottom: idx < arr.length - 1 ? '10px' : '0',
                borderBottom: idx < arr.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</span>
                <label style={{ fontWeight: '600', color: '#2d3748', fontSize: '14px', minWidth: '160px', flexShrink: 0 }}>{label}</label>
                <select
                  value={mapping[key as keyof ColumnMapping] ?? ''}
                  onChange={(e) => {
                    const newMapping = { ...mapping, [key]: e.target.value ? parseInt(e.target.value) : undefined };
                    setMapping(newMapping);
                    localStorage.setItem('csv-mapping', JSON.stringify(newMapping));
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    border: '2px solid #e2e8f0',
                    flex: 1,
                    minWidth: 0,
                    background: 'white'
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {headers.map((header, idx) => (
                    <option key={idx} value={idx}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {step === 'config' && (
        <div>
          {/* Progress indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
            <button onClick={() => setStep('upload')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#22c55e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>1</div>
              <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '14px' }}>Import</span>
            </button>
            <div style={{ width: '40px', height: '2px', background: '#22c55e' }} />
            <button onClick={() => setStep('map')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#22c55e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>2</div>
              <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '14px' }}>Colonnes</span>
            </button>
            <div style={{ width: '40px', height: '2px', background: '#22c55e' }} />
            <button onClick={() => setStep('config')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#667eea',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>3</div>
              <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>Courses</span>
            </button>
          </div>

          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={handleStartOver}
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: '2px solid #cbd5e0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#4a5568'
                }}
              >
                <RotateCcw size={16} /> Recommencer
              </button>
              <div style={{ flex: 1 }} />
              <button
                onClick={handleGenerateBibs}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Printer size={16} />
                Générer les dossards
              </button>
            </div>

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
      )}
        </div>
      </div>
    </div>
  );
}


