'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface VariableAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

const AVAILABLE_VARIABLES = [
  'bib.number',
  'participant.firstName',
  'participant.lastName',
  'race.distance',
  'race.color',
  'race.label',
  'race.id'
];

export default function VariableAutocomplete({
  value,
  onChange,
  placeholder,
  style,
  className
}: VariableAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentVariable, setCurrentVariable] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the current variable being typed (text between { and cursor)
  const getCurrentVariable = useCallback(() => {
    const input = inputRef.current;
    if (!input) return '';

    const cursorPos = input.selectionStart || 0;
    const text = value;

    // Find the last { before cursor
    let braceStart = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '{') {
        braceStart = i;
        break;
      }
      // Stop if we hit a }
      if (text[i] === '}') break;
    }

    if (braceStart === -1) return '';

    // Extract text from { to cursor
    const variableText = text.substring(braceStart + 1, cursorPos);
    return variableText;
  }, [value]);

  // Filter variables based on current input
  const getFilteredVariables = useCallback(() => {
    const current = getCurrentVariable();
    if (!current) return AVAILABLE_VARIABLES;

    return AVAILABLE_VARIABLES.filter(variable =>
      variable.toLowerCase().includes(current.toLowerCase())
    );
  }, [getCurrentVariable]);

  // Complete the variable
  const completeVariable = useCallback((variable: string) => {
    const input = inputRef.current;
    if (!input) return;

    const cursorPos = input.selectionStart || 0;
    const text = value;

    // Find the { position
    let braceStart = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '{') {
        braceStart = i;
        break;
      }
    }

    if (braceStart === -1) return;

    // Replace from { to cursor with the completed variable
    const before = text.substring(0, braceStart + 1);
    const after = text.substring(cursorPos);
    const newValue = before + variable + '}' + after;

    onChange(newValue);
    setIsOpen(false);

    // Set cursor position after the completed variable
    setTimeout(() => {
      if (input) {
        const newCursorPos = braceStart + variable.length + 2; // +2 for { and }
        input.setSelectionRange(newCursorPos, newCursorPos);
        input.focus();
      }
    }, 0);
  }, [value, onChange]);

  // Update dropdown state based on current input
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const cursorPos = input.selectionStart || 0;
    const text = value;

    // Find the last { before cursor
    let braceStart = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '{') {
        braceStart = i;
        break;
      }
      // Stop if we hit a }
      if (text[i] === '}') break;
    }

    // Show dropdown if we found an unclosed { before cursor
    const shouldShow = braceStart !== -1;

    setIsOpen(shouldShow);
    if (shouldShow) {
      const current = text.substring(braceStart + 1, cursorPos);
      setCurrentVariable(current);
      setSelectedIndex(0);
    } else {
      setCurrentVariable('');
    }
  }, [value, cursorPosition]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const filtered = getFilteredVariables();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev === 0 ? filtered.length - 1 : prev - 1);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          completeVariable(filtered[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [isOpen, selectedIndex, getFilteredVariables, completeVariable]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  }, [onChange]);

  // Track cursor position changes
  const handleClick = useCallback(() => {
    const input = inputRef.current;
    if (input) {
      setCursorPosition(input.selectionStart || 0);
    }
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    // Don't update cursor position for navigation keys that we handle
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
      return;
    }
    const input = inputRef.current;
    if (input) {
      setCursorPosition(input.selectionStart || 0);
    }
  }, []);

  // Handle dropdown item click
  const handleItemClick = useCallback((variable: string) => {
    completeVariable(variable);
  }, [completeVariable]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVariables = getFilteredVariables();

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder={placeholder}
        style={style}
        className={className}
      />

      {isOpen && filteredVariables.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {filteredVariables.map((variable, index) => (
            <div
              key={variable}
              onClick={() => handleItemClick(variable)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: index === selectedIndex ? '#f3f4f6' : 'white',
                borderBottom: index < filteredVariables.length - 1 ? '1px solid #f1f5f9' : 'none',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {`{${variable}}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
