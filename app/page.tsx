'use client';

import { processCSVToBibs } from '@/lib/bib-processor';
import { ColumnMapping, ParsedRow, RaceConfig } from '@/types';
import { Calendar, Palette, Ruler, Target, User, Users } from 'lucide-react';
import Papa from 'papaparse';
import { useState } from 'react';

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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div></div>
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
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '10px', color: '#1a202c', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <User size={40} />
            Générateur de Dossards
          </h1>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: '40px', fontSize: '16px' }}>Course Parents-Enfants</p>

          {/* Progress indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step === 'upload' ? '#667eea' : '#22c55e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>1</div>
              <span style={{ color: step === 'upload' ? '#667eea' : '#22c55e', fontWeight: '600' }}>Import</span>
            </div>
            <div style={{ width: '60px', height: '2px', background: step === 'map' || step === 'config' ? '#22c55e' : '#cbd5e0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step === 'map' ? '#667eea' : step === 'config' ? '#22c55e' : '#cbd5e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>2</div>
              <span style={{ color: step === 'map' ? '#667eea' : step === 'config' ? '#22c55e' : '#cbd5e0', fontWeight: '600' }}>Colonnes</span>
            </div>
            <div style={{ width: '60px', height: '2px', background: step === 'config' ? '#22c55e' : '#cbd5e0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step === 'config' ? '#667eea' : '#cbd5e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>3</div>
              <span style={{ color: step === 'config' ? '#667eea' : '#cbd5e0', fontWeight: '600' }}>Courses</span>
            </div>
          </div>

          {step === 'upload' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                border: '3px dashed #cbd5e0',
                borderRadius: '12px',
                padding: '60px 40px',
                background: '#f7fafc',
                transition: 'all 0.2s'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
                <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#2d3748' }}>Importer le fichier CSV</h2>
                <p style={{ color: '#718096', marginBottom: '30px' }}>Déposez votre fichier ou cliquez pour sélectionner</p>
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
          )}

      {step === 'map' && (
        <div>
          <h2 style={{ fontSize: '28px', marginBottom: '10px', color: '#2d3748', fontWeight: '700' }}>Correspondance des colonnes</h2>
          <p style={{ color: '#718096', marginBottom: '30px' }}>Vérifiez que les colonnes sont correctement mappées</p>
          <div style={{ display: 'grid', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
            {[
              { key: 'orderRef', label: 'Référence commande', icon: '🔢' },
              { key: 'familyName', label: 'Nom de famille', icon: '👨‍👩‍👧‍👦' },
              { key: 'adultFirstName', label: 'Prénom Adulte 1', icon: '👤' },
              { key: 'childFirstName', label: 'Prénom de l\'enfant', icon: '🧒' },
              { key: 'birthYear', label: 'Année de naissance', icon: '📅' },
              { key: 'relay', label: 'Relais Adulte', icon: '🔄' },
              { key: 'adult2FirstName', label: 'Prénom Adulte 2', icon: '👥' },
            ].map(({ key, label, icon }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f7fafc', padding: '15px', borderRadius: '8px' }}>
                <span style={{ fontSize: '24px' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: '600', color: '#2d3748', display: 'block', marginBottom: '8px' }}>{label}</label>
                  <select
                    value={mapping[key as keyof ColumnMapping] ?? ''}
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value ? parseInt(e.target.value) : undefined })}
                    style={{
                      padding: '10px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '2px solid #e2e8f0',
                      width: '100%',
                      background: 'white'
                    }}
                  >
                    <option value="">-- Sélectionner une colonne --</option>
                    {headers.map((header, idx) => (
                      <option key={idx} value={idx}>{header}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => setStep('upload')}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                border: '2px solid #cbd5e0',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#4a5568'
              }}
            >
              ← Retour
            </button>
            <button
              onClick={() => setStep('config')}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px'
              }}
            >
              Suivant: Courses →
            </button>
          </div>
        </div>
      )}

      {step === 'config' && (
        <div>
          <h2 style={{ fontSize: '28px', marginBottom: '10px', color: '#2d3748', fontWeight: '700' }}>Configuration des courses</h2>
          <p style={{ color: '#718096', marginBottom: '30px' }}>Ajustez les distances et couleurs des dossards</p>
          <div style={{ display: 'grid', gap: '15px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '180px 180px 140px 120px',
              gap: '15px',
              fontWeight: '600',
              paddingBottom: '15px',
              borderBottom: '3px solid #e2e8f0',
              color: '#4a5568'
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
                gap: '15px',
                alignItems: 'center',
                background: '#f7fafc',
                padding: '15px',
                borderRadius: '8px'
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
                    padding: '10px',
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
                    padding: '10px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    border: '2px solid #e2e8f0',
                    background: 'white'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => {
                      const updated = [...raceConfigs];
                      updated[idx].color = e.target.value;
                      setRaceConfigs(updated);
                    }}
                    style={{
                      width: '50px',
                      height: '40px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{
                    width: '60px',
                    height: '30px',
                    backgroundColor: config.color,
                    borderRadius: '6px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} />
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
          <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => setStep('map')}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                border: '2px solid #cbd5e0',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#4a5568'
              }}
            >
              ← Retour
            </button>
            <button
              onClick={handleGenerateBibs}
              style={{
                padding: '14px 40px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Target size={20} />
              Générer les dossards
            </button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}


