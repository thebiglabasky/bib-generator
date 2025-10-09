'use client';

import { Braces } from 'lucide-react';
import { useState } from 'react';
import VariableAutocomplete from './VariableAutocomplete';

interface ColorInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ColorInput({
  label,
  value,
  onChange,
  placeholder = '{race.color}'
}: ColorInputProps) {
  // Determine initial mode based on value
  const isVariable = value?.includes('{') || !value?.startsWith('#');
  const [useVariable, setUseVariable] = useState(isVariable);

  const handleToggle = () => {
    const newMode = !useVariable;
    setUseVariable(newMode);

    // When switching to color mode, set a default if empty or variable
    if (!newMode && (!value || value.includes('{'))) {
      onChange('#000000');
    }
    // When switching to variable mode, clear if it's a hex color
    if (newMode && value?.startsWith('#')) {
      onChange('');
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '2px',
        height: '16px' // Fixed height to prevent layout shift
      }}>
        <label style={{ fontSize: '11px', flex: 1, lineHeight: '16px' }}>{label}</label>
        <button
          onClick={handleToggle}
          title={useVariable ? 'Utiliser une couleur statique' : 'Utiliser une variable'}
          style={{
            padding: '2px 6px',
            background: useVariable ? '#667eea' : '#e2e8f0',
            color: useVariable ? 'white' : '#4a5568',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            fontWeight: '600',
            height: '16px',
            minWidth: '28px', // Fixed width to prevent button size change
            flexShrink: 0
          }}
        >
          <Braces size={12} />
        </button>
      </div>

      <div style={{ minHeight: '32px' }}> {/* Fixed height container */}
        {useVariable ? (
          <VariableAutocomplete
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid #e2e8f0',
              borderRadius: '3px',
              fontSize: '11px',
              height: '24px',
              boxSizing: 'border-box'
            }}
          />
        ) : (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '24px' }}>
            <input
              type="text"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{
                flex: 1,
                padding: '4px',
                border: '1px solid #e2e8f0',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'monospace',
                height: '24px',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="color"
              value={value?.startsWith('#') && value.length >= 7 ? value : '#000000'}
              onChange={(e) => onChange(e.target.value)}
              title="Choisir une couleur"
              style={{
                width: '24px',
                height: '24px',
                border: '1px solid #e2e8f0',
                borderRadius: '3px',
                cursor: 'pointer',
                padding: '0',
                flexShrink: 0
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

