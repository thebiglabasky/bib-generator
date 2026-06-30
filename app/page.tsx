'use client';

import { processCSVToBibs } from '@/lib/bib-processor';
import { BibData, ColumnMapping, ParsedRow, RaceConfig } from '@/types';
import { ArrowLeft, ArrowRight, Baby, Check, FileDigit, Menu, Palette, Printer, RotateCcw, Search, Trophy, User, Users } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_RACE_CONFIGS: RaceConfig[] = [
  { id: '2016', label: '900m', yearMatch: '2016 et avant', color: '#3baff7', isParent: false },
  { id: '2017', label: '600m', yearMatch: '2017', color: '#e77f08', isParent: false },
  { id: '2018', label: '600m', yearMatch: '2018', color: '#e77f0b', isParent: false },
  { id: '2019', label: '300m', yearMatch: '2019', color: '#26b55b', isParent: false },
  { id: '2020', label: '300m', yearMatch: '2020', color: '#25b65b', isParent: false },
  { id: 'parent', label: '2.5km / 5km', yearMatch: 'parent', color: '#7b37cd', isParent: true },
];

export default function Home() {
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [raceConfigs, setRaceConfigs] = useState<RaceConfig[]>(DEFAULT_RACE_CONFIGS);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string>('');
  const [allBibs, setAllBibs] = useState<BibData[]>([]);
  const [selectedBibs, setSelectedBibs] = useState<Set<number>>(new Set());
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cutoffDate, setCutoffDate] = useState<Date | null>(null);
  const [startBibNumber, setStartBibNumber] = useState<number | null>(null);
  const isFirstRender = useRef(true);

  // Apply date filter and renumber
  // When date filter is active: show only new bibs with renumbered bibs starting after printed ones
  // When no date filter: show all bibs with original numbers (category/search filters work normally)
  let displayBibs = allBibs;
  let lastPrintedBib: BibData | null = null;
  let defaultNextBibNumber = 1;

  if (cutoffDate) {
    console.log('Cutoff date:', cutoffDate);
    console.log('All bibs with dates:', allBibs.filter(b => b.registrationDate).map(b => ({
      name: `${b.firstName} ${b.lastName}`,
      date: b.registrationDate,
      orderRef: b.orderRef
    })));

    // Get unique order refs before cutoff
    const ordersBefore = new Set<string>();
    allBibs.forEach(bib => {
      if (bib.registrationDate && bib.registrationDate <= cutoffDate && bib.orderRef) {
        ordersBefore.add(bib.orderRef);
      }
    });

    defaultNextBibNumber = ordersBefore.size + 1;

    // Update startBibNumber if it's not manually set
    if (startBibNumber === null) {
      setStartBibNumber(defaultNextBibNumber);
    }

    // Find last bib from orders before cutoff
    const bibsBeforeCutoff = allBibs.filter(bib =>
      bib.registrationDate && bib.registrationDate <= cutoffDate
    );
    lastPrintedBib = bibsBeforeCutoff.length > 0 ? bibsBeforeCutoff[bibsBeforeCutoff.length - 1] : null;

    // Filter to only new bibs after cutoff
    const newBibs = allBibs.filter(bib =>
      bib.registrationDate && bib.registrationDate > cutoffDate
    );
    console.log('New bibs after cutoff:', newBibs.length, newBibs.map(b => ({
      name: `${b.firstName} ${b.lastName}`,
      date: b.registrationDate
    })));

    // Renumber the new bibs starting from actualStartNumber
    // Group by original bib number (which represents each CSV row/team)
    const actualStartNumber = startBibNumber !== null ? startBibNumber : defaultNextBibNumber;
    const bibNumberMap = new Map<number, number>();
    let nextNumber = actualStartNumber;

    // First pass: assign new bib numbers to each unique original bib number
    newBibs.forEach(bib => {
      if (!bibNumberMap.has(bib.bibNumber)) {
        bibNumberMap.set(bib.bibNumber, nextNumber);
        nextNumber++;
      }
    });

    // Second pass: apply the new bib numbers
    displayBibs = newBibs.map(bib => ({
      ...bib,
      bibNumber: bibNumberMap.get(bib.bibNumber) || bib.bibNumber
    }));
  }

  // Apply search filter (keeping original indices for selection)
  const filteredBibsWithIndices = displayBibs
    .map((bib, index) => ({ bib, originalIndex: allBibs.indexOf(allBibs.find(b => b.orderRef === bib.orderRef && b.firstName === bib.firstName && b.category === bib.category) || allBibs[0]) }))
    .filter(({ bib }) => {
      if (!searchTerm.trim()) return true;

      const searchLower = searchTerm.toLowerCase();
      const firstName = bib.firstName?.toLowerCase() || '';
      const lastName = bib.lastName?.toLowerCase() || '';
      const bibNumber = bib.bibNumber?.toString() || '';

      return firstName.includes(searchLower) ||
             lastName.includes(searchLower) ||
             bibNumber.includes(searchLower);
    });

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
        const parsedCsvData = JSON.parse(savedCsvData);
        const parsedHeaders = JSON.parse(savedHeaders);
        const parsedMapping = JSON.parse(savedMapping);
        setCsvData(parsedCsvData);
        setHeaders(parsedHeaders);
        setMapping(parsedMapping);
        setFileName(savedFileName || '');
        setStep(2);
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

  // Generate bibs when we have CSV, mapping, and configs
  useEffect(() => {
    if (csvData.length > 0 && Object.keys(mapping).length > 0 && raceConfigs.length > 0) {
      const bibs = processCSVToBibs(csvData, mapping, raceConfigs);
      setAllBibs(bibs);
      // Select all by default
      setSelectedBibs(new Set(bibs.map((_, index) => index)));
    }
  }, [csvData, mapping, raceConfigs]);

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
          const findColumnIndex = (patterns: string[]) => {
            for (const pattern of patterns) {
              const index = parsedHeaders.findIndex(h =>
                h.includes(pattern) ||
                h.replace(/"/g, '').trim().includes(pattern)
              );
              if (index !== -1) return index;
            }
            return -1;
          };

          const autoMapping: ColumnMapping = {
            orderRef: findColumnIndex(['Référence commande']),
            orderDate: findColumnIndex(['Date de la commande']),
            familyName: findColumnIndex(['Nom de famille']),
            adultFirstName: findColumnIndex(['Prénom Adulte 1']),
            childFirstName: findColumnIndex(['Prénom de l\'enfant']),
            birthYear: findColumnIndex(['Année de naissance']),
            child2FirstName: findColumnIndex(['Prénom de l\'enfant 2']),
            child2BirthYear: findColumnIndex(['Année de naissance Enfant 2']),
            child3FirstName: findColumnIndex(['Prénom de l\'enfant 3']),
            child3BirthYear: findColumnIndex(['Année de naissance Enfant 3']),
            relay: findColumnIndex(['Relais Adulte']),
            adult2FirstName: findColumnIndex(['Prénom Adulte 2']),
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

          // Check if all required columns are mapped
          const allMapped = autoMapping.orderRef !== undefined &&
                          autoMapping.familyName !== undefined &&
                          autoMapping.birthYear !== undefined;

          setStep(allMapped ? 3 : 2);
        }
      },
    });
  };

  const handleGenerateBibs = () => {
    const selectedBibData = displayBibs.filter((_, index) => selectedBibs.has(index));
    sessionStorage.setItem('selected-bibs', JSON.stringify(selectedBibData));
    window.open('/print', '_blank');
  };

  const handlePrintEmptyTemplates = () => {
    // Deduplicate by label - only create one empty bib per unique race label
    const seenLabels = new Set<string>();
    const uniqueConfigs = raceConfigs.filter(config => {
      if (seenLabels.has(config.label)) {
        return false;
      }
      seenLabels.add(config.label);
      return true;
    });

    const emptyBibs: BibData[] = uniqueConfigs.map(config => ({
      bibNumber: 0,
      firstName: '',
      lastName: '',
      raceConfig: config,
      category: config.isParent ? 'adult' : 'child1',
    }));
    sessionStorage.setItem('selected-bibs', JSON.stringify(emptyBibs));
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
    const categoryIndices = displayBibs
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
      categoryIndices.forEach(index => newSelection.delete(index));
    } else {
      categoryIndices.forEach(index => newSelection.add(index));
    }

    setSelectedBibs(newSelection);
  };

  const toggleAll = () => {
    if (selectedBibs.size === displayBibs.length) {
      setSelectedBibs(new Set());
    } else {
      setSelectedBibs(new Set(displayBibs.map((_, index) => index)));
    }
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

  const handleStartOver = () => {
    localStorage.removeItem('csv-data');
    localStorage.removeItem('csv-headers');
    localStorage.removeItem('csv-mapping');
    localStorage.removeItem('csv-filename');
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setFileName('');
    setAllBibs([]);
    setSelectedBibs(new Set());
    setStep(1);
  };

  const canGenerate = csvData.length > 0 && Object.keys(mapping).length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FileDigit size={24} />
              Générateur de Dossards
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {canGenerate && (() => {
                const selectedCount = displayBibs.filter((_, index) => selectedBibs.has(index)).length;
                return (
                  <button
                    onClick={handleGenerateBibs}
                    disabled={selectedCount === 0}
                    style={{
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                      background: selectedCount === 0 ? '#cbd5e0' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: selectedCount === 0 ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: selectedCount === 0 ? 0.6 : 1
                    }}
                  >
                    <Printer size={16} />
                    Générer {selectedCount > 0 && `${selectedCount} dossard${selectedCount !== 1 ? 's' : ''}`}
                  </button>
                );
              })()}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowConfigMenu(!showConfigMenu)}
                  style={{
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#667eea',
                    background: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Menu size={18} />
                </button>
                {showConfigMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '50px',
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    minWidth: '240px',
                    zIndex: 1000
                  }}>
                    <a
                      href="/template"
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4a5568',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <Palette size={16} />
                      Designer de Dossard
                    </a>
                    <a
                      href="/config"
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4a5568',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <Trophy size={16} />
                      Configuration Courses
                    </a>
                    <button
                      onClick={() => {
                        handlePrintEmptyTemplates();
                        setShowConfigMenu(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4a5568',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <Printer size={16} />
                      Imprimer Dossards Vides
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', gap: '8px' }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === 1 ? '#667eea' : (csvData.length > 0 ? '#22c55e' : '#cbd5e0'),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>1</div>
              <span style={{ color: step === 1 ? '#667eea' : (csvData.length > 0 ? '#22c55e' : '#cbd5e0'), fontWeight: '600', fontSize: '14px' }}>Import CSV</span>
            </button>
            <div style={{ width: '40px', height: '2px', background: csvData.length > 0 ? '#22c55e' : '#cbd5e0' }} />
            <button onClick={() => csvData.length > 0 && setStep(2)} disabled={csvData.length === 0} style={{ background: 'none', border: 'none', cursor: csvData.length > 0 ? 'pointer' : 'not-allowed', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === 2 ? '#667eea' : (canGenerate ? '#22c55e' : '#cbd5e0'),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>2</div>
              <span style={{ color: step === 2 ? '#667eea' : (canGenerate ? '#22c55e' : '#cbd5e0'), fontWeight: '600', fontSize: '14px' }}>Colonnes</span>
            </button>
            <div style={{ width: '40px', height: '2px', background: canGenerate ? '#22c55e' : '#cbd5e0' }} />
            <button onClick={() => canGenerate && setStep(3)} disabled={!canGenerate} style={{ background: 'none', border: 'none', cursor: canGenerate ? 'pointer' : 'not-allowed', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === 3 ? '#667eea' : '#cbd5e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>3</div>
              <span style={{ color: step === 3 ? '#667eea' : '#cbd5e0', fontWeight: '600', fontSize: '14px' }}>Sélection</span>
            </button>
          </div>

          {/* Step 1: Upload CSV */}
          {step === 1 && (
            <div>
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

              {/* Bottom navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f7fafc' }}>
                <button
                  onClick={handleStartOver}
                  disabled={csvData.length === 0}
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: csvData.length === 0 ? 'not-allowed' : 'pointer',
                    border: '2px solid #cbd5e0',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#4a5568',
                    opacity: csvData.length === 0 ? 0.5 : 1
                  }}
                >
                  <RotateCcw size={16} /> Recommencer
                </button>
                {csvData.length > 0 ? (
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    Suivant <ArrowRight size={16} />
                  </button>
                ) : (
                  <div style={{ width: '100px' }} />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Map columns */}
          {step === 2 && (
            <div>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '8px' }}>
                  {[
                    { key: 'orderRef', label: 'Référence commande', icon: '🔢' },
                    { key: 'orderDate', label: 'Date de la commande', icon: '📅' },
                    { key: 'familyName', label: 'Nom de famille', icon: '👨‍👩‍👧‍👦' },
                    { key: 'adultFirstName', label: 'Prénom Adulte 1', icon: '👤' },
                    { key: 'childFirstName', label: 'Prénom de l\'enfant', icon: '🧒' },
                    { key: 'birthYear', label: 'Année de naissance', icon: '📅' },
                    { key: 'child2FirstName', label: 'Prénom de l\'enfant 2', icon: '👶' },
                    { key: 'child2BirthYear', label: 'Année de naissance Enfant 2', icon: '📅' },
                    { key: 'child3FirstName', label: 'Prénom de l\'enfant 3', icon: '👶' },
                    { key: 'child3BirthYear', label: 'Année de naissance Enfant 3', icon: '📅' },
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

              {/* Bottom navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f7fafc' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#667eea'
                  }}
                >
                  <ArrowLeft size={16} /> Précédent
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select bibs */}
          {step === 3 && (
            <div>
              {/* Date filter section */}
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0f9ff', border: '2px solid #bfdbfe', borderRadius: '8px' }}>
                {mapping.orderDate == null && (
                  <div style={{ padding: '12px', marginBottom: '12px', backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '6px' }}>
                    <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                      ⚠️ Colonne "Date de la commande" non mappée
                    </div>
                    <div style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>
                      Pour utiliser le filtre par date, retournez à l'étape 2 et mappez la colonne "Date de la commande"
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <label style={{ fontWeight: '600', color: '#1e40af', fontSize: '14px' }}>
                    Afficher uniquement les inscriptions depuis :
                  </label>
                  <input
                    type="datetime-local"
                    value={cutoffDate ? cutoffDate.toISOString().slice(0, 16) : ''}
                    disabled={mapping.orderDate == null}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCutoffDate(new Date(e.target.value));
                        setStartBibNumber(null); // Reset to auto-calculate
                      } else {
                        setCutoffDate(null);
                        setStartBibNumber(null);
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#1e3a8a',
                      backgroundColor: mapping.orderDate == null ? '#e2e8f0' : 'white',
                      cursor: mapping.orderDate == null ? 'not-allowed' : 'text',
                      opacity: mapping.orderDate == null ? 0.6 : 1
                    }}
                  />
                  {cutoffDate && (
                    <>
                      <button
                        onClick={() => {
                          setCutoffDate(null);
                          setStartBibNumber(null);
                        }}
                        style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px'
                        }}
                      >
                        Tout afficher
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <label style={{ fontWeight: '600', color: '#1e40af', fontSize: '14px', whiteSpace: 'nowrap' }}>
                          Commencer à :
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={startBibNumber !== null ? startBibNumber : defaultNextBibNumber}
                          onChange={(e) => setStartBibNumber(parseInt(e.target.value) || 1)}
                          style={{
                            padding: '8px 12px',
                            border: '2px solid #3b82f6',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: '#1e3a8a',
                            backgroundColor: 'white',
                            width: '80px'
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {cutoffDate && (
                  <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                    {lastPrintedBib && (
                      <>
                        <div style={{ fontSize: '13px', color: '#1e3a8a', marginBottom: '4px', fontWeight: '600' }}>
                          Dernier dossard imprimé : #{lastPrintedBib.bibNumber} - {lastPrintedBib.firstName} {lastPrintedBib.lastName} ({lastPrintedBib.category})
                        </div>
                        {lastPrintedBib.registrationDate && (
                          <div style={{ fontSize: '12px', color: '#3b82f6' }}>
                            Inscrit le : {lastPrintedBib.registrationDate.toLocaleDateString('fr-FR')} à {lastPrintedBib.registrationDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        <div style={{ marginTop: '8px', marginBottom: '8px', borderTop: '1px solid #93c5fd' }} />
                      </>
                    )}
                    <div style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                      → Prochains dossards commencent à : #{startBibNumber !== null ? startBibNumber : defaultNextBibNumber}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                      {displayBibs.length} nouveau{displayBibs.length > 1 ? 'x' : ''} dossard{displayBibs.length > 1 ? 's' : ''} à imprimer
                    </div>
                  </div>
                )}
              </div>

              {/* Selection controls */}
              <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={toggleAll}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: selectedBibs.size === displayBibs.length ? '#22c55e' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={16} />
                  {selectedBibs.size === displayBibs.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(() => {
                    const isAdultsSelected = displayBibs
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
                    const isChild1Selected = displayBibs
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
                    const isChild2Selected = displayBibs
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
                    const isChild3Selected = displayBibs
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

                {/* Search input on the right */}
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#a0aec0'
                    }} />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#2d3748',
                        backgroundColor: 'white',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
              </div>

              {/* Bib list */}
              <div style={{ maxHeight: '500px', overflowY: 'auto', border: '2px solid #f7fafc', borderRadius: '8px' }}>
                {filteredBibsWithIndices.map(({ bib, originalIndex }, idx) => (
                  <div key={`${bib.orderRef}-${bib.firstName}-${bib.category}-${idx}`} style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: selectedBibs.has(originalIndex) ? '#f0f9ff' : 'white',
                    transition: 'background 0.2s'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }} onClick={() => toggleBibSelection(originalIndex)}>
                      <input
                        type="checkbox"
                        checked={selectedBibs.has(originalIndex)}
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
                  Aucun dossard trouvé.
                </div>
              )}

              {/* Bottom navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f7fafc' }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#667eea'
                  }}
                >
                  <ArrowLeft size={16} /> Précédent
                </button>
                <div style={{ width: '100px' }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
          Hervé Labas
        </div>
      </div>
    </div>
  );
}


