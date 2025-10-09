'use client';

import { BibData, BibTemplateConfig, TemplateElement } from '@/types';
import React, { useState } from 'react';

interface PreviewPanelProps {
  template: BibTemplateConfig;
  isVisible: boolean;
}

function getVariableValue(variable: string, testData: BibData): string {
  switch (variable) {
    case 'bib.number':
      return testData.bibNumber.toString().padStart(3, '0');
    case 'participant.firstName':
      return testData.firstName;
    case 'participant.lastName':
      return testData.lastName;
    case 'race.label':
    case 'race.distance':
      return testData.raceConfig.label;
    case 'race.color':
      return testData.raceConfig.color;
    case 'race.id':
      return testData.raceConfig.id;
    default:
      return '';
  }
}

function replaceTemplateVariables(content: string, testData: BibData): string {
  return content
    .replace('{bib.number}', testData.bibNumber.toString().padStart(3, '0'))
    .replace('{participant.firstName}', testData.firstName)
    .replace('{participant.lastName}', testData.lastName)
    .replace('{race.distance}', testData.raceConfig.label)
    .replace('{race.label}', testData.raceConfig.label)
    .replace('{race.color}', testData.raceConfig.color)
    .replace('{race.id}', testData.raceConfig.id);
}

function resolveColorValue(color: string | undefined, testData: BibData, defaultColor: string): string {
  if (!color) return defaultColor;

  // Check if color contains a variable reference
  if (color.includes('{') && color.includes('}')) {
    return replaceTemplateVariables(color, testData);
  }

  return color;
}

function shouldDisplayElement(element: TemplateElement, testData: BibData): boolean {
  if (!element.condition) {
    return true;
  }

  const actualValue = getVariableValue(element.condition.variable, testData);
  return actualValue === element.condition.value;
}

const PRESET_RACES = [
  { id: '2016', label: '900m', color: '#3b82f6' },
  { id: '2017', label: '600m', color: '#eab308' },
  { id: '2018', label: '600m', color: '#f97316' },
  { id: '2019', label: '300m', color: '#10b981' },
  { id: '2020', label: '300m', color: '#22c55e' },
  { id: 'parent', label: '2.5km', color: '#1f2937' },
];

