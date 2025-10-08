'use client';

import { BibTemplateConfig, TemplateElement } from '@/types';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Camera,
  ChevronsDownUp,
  Plus,
  Settings,
  Trash2
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

// Available fonts for selection
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

const DEFAULT_TEMPLATE: BibTemplateConfig = {
  width: 210, // half A4 width in mm
  height: 148.5, // half A4 height in mm
  backgroundColor: '#ffffff',
  borderRadius: 20,
  elements: [
    {
      id: 'color-tag',
      type: 'text',
      x: 80,
      y: 10,
      fontSize: 18,
      fontWeight: 700,
      fontFamily: '"Oswald", sans-serif',
      color: '#ffffff',
      textAlign: 'center',
      textTransform: 'uppercase',
      anchor: 'center',
      verticalAnchor: 'top',
      content: '{race.distance}'
    },
    {
      id: 'bib-number',
      type: 'text',
      x: 50,
      y: 40,
      fontSize: 120,
      fontWeight: 900,
      fontFamily: '"Bebas Neue", sans-serif',
      color: '#2d3748',
      textAlign: 'center',
      anchor: 'center',
      verticalAnchor: 'top',
      content: '{bib.number}'
    },
    {
      id: 'first-name',
      type: 'text',
      x: 50,
      y: 70,
      fontSize: 48,
      fontWeight: 600,
      fontFamily: '"Montserrat", sans-serif',
      color: '#4a5568',
      textAlign: 'center',
      anchor: 'center',
      verticalAnchor: 'top',
      content: '{participant.firstName}'
    },
    {
      id: 'last-name',
      type: 'text',
      x: 50,
      y: 85,
      fontSize: 56,
      fontWeight: 900,
      fontFamily: '"Montserrat", sans-serif',
      color: '#1a202c',
      textAlign: 'center',
      textTransform: 'uppercase',
      anchor: 'center',
      verticalAnchor: 'top',
      content: '{participant.lastName}'
    }
  ]
};

interface DraggedElement {
  element: TemplateElement;
  offsetX: number;
  offsetY: number;
}

interface ResizeState {
  element: TemplateElement;
  corner: 'nw' | 'ne' | 'sw' | 'se';
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}

