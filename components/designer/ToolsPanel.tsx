'use client';

import { TemplateElement } from '@/types';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  ChevronsDownUp,
  Image,
  Maximize,
  Minimize,
  Move,
  Plus,
  Settings,
  Square,
  Type
} from 'lucide-react';
import React from 'react';

const AVAILABLE_FONTS = [
  { name: 'Arial', family: 'Arial, sans-serif', googleFont: null },
  { name: 'Helvetica', family: 'Helvetica, sans-serif', googleFont: null },
  { name: 'Roboto', family: '"Roboto", sans-serif', googleFont: 'Roboto:400,700' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif', googleFont: 'Open+Sans:400,700' },
  { name: 'Lato', family: '"Lato", sans-serif', googleFont: 'Lato:400,700' },
  { name: 'Montserrat', family: '"Montserrat", sans-serif', googleFont: 'Montserrat:400,700' },
  { name: 'Nunito', family: '"Nunito", sans-serif', googleFont: 'Nunito:400,700' },
  { name: 'Poppins', family: '"Poppins", sans-serif', googleFont: 'Poppins:400,700' },
  { name: 'Inter', family: '"Inter", sans-serif', googleFont: 'Inter:400,700' },
  { name: 'Times New Roman', family: '"Times New Roman", serif', googleFont: null },
  { name: 'Georgia', family: 'Georgia, serif', googleFont: null },
  { name: 'Merriweather', family: '"Merriweather", serif', googleFont: 'Merriweather:400,700' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', googleFont: 'Playfair+Display:400,700' },
  { name: 'Oswald', family: '"Oswald", sans-serif', googleFont: 'Oswald:400,700' },
  { name: 'Bebas Neue', family: '"Bebas Neue", sans-serif', googleFont: 'Bebas+Neue' },
];

interface ToolsPanelProps {
  selectedElement: TemplateElement | null;
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
                  <input
                    type="text"
                    value={selectedElement.content || ''}
                    onChange={(e) => onUpdateElement({ content: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Police</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedElement.fontFamily || 'Arial, sans-serif'}
                        onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
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

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Taille</label>
                        <input
                          type="number"
                          value={selectedElement.fontSize || 24}
                          onChange={(e) => onUpdateElement({ fontSize: parseInt(e.target.value) })}
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
                        <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Couleur</label>
                        <input
                          type="color"
                          value={selectedElement.color || '#000000'}
                          onChange={(e) => onUpdateElement({ color: e.target.value })}
                          style={{
                            width: '60px',
                            height: '28px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
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
              </div>
            )}

            {selectedElement.type === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                <div>
                  <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Fond</label>
                  <input
                    type="color"
                    value={selectedElement.backgroundColor || '#ffffff'}
                    onChange={(e) => onUpdateElement({ backgroundColor: e.target.value })}
                    style={{
                      width: '100%',
                      height: '32px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Bordure</label>
                    <input
                      type="color"
                      value={selectedElement.borderColor || '#000000'}
                      onChange={(e) => onUpdateElement({ borderColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: '28px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Épaisseur</label>
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
                        fontSize: '11px'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Coins</label>
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
                        fontSize: '11px'
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

        <div>
          <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Variables disponibles</h4>
          <div style={{ fontSize: '12px', color: '#718096', lineHeight: '1.4' }}>
            <div><code>{'{bib.number}'}</code> - Numéro du dossard</div>
            <div><code>{'{participant.firstName}'}</code> - Prénom</div>
            <div><code>{'{participant.lastName}'}</code> - Nom</div>
            <div><code>{'{race.distance}'}</code> - Distance</div>
            <div><code>{'{race.color}'}</code> - Couleur de la course</div>
          </div>
        </div>
      </div>
    </div>
  );
}