export default function PreviewPanel({ template, isVisible }: PreviewPanelProps) {
  const [testData, setTestData] = useState<BibData>({
    bibNumber: 123,
    firstName: 'Jean',
    lastName: 'DUPONT',
    raceConfig: {
      id: '2020',
      label: '300m',
      yearMatch: '2020',
      color: '#22c55e',
      isParent: false
    }
  });

  const applyPreset = (preset: typeof PRESET_RACES[0]) => {
    setTestData({
      ...testData,
      raceConfig: {
        ...testData.raceConfig,
        id: preset.id,
        label: preset.label,
        color: preset.color
      }
    });
  };

  const renderElement = (element: TemplateElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
    };

    if (element.type === 'shape') {
      const backgroundColor = resolveColorValue(element.backgroundColor, testData, '#ffffff');
      const borderWidth = element.borderWidth || 0;
      const borderColor = resolveColorValue(element.borderColor, testData, '#000000');
      const borderRadius = element.borderRadius || 0;
      const rotation = element.rotation || 0;

      const rotationTransform = rotation !== 0 ? `rotate(${rotation}deg)` : undefined;

      return (
        <div
          key={element.id}
          style={{
            ...style,
            width: `${element.width}%`,
            height: `${element.height}%`,
            backgroundColor: backgroundColor,
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            borderRadius: `${borderRadius}px`,
            transform: rotationTransform,
            transformOrigin: 'center center'
          }}
        />
      );
    }

    if (element.type === 'image') {
      const objectFit = element.objectFit || 'contain';
      const rotation = element.rotation || 0;

      const rotationTransform = rotation !== 0 ? `rotate(${rotation}deg)` : undefined;

      return (
        <img
          key={element.id}
          src={element.src}
          alt="Template element"
          style={{
            ...style,
            width: `${element.width}%`,
            height: `${element.height}%`,
            objectFit: objectFit,
            transform: rotationTransform,
            transformOrigin: 'center center'
          }}
        />
      );
    }

    const hasExplicitSize = element.width !== undefined && element.height !== undefined;
    const textAlign = element.anchor || 'left';
    const verticalAnchor = element.verticalAnchor || 'top';

    // Map vertical anchor to flexbox alignment
    let alignItems: 'flex-start' | 'center' | 'flex-end' = 'flex-start';
    if (verticalAnchor === 'middle') {
      alignItems = 'center';
    } else if (verticalAnchor === 'bottom') {
      alignItems = 'flex-end';
    }

    return (
      <div
        key={element.id}
        style={{
          ...style,
          width: hasExplicitSize ? `${element.width}%` : 'auto',
          height: hasExplicitSize ? `${element.height}%` : 'auto',
          display: 'flex',
          alignItems: alignItems,
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textDecoration: element.textDecoration,
          fontFamily: element.fontFamily,
          color: resolveColorValue(element.color, testData, '#000000'),
          textAlign: textAlign,
          textTransform: element.textTransform,
          whiteSpace: hasExplicitSize ? 'pre-wrap' : 'pre-wrap',
          lineHeight: 1.2,
          overflow: hasExplicitSize ? 'hidden' : 'visible',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%' }}>
          {replaceTemplateVariables(element.content || '', testData)}
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div style={{ width: '100%', marginBottom: '15px' }}>
      <div style={{ background: '#f7fafc', borderRadius: '8px', padding: '12px' }}>
        <h3 style={{ color: '#2d3748', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>
          Prévisualisation avec données de test
        </h3>

        <>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '500' }}>
                Préréglages:
              </label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {PRESET_RACES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    style={{
                      padding: '4px 8px',
                      background: testData.raceConfig.id === preset.id ? preset.color : 'white',
                      color: testData.raceConfig.id === preset.id ? 'white' : '#4a5568',
                      border: `1px solid ${preset.color}`,
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
              marginBottom: '10px',
              fontSize: '11px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: '500' }}>Numéro</label>
                <input
                  type="number"
                  value={testData.bibNumber}
                  onChange={(e) => setTestData({ ...testData, bibNumber: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: '500' }}>Prénom</label>
                <input
                  type="text"
                  value={testData.firstName}
                  onChange={(e) => setTestData({ ...testData, firstName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: '500' }}>Nom</label>
                <input
                  type="text"
                  value={testData.lastName}
                  onChange={(e) => setTestData({ ...testData, lastName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: '500' }}>race.id</label>
                <input
                  type="text"
                  value={testData.raceConfig.id}
                  onChange={(e) => setTestData({
                    ...testData,
                    raceConfig: { ...testData.raceConfig, id: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: '500' }}>race.label</label>
                <input
                  type="text"
                  value={testData.raceConfig.label}
                  onChange={(e) => setTestData({
                    ...testData,
                    raceConfig: { ...testData.raceConfig, label: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '2px', fontSize: '10px', fontWeight: '500' }}>race.color</label>
                <input
                  type="color"
                  value={testData.raceConfig.color}
                  onChange={(e) => setTestData({
                    ...testData,
                    raceConfig: { ...testData.raceConfig, color: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    height: '24px',
                    padding: '1px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '6px',
              padding: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: `${(template.height / template.width) * 400 * 0.4 + 100}px`
            }}>
              <div
                style={{
                  width: `${template.width}mm`,
                  height: `${template.height}mm`,
                  borderRadius: '6px',
                  padding: '20mm',
                  boxSizing: 'border-box',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'scale(0.4)',
                  transformOrigin: 'center'
                }}
              >
                <div
                  style={{
                    background: template.backgroundColor,
                    width: '100%',
                    height: '100%',
                    borderRadius: `${template.borderRadius}px`,
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {template.elements.filter(el => shouldDisplayElement(el, testData)).map(renderElement)}
                </div>
              </div>
            </div>
        </>
      </div>
    </div>
  );
}