export default function BibTemplateDesigner() {
  const [template, setTemplate] = useState<BibTemplateConfig>(DEFAULT_TEMPLATE);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [draggedElement, setDraggedElement] = useState<DraggedElement | null>(null);
  const [resizingElement, setResizingElement] = useState<ResizeState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: TemplateElement) => {
    e.preventDefault(); // Prevent text selection and default drag behavior

    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Calculate anchor point within the element's bounding rect
    const anchor = element.anchor || 'left';
    const verticalAnchor = element.verticalAnchor || 'top';

    let anchorX = elementRect.left;
    let anchorY = elementRect.top;

    if (anchor === 'center') {
      anchorX = elementRect.left + elementRect.width / 2;
    } else if (anchor === 'right') {
      anchorX = elementRect.right;
    }

    if (verticalAnchor === 'middle') {
      anchorY = elementRect.top + elementRect.height / 2;
    } else if (verticalAnchor === 'bottom') {
      anchorY = elementRect.bottom;
    }

    // Calculate offset between mouse position and element's anchor point
    const offsetX = e.clientX - anchorX;
    const offsetY = e.clientY - anchorY;

    setDraggedElement({ element, offsetX, offsetY });
    setSelectedElement(element);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, element: TemplateElement, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    setResizingElement({
      element,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width || 20,
      startHeight: element.height || 20,
      startLeft: element.x,
      startTop: element.y
    });

    setSelectedElement(element);
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();

    if (draggedElement) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - draggedElement.offsetX) / rect.width) * 100;
      const y = ((e.clientY - rect.top - draggedElement.offsetY) / rect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === draggedElement.element.id
            ? { ...el, x: clampedX, y: clampedY }
            : el
        )
      }));
    } else if (resizingElement) {
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - resizingElement.startX;
      const deltaY = e.clientY - resizingElement.startY;

      const element = resizingElement.element;
      const preserveAspectRatio = element.preserveAspectRatio !== false; // Default to true

      let newWidth = resizingElement.startWidth;
      let newHeight = resizingElement.startHeight;
      let newX = resizingElement.startLeft;
      let newY = resizingElement.startTop;

      // Calculate resize based on corner
      switch (resizingElement.corner) {
        case 'nw': // Top-left
          newWidth = Math.max(5, resizingElement.startWidth - (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100);
          newX = resizingElement.startLeft + (resizingElement.startWidth - newWidth);
          newY = preserveAspectRatio
            ? resizingElement.startTop + (resizingElement.startHeight - newHeight)
            : resizingElement.startTop + (resizingElement.startHeight - Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100));
          break;
        case 'ne': // Top-right
          newWidth = Math.max(5, resizingElement.startWidth + (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100);
          newY = preserveAspectRatio
            ? resizingElement.startTop + (resizingElement.startHeight - newHeight)
            : resizingElement.startTop + (resizingElement.startHeight - Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100));
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(5, resizingElement.startWidth - (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight + (deltaY / rect.height) * 100);
          newX = resizingElement.startLeft + (resizingElement.startWidth - newWidth);
          break;
        case 'se': // Bottom-right
          newWidth = Math.max(5, resizingElement.startWidth + (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight + (deltaY / rect.height) * 100);
          break;
      }

      // Clamp values
      newWidth = Math.min(newWidth, 100 - newX);
      newHeight = Math.min(newHeight, 100 - newY);
      newX = Math.max(0, Math.min(newX, 100 - newWidth));
      newY = Math.max(0, Math.min(newY, 100 - newHeight));

      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === resizingElement.element.id
            ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
            : el
        )
      }));
    }
  }, [draggedElement, resizingElement]);

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null);
    setResizingElement(null);
    // Re-enable text selection
    document.body.style.userSelect = '';
  }, []);

  // Global mouse event handlers for better drag handling
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    handleMouseMove(e as any);
  }, [handleMouseMove]);

  const handleGlobalMouseUp = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Add global listeners when dragging or resizing starts
  React.useEffect(() => {
    if (draggedElement || resizingElement) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggedElement, resizingElement, handleGlobalMouseMove, handleGlobalMouseUp]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const newElement: TemplateElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        src,
        objectFit: 'contain',
        preserveAspectRatio: true
      };

      setTemplate(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
      setSelectedElement(newElement);
    };
    reader.readAsDataURL(file);
  }, []);

  const addTextElement = useCallback(() => {
    const newElement: TemplateElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      fontSize: 24,
      fontWeight: 400,
      fontFamily: '"Roboto", sans-serif',
      color: '#000000',
      textAlign: 'center',
      anchor: 'center',
      verticalAnchor: 'top',
      content: 'Nouveau texte'
    };

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
    setSelectedElement(newElement);
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId)
    }));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const updateElement = useCallback((updates: Partial<TemplateElement>) => {
    if (!selectedElement) return;

    setTemplate(prev => {
      const newTemplate = {
        ...prev,
        elements: prev.elements.map(el =>
          el.id === selectedElement.id
            ? { ...el, ...updates }
            : el
        )
      };
      // Auto-save to localStorage
      localStorage.setItem('bibTemplate', JSON.stringify(newTemplate));
      return newTemplate;
    });
    setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
  }, [selectedElement]);

  const renderElement = (element: TemplateElement) => {
    const isSelected = selectedElement?.id === element.id;

    if (element.type === 'image') {
      const objectFit = element.objectFit || 'contain';

      return (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.width}%`,
            height: `${element.height}%`,
            cursor: resizingElement ? 'default' : draggedElement ? 'grabbing' : 'grab',
            border: isSelected ? '2px solid #667eea' : '1px dashed #cbd5e0',
            background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          <img
            src={element.src}
            alt="Template element"
            style={{
              width: '100%',
              height: '100%',
              objectFit: objectFit,
              pointerEvents: 'none'
            }}
          />

          {/* Resize handles - only show for selected images */}
          {isSelected && (
            <>
              {/* Corner handles */}
              <div
                style={{
                  position: 'absolute',
                  left: '-4px',
                  top: '-4px',
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  border: '1px solid white',
                  cursor: 'nw-resize'
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'nw')}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '-4px',
                  top: '-4px',
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  border: '1px solid white',
                  cursor: 'ne-resize'
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'ne')}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '-4px',
                  bottom: '-4px',
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  border: '1px solid white',
                  cursor: 'sw-resize'
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'sw')}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '-4px',
                  bottom: '-4px',
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  border: '1px solid white',
                  cursor: 'se-resize'
                }}
                onMouseDown={(e) => handleResizeStart(e, element, 'se')}
              />
            </>
          )}
        </div>
      );
    }

    const anchor = element.anchor || 'left';
    const verticalAnchor = element.verticalAnchor || 'top';
    const textAlign = anchor; // Use anchor for text alignment

    // Calculate transform based on anchors
    let transformX = '';
    let transformY = '';

    if (anchor === 'center') {
      transformX = 'translateX(-50%)';
    } else if (anchor === 'right') {
      transformX = 'translateX(-100%)';
    }

    if (verticalAnchor === 'middle') {
      transformY = 'translateY(-50%)';
    } else if (verticalAnchor === 'bottom') {
      transformY = 'translateY(-100%)';
    }

    const transform = [transformX, transformY].filter(Boolean).join(' ') || 'none';

    return (
      <div
        key={element.id}
        style={{
          position: 'absolute',
          left: `${element.x}%`,
          top: `${element.y}%`,
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          fontFamily: element.fontFamily,
          color: element.color,
          textAlign: textAlign,
          textTransform: element.textTransform,
          cursor: draggedElement ? 'grabbing' : 'grab',
          border: isSelected ? '2px solid #667eea' : '1px dashed #cbd5e0',
          background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
          padding: '4px',
          minWidth: '50px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          transform: transform
        }}
        onMouseDown={(e) => handleMouseDown(e, element)}
      >
        {element.content}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
      {/* Canvas */}
      <div style={{ flex: 1 }}>
        <div
          ref={canvasRef}
          style={{
            width: '100%',
            aspectRatio: `${template.width} / ${template.height}`,
            background: template.backgroundColor,
            borderRadius: `${template.borderRadius}px`,
            border: '2px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden',
            cursor: draggedElement ? 'grabbing' : 'default',
            userSelect: 'none' // Prevent text selection on canvas
          }}
        >
          {template.elements.map(renderElement)}

          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {template.width}mm × {template.height}mm
          </div>
        </div>

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#718096' }}>
          💡 Conseil: Cliquez et glissez les éléments pour les repositionner
        </div>
      </div>

      {/* Tools Panel */}
      <div style={{ width: '300px' }}>
        <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} />
            Outils
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Ajouter un élément</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={addTextElement}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                Texte
              </button>
              <label style={{
                padding: '8px 16px',
                fontSize: '12px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Camera size={14} />
                Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

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
                      onChange={(e) => updateElement({ content: e.target.value })}
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
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Taille</label>
                    <input
                      type="number"
                      value={selectedElement.fontSize || 24}
                      onChange={(e) => updateElement({ fontSize: parseInt(e.target.value) })}
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
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedElement.fontFamily || 'Arial, sans-serif'}
                        onChange={(e) => updateElement({ fontFamily: e.target.value })}
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
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Couleur</label>
                    <input
                      type="color"
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => updateElement({ color: e.target.value })}
                      style={{
                        width: '100%',
                        height: '32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>Ancrage</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Horizontal anchoring */}
                      <div style={{ display: 'flex', gap: '2px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        {[
                          { value: 'left', icon: AlignLeft },
                          { value: 'center', icon: AlignCenter },
                          { value: 'right', icon: AlignRight }
                        ].map(({ value, icon: IconComponent }) => (
                          <button
                            key={value}
                            onClick={() => updateElement({ anchor: value as 'left' | 'center' | 'right' })}
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

                      {/* Vertical anchoring */}
                      <div style={{ display: 'flex', gap: '2px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        {[
                          { value: 'top', icon: ArrowUpToLine },
                          { value: 'middle', icon: ChevronsDownUp },
                          { value: 'bottom', icon: ArrowDownToLine }
                        ].map(({ value, icon: IconComponent }) => (
                          <button
                            key={value}
                            onClick={() => updateElement({ verticalAnchor: value as 'top' | 'middle' | 'bottom' })}
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
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Largeur (%)</label>
                    <input
                      type="number"
                      value={selectedElement.width || 20}
                      onChange={(e) => updateElement({ width: parseInt(e.target.value) })}
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
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Hauteur (%)</label>
                    <input
                      type="number"
                      value={selectedElement.height || 20}
                      onChange={(e) => updateElement({ height: parseInt(e.target.value) })}
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
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Mode d'ajustement</label>
                    <select
                      value={selectedElement.objectFit || 'contain'}
                      onChange={(e) => updateElement({ objectFit: e.target.value as 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' })}
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: 'white'
                      }}
                    >
                      <option value="contain">Contenir (fit)</option>
                      <option value="cover">Couvrir (fill)</option>
                      <option value="fill">Remplir</option>
                      <option value="none">Aucun</option>
                      <option value="scale-down">Réduire</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={selectedElement.preserveAspectRatio !== false}
                        onChange={(e) => updateElement({ preserveAspectRatio: e.target.checked })}
                        style={{ marginRight: '6px' }}
                      />
                      Préserver les proportions
                    </label>
                  </div>
                </div>
              )}

              <button
                onClick={() => deleteElement(selectedElement.id)}
                style={{
                  marginTop: '10px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />
                Supprimer
              </button>
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
    </div>
  );
}
