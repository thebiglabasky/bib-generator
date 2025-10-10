'use client';

import { processCSVToBibs } from '@/lib/bib-processor';
import { BibData, ColumnMapping, ParsedRow, RaceConfig } from '@/types';
import { Baby, Calendar, Check, Printer, RotateCcw, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SelectPage() {
  const [allBibs, setAllBibs] = useState<BibData[]>([]);
  const [selectedBibs, setSelectedBibs] = useState<Set<number>>(new Set()); // Set of bib indices
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [raceConfigs, setRaceConfigs] = useState<RaceConfig[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedCsvData = localStorage.getItem('csv-data');
    const savedMapping = localStorage.getItem('csv-mapping');
    const savedRaceConfigs = localStorage.getItem('race-configs');

    if (savedCsvData && savedMapping && savedRaceConfigs) {
      try {
        const parsedCsvData = JSON.parse(savedCsvData);
        const parsedMapping = JSON.parse(savedMapping);
        const parsedRaceConfigs = JSON.parse(savedRaceConfigs);

        setCsvData(parsedCsvData);
        setMapping(parsedMapping);
        setRaceConfigs(parsedRaceConfigs);

        // Generate all bibs
        const bibs = processCSVToBibs(parsedCsvData, parsedMapping, parsedRaceConfigs);
        setAllBibs(bibs);

        // Select all by default (using indices)
        setSelectedBibs(new Set(bibs.map((_, index) => index)));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, []);

  const handleGenerateSelectedBibs = () => {
    const selectedBibData = allBibs.filter((_, index) => selectedBibs.has(index));
    sessionStorage.setItem('selected-bibs', JSON.stringify(selectedBibData));
    window.open('/print', '_blank');
  };

  const toggleBibSelection = (bibIndex: number) => {
    const newSelection = new Set(selectedBibs);
    if (newSelection.has(bibIndex)) {
      newSelection.delete(bibIndex);
    } else {
      newSelection.add(bibIndex);
    }
    setSelectedBibs(newSelection);
  };

  const toggleCategory = (category: string) => {
    const categoryIndices = allBibs
      .map((bib, index) => ({ bib, index }))
      .filter(({ bib }) => {
        if (category === 'adults') return bib.category === 'adult';
        if (category === 'child1') return bib.category === 'child1';
        if (category === 'child2') return bib.category === 'child2';
        if (category === 'child3') return bib.category === 'child3';
        return false;
      })
      .map(({ index }) => index);

    const newSelection = new Set(selectedBibs);
    const allCategorySelected = categoryIndices.every(index => newSelection.has(index));

    if (allCategorySelected) {
      // Remove all from this category
      categoryIndices.forEach(index => newSelection.delete(index));
    } else {
      // Add all from this category
      categoryIndices.forEach(index => newSelection.add(index));
    }

    setSelectedBibs(newSelection);
  };

  const toggleAll = () => {
    if (selectedBibs.size === allBibs.length) {
      setSelectedBibs(new Set());
    } else {
      setSelectedBibs(new Set(allBibs.map((_, index) => index)));
    }
  };

  const handleStartOver = () => {
    localStorage.removeItem('csv-data');
    localStorage.removeItem('csv-headers');
    localStorage.removeItem('csv-mapping');
    localStorage.removeItem('csv-filename');
    localStorage.removeItem('race-configs');
    window.location.href = '/';
  };


  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'adult': return <User size={16} />;
      case 'child1': return <Baby size={16} />;
      case 'child2': return <Baby size={16} />;
      case 'child3': return <Baby size={16} />;
      default: return <User size={16} />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'adult': return 'Adulte';
      case 'child1': return 'Enfant 1';
      case 'child2': return 'Enfant 2';
      case 'child3': return 'Enfant 3';
      default: return 'Inconnu';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Check size={20} />
              Sélection des Dossards
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
              <Calendar size={16} />
              Designer de Dossard
            </a>
          </div>

          {/* Progress indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', gap: '8px' }}>
            <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              }}>3</div>
              <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '14px' }}>Courses</span>
            </button>
            <div style={{ width: '40px', height: '2px', background: '#22c55e' }} />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              }}>4</div>
              <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>Sélection</span>
            </button>
          </div>

          {/* Selection controls */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
              onClick={toggleAll}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: selectedBibs.size === allBibs.length ? '#22c55e' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Check size={16} />
              {selectedBibs.size === allBibs.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(() => {
                const isAdultsSelected = allBibs
                  .map((bib, index) => ({ bib, index }))
                  .filter(({ bib }) => bib.category === 'adult')
                  .every(({ index }) => selectedBibs.has(index));

                return (
                  <button
                    onClick={() => toggleCategory('adults')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: isAdultsSelected ? '#22c55e' : '#f7fafc',
                      color: isAdultsSelected ? 'white' : '#4a5568',
                      border: `2px solid ${isAdultsSelected ? '#22c55e' : '#e2e8f0'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Users size={14} />
                    Adultes
                  </button>
                );
              })()}
              {(() => {
                const isChild1Selected = allBibs
                  .map((bib, index) => ({ bib, index }))
                  .filter(({ bib }) => bib.category === 'child1')
                  .every(({ index }) => selectedBibs.has(index));

                return (
                  <button
                    onClick={() => toggleCategory('child1')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: isChild1Selected ? '#22c55e' : '#f7fafc',
                      color: isChild1Selected ? 'white' : '#4a5568',
                      border: `2px solid ${isChild1Selected ? '#22c55e' : '#e2e8f0'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Baby size={14} />
                    Enfant 1
                  </button>
                );
              })()}
              {(() => {
                const isChild2Selected = allBibs
                  .map((bib, index) => ({ bib, index }))
                  .filter(({ bib }) => bib.category === 'child2')
                  .every(({ index }) => selectedBibs.has(index));

                return (
                  <button
                    onClick={() => toggleCategory('child2')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: isChild2Selected ? '#22c55e' : '#f7fafc',
                      color: isChild2Selected ? 'white' : '#4a5568',
                      border: `2px solid ${isChild2Selected ? '#22c55e' : '#e2e8f0'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Baby size={14} />
                    Enfant 2
                  </button>
                );
              })()}
              {(() => {
                const isChild3Selected = allBibs
                  .map((bib, index) => ({ bib, index }))
                  .filter(({ bib }) => bib.category === 'child3')
                  .every(({ index }) => selectedBibs.has(index));

                return (
                  <button
                    onClick={() => toggleCategory('child3')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: isChild3Selected ? '#22c55e' : '#f7fafc',
                      color: isChild3Selected ? 'white' : '#4a5568',
                      border: `2px solid ${isChild3Selected ? '#22c55e' : '#e2e8f0'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Baby size={14} />
                    Enfant 3
                  </button>
                );
              })()}
            </div>

            <div style={{ flex: 1 }} />
            <button
              onClick={handleGenerateSelectedBibs}
              disabled={selectedBibs.size === 0}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: selectedBibs.size === 0 ? 'not-allowed' : 'pointer',
                background: selectedBibs.size === 0 ? '#cbd5e0' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: selectedBibs.size === 0 ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: selectedBibs.size === 0 ? 0.6 : 1
              }}
            >
              <Printer size={16} />
              Générer {selectedBibs.size} dossard{selectedBibs.size !== 1 ? 's' : ''}
            </button>
          </div>

          {/* Bib list */}
          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '2px solid #f7fafc', borderRadius: '8px' }}>
            {allBibs.map((bib, index) => (
              <div key={index} style={{
                borderBottom: '1px solid #e2e8f0',
                background: selectedBibs.has(index) ? '#f0f9ff' : 'white',
                transition: 'background 0.2s'
              }}>
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }} onClick={() => toggleBibSelection(index)}>
                  <input
                    type="checkbox"
                    checked={selectedBibs.has(index)}
                    onChange={() => {}} // Handled by onClick
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {bib.bibNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      {getCategoryIcon(bib.category)}
                      <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '15px' }}>
                        {bib.firstName} {bib.lastName.toUpperCase()}
                      </span>
                      <span style={{
                        background: bib.raceConfig.color,
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {getCategoryLabel(bib.category)}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#4a5568' }}>
                      {bib.raceConfig.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allBibs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              Aucun dossard trouvé. Veuillez recommencer le processus.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
