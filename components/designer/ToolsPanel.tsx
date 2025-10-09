'use client';

import { AVAILABLE_FONTS, loadFont } from '@/lib/font-loader';
import { TemplateElement } from '@/types';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowDown,
    ArrowDownToLine,
    ArrowUp,
    ArrowUpToLine,
    Bold,
    CaseLower,
    CaseUpper,
    ChevronsDownUp,
    Image,
    Italic,
    Maximize,
    Minimize,
    Move,
    Plus,
    Settings,
    Square,
    Type,
    Underline
} from 'lucide-react';
import React from 'react';
import ColorInput from '../ColorInput';
import VariableAutocomplete from '../VariableAutocomplete';

interface ToolsPanelProps {
  selectedElement: TemplateElement | null;
  canvasRef: React.RefObject<HTMLDivElement>;
  onAddTextElement: () => void;
  onAddShapeElement: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateElement: (updates: Partial<TemplateElement>) => void;
  onBringToFront: () => void;
  onBringToBack: () => void;
  onMoveElementUp: (elementId: string) => void;
  onMoveElementDown: (elementId: string) => void;
}

export default function ToolsPanel({
  selectedElement,
  canvasRef,
  onAddTextElement,
  onAddShapeElement,
  onImageUpload,
  onUpdateElement,
  onBringToFront,
  onBringToBack,
  onMoveElementUp,
  onMoveElementDown,
}: ToolsPanelProps) {
  return (
    <div style={{ width: '300px' }}>
      <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '5px 20px 20px 20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} />
          Outils
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Ajouter un élément</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onAddTextElement}
              title="Ajouter du texte"
              style={{
                padding: '8px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Type size={16} />
            </button>
            <button
              onClick={onAddShapeElement}
              title="Ajouter une forme"
              style={{
                padding: '8px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Square size={16} />
            </button>
            <label
              title="Ajouter une image"
              style={{
                padding: '8px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {selectedElement && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
              Ordre des calques
            </h4>
            <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                onClick={onBringToFront}
                title="Mettre au premier plan"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRight: '1px solid #e2e8f0',
                  background: '#f7fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowUpToLine size={14} />
              </button>
              <button
                onClick={() => onMoveElementUp(selectedElement.id)}
                title="Monter d'un niveau"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRight: '1px solid #e2e8f0',
                  background: '#f7fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => onMoveElementDown(selectedElement.id)}
                title="Descendre d'un niveau"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRight: '1px solid #e2e8f0',
                  background: '#f7fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowDown size={14} />
              </button>
              <button
                onClick={onBringToBack}
                title="Mettre à l'arrière-plan"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  background: '#f7fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowDownToLine size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  const width = selectedElement.type === 'text'
                    ? (selectedElement.width || 30)
                    : (selectedElement.width || 20);
                  const newX = Math.max(0, Math.min(100 - width, 50 - width / 2));
                  onUpdateElement({ x: newX });
                }}
                title="Centrer horizontalement"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#f7fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#4a5568'
                }}
              >
                <AlignCenter size={14} />
                H
              </button>
              <button
                onClick={() => {
                  const height = selectedElement.type === 'text'
                    ? (selectedElement.height || 10)
                    : (selectedElement.height || 20);
                  const newY = Math.max(0, Math.min(100 - height, 50 - height / 2));
                  onUpdateElement({ y: newY });
                }}
                title="Centrer verticalement"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#f7fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#4a5568'
                }}
              >
                <ChevronsDownUp size={14} />
                V
              </button>
            </div>
          </div>
        )}

        {selectedElement && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
              Modifier l'élément
            </h4>

            {selectedElement.type === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Texte</label>
                  <VariableAutocomplete
                    value={selectedElement.content || ''}
                    onChange={(value) => onUpdateElement({ content: value })}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                      {/* Formatting toolbar */}
                      <div style={{ display: 'flex', gap: '2px', marginTop: '8px' }}>
                        <button
                          title="Gras"
                          onClick={() => {
                            const isBold = (selectedElement.fontWeight || 400) >= 700;
                            onUpdateElement({ fontWeight: isBold ? 400 : 700 });
                          }}
                          style={{
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: (selectedElement.fontWeight || 400) >= 700 ? '#667eea' : '#f7fafc',
                            color: (selectedElement.fontWeight || 400) >= 700 ? 'white' : '#4a5568',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          title="Italique"
                          onClick={() => {
                            const next = (selectedElement.fontStyle || 'normal') === 'italic' ? 'normal' : 'italic';
                            onUpdateElement({ fontStyle: next as any });
                          }}
                          style={{
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: (selectedElement.fontStyle || 'normal') === 'italic' ? '#667eea' : '#f7fafc',
                            color: (selectedElement.fontStyle || 'normal') === 'italic' ? 'white' : '#4a5568',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          title="Souligné"
                          onClick={() => {
                            const next = (selectedElement.textDecoration || 'none') === 'underline' ? 'none' : 'underline';
                            onUpdateElement({ textDecoration: next as any });
                          }}
                          style={{
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: (selectedElement.textDecoration || 'none') === 'underline' ? '#667eea' : '#f7fafc',
                            color: (selectedElement.textDecoration || 'none') === 'underline' ? 'white' : '#4a5568',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Underline size={14} />
                        </button>
                        <button
                          title="MAJUSCULES"
                          onClick={() => {
                            const next = (selectedElement.textTransform || 'none') === 'uppercase' ? 'none' : 'uppercase';
                            onUpdateElement({ textTransform: next as any });
                          }}
                          style={{
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: (selectedElement.textTransform || 'none') === 'uppercase' ? '#667eea' : '#f7fafc',
                            color: (selectedElement.textTransform || 'none') === 'uppercase' ? 'white' : '#4a5568',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CaseUpper size={14} />
                        </button>
                        <button
                          title="minuscules"
                          onClick={() => {
                            const next = (selectedElement.textTransform || 'none') === 'lowercase' ? 'none' : 'lowercase';
                            onUpdateElement({ textTransform: next as any });
                          }}
                          style={{
                            padding: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: (selectedElement.textTransform || 'none') === 'lowercase' ? '#667eea' : '#f7fafc',
                            color: (selectedElement.textTransform || 'none') === 'lowercase' ? 'white' : '#4a5568',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CaseLower size={14} />
                        </button>
                      </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Police</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedElement.fontFamily || 'Arial, sans-serif'}
                        onChange={async (e) => {
                          const newFont = e.target.value;
                          await loadFont(newFont);
                          onUpdateElement({ fontFamily: newFont });
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: 'white'
                        }}
                      >
                        {AVAILABLE_FONTS.map((font) => (
                          <option
                            key={font.family}
                            value={font.family}
                            style={{ fontFamily: font.family }}
                          >
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px', height: '16px', lineHeight: '16px' }}>Taille</label>
                        <input
                          type="number"
                          value={selectedElement.fontSize || 24}
                          onChange={(e) => onUpdateElement({ fontSize: parseInt(e.target.value) })}
                          style={{
                            width: '60px',
                            padding: '4px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '3px',
                            fontSize: '11px',
                            height: '24px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <ColorInput
                          label="Couleur"
                          value={selectedElement.color}
                          onChange={(value) => onUpdateElement({ color: value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Ancrage</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      {[
                        { value: 'left', icon: AlignLeft },
                        { value: 'center', icon: AlignCenter },
                        { value: 'right', icon: AlignRight }
                      ].map(({ value, icon: IconComponent }) => (
                        <button
                          key={value}
                          onClick={() => onUpdateElement({ anchor: value as 'left' | 'center' | 'right' })}
                          style={{
                            flex: 1,
                            padding: '6px',
                            border: 'none',
                            background: (selectedElement.anchor || 'left') === value ? '#667eea' : '#f7fafc',
                            color: (selectedElement.anchor || 'left') === value ? 'white' : '#4a5568',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconComponent size={14} />
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '2px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      {[
                        { value: 'top', icon: ArrowUpToLine },
                        { value: 'middle', icon: ChevronsDownUp },
                        { value: 'bottom', icon: ArrowDownToLine }
                      ].map(({ value, icon: IconComponent }) => (
                        <button
                          key={value}
                          onClick={() => onUpdateElement({ verticalAnchor: value as 'top' | 'middle' | 'bottom' })}
                          style={{
                            flex: 1,
                            padding: '6px',
                            border: 'none',
                            background: (selectedElement.verticalAnchor || 'top') === value ? '#667eea' : '#f7fafc',
                            color: (selectedElement.verticalAnchor || 'top') === value ? 'white' : '#4a5568',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconComponent size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>X</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.x || 0).toString()).toFixed(2)}
                        onChange={(e) => onUpdateElement({ x: parseFloat(e.target.value) })}
                        step="0.5"
                        style={{
                          width: '60px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Y</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.y || 0).toString()).toFixed(2)}
                        onChange={(e) => onUpdateElement({ y: parseFloat(e.target.value) })}
                        step="0.5"
                        style={{
                          width: '60px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Largeur</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.width || 30).toString()).toFixed(2)}
                        onChange={(e) => onUpdateElement({ width: parseFloat(e.target.value) })}
                        step="1"
                        style={{
                          width: '60px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Hauteur</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.height || 10).toString()).toFixed(2)}
                        onChange={(e) => onUpdateElement({ height: parseFloat(e.target.value) })}
                        step="1"
                        style={{
                          width: '60px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedElement.type === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>X</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.x || 0).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ x: parseFloat(e.target.value) })}
                      step="0.5"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Y</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.y || 0).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ y: parseFloat(e.target.value) })}
                      step="0.5"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Rotation</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.rotation || 0).toString()).toFixed(1)}
                      onChange={(e) => onUpdateElement({ rotation: parseFloat(e.target.value) })}
                      step="1"
                      min="-360"
                      max="360"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Largeur</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.width || 20).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ width: parseFloat(e.target.value) })}
                      step="1"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Hauteur</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.height || 20).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ height: parseFloat(e.target.value) })}
                      step="1"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Ajustement</label>
                  <div style={{ display: 'flex', gap: '1px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    {[
                      { value: 'contain', icon: Minimize, tooltip: 'Contenir' },
                      { value: 'cover', icon: Maximize, tooltip: 'Couvrir' },
                      { value: 'fill', icon: Move, tooltip: 'Remplir' },
                      { value: 'none', icon: Plus, tooltip: 'Original' }
                    ].map(({ value, icon: IconComponent, tooltip }) => (
                      <button
                        key={value}
                        onClick={() => onUpdateElement({ objectFit: value as 'contain' | 'cover' | 'fill' | 'none' })}
                        title={tooltip}
                        style={{
                          flex: 1,
                          padding: '5px',
                          border: 'none',
                          background: (selectedElement.objectFit || 'contain') === value ? '#667eea' : '#f7fafc',
                          color: (selectedElement.objectFit || 'contain') === value ? 'white' : '#4a5568',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconComponent size={12} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                    <input
                      type="checkbox"
                      checked={selectedElement.preserveAspectRatio !== false}
                      onChange={(e) => onUpdateElement({ preserveAspectRatio: e.target.checked })}
                      style={{ marginRight: '6px' }}
                    />
                    Préserver les proportions
                  </label>
                </div>
              </div>
            )}

            {selectedElement.type === 'shape' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>X</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.x || 0).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ x: parseFloat(e.target.value) })}
                      step="0.5"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Y</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.y || 0).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ y: parseFloat(e.target.value) })}
                      step="0.5"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Rotation</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.rotation || 0).toString()).toFixed(1)}
                      onChange={(e) => onUpdateElement({ rotation: parseFloat(e.target.value) })}
                      step="1"
                      min="-360"
                      max="360"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Largeur</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.width || 20).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ width: parseFloat(e.target.value) })}
                      step="1"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Hauteur</label>
                    <input
                      type="number"
                      value={parseFloat((selectedElement.height || 20).toString()).toFixed(2)}
                      onChange={(e) => onUpdateElement({ height: parseFloat(e.target.value) })}
                      step="1"
                      style={{
                        width: '50px',
                        padding: '4px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '11px'
                      }}
                    />
                  </div>
                </div>

                <ColorInput
                  label="Fond"
                  value={selectedElement.backgroundColor}
                  onChange={(value) => onUpdateElement({ backgroundColor: value })}
                />

                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <ColorInput
                      label="Bordure"
                      value={selectedElement.borderColor}
                      onChange={(value) => onUpdateElement({ borderColor: value })}
                      compact
                    />
                  </div>
                  <div style={{ width: '55px', flexShrink: 0 }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px', height: '16px', lineHeight: '16px' }}>Épais.</label>
                    <input
                      type="number"
                      value={selectedElement.borderWidth || 0}
                      onChange={(e) => onUpdateElement({ borderWidth: parseInt(e.target.value) })}
                      min="0"
                      max="20"
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
                  </div>
                  <div style={{ width: '55px', flexShrink: 0 }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px', height: '16px', lineHeight: '16px' }}>Coins</label>
                    <input
                      type="number"
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => onUpdateElement({ borderRadius: parseInt(e.target.value) })}
                      min="0"
                      max="50"
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
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                    <input
                      type="checkbox"
                      checked={selectedElement.preserveAspectRatio === true}
                      onChange={(e) => onUpdateElement({ preserveAspectRatio: e.target.checked })}
                      style={{ marginRight: '6px' }}
                    />
                    Préserver les proportions
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedElement && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
              Affichage conditionnel
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedElement.condition}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateElement({
                          condition: {
                            variable: 'race.label',
                            value: ''
                          }
                        });
                      } else {
                        onUpdateElement({ condition: undefined });
                      }
                    }}
                    style={{ marginRight: '6px' }}
                  />
                  Activer la condition
                </label>
              </div>

              {selectedElement.condition && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Variable</label>
                    <select
                      value={selectedElement.condition.variable}
                      onChange={(e) => onUpdateElement({
                        condition: {
                          ...selectedElement.condition!,
                          variable: e.target.value
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: 'white'
                      }}
                    >
                      <option value="race.label">race.label</option>
                      <option value="race.distance">race.distance</option>
                      <option value="race.color">race.color</option>
                      <option value="race.id">race.id</option>
                      <option value="participant.firstName">participant.firstName</option>
                      <option value="participant.lastName">participant.lastName</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Valeur attendue</label>
                    <input
                      type="text"
                      value={selectedElement.condition.value}
                      onChange={(e) => onUpdateElement({
                        condition: {
                          ...selectedElement.condition!,
                          value: e.target.value
                        }
                      })}
                      placeholder="ex: 2020"
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                  </div>

                  <div style={{
                    fontSize: '11px',
                    color: '#718096',
                    background: '#f7fafc',
                    padding: '8px',
                    borderRadius: '4px'
                  }}>
                    L'élément ne s'affichera que si la variable correspond exactement à la valeur attendue.
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div>
          <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Variables disponibles</h4>
          <div style={{ fontSize: '12px', color: '#718096', lineHeight: '1.6' }}>
            <div><code>{'{bib.number}'}</code> - Numéro du dossard</div>
            <div><code>{'{participant.firstName}'}</code> - Prénom</div>
            <div><code>{'{participant.lastName}'}</code> - Nom</div>
            <div><code>{'{race.distance}'}</code> - Distance</div>
            <div><code>{'{race.color}'}</code> - Couleur de la course</div>
            <div style={{ marginTop: '8px', fontSize: '11px', fontStyle: 'italic' }}>
              Les variables peuvent être utilisées dans les textes et les couleurs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
