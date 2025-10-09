'use client';

import { BibTemplateConfig, TemplateElement } from '@/types';
import React from 'react';
import ImageElement from './elements/ImageElement';
import ShapeElement from './elements/ShapeElement';
import TextElement from './elements/TextElement';

interface CanvasProps {
  template: BibTemplateConfig;
  selectedElement: TemplateElement | null;
  draggedElement: TemplateElement | null;
  resizingElement: TemplateElement | null;
  rotatingElement: TemplateElement | null;
  isRotationMode: boolean;
  canvasRef: React.RefObject<HTMLDivElement>;
  onMouseDown: (e: React.MouseEvent, element: TemplateElement) => void;
  onResizeStart: (e: React.MouseEvent, element: TemplateElement, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
  onRotationStart: (e: React.MouseEvent, element: TemplateElement) => void;
}

export default function Canvas({
  template,
  selectedElement,
  draggedElement,
  resizingElement,
  rotatingElement,
  isRotationMode,
  canvasRef,
  onMouseDown,
  onResizeStart,
  onRotationStart,
}: CanvasProps) {
  const renderElement = (element: TemplateElement) => {
    const isSelected = selectedElement?.id === element.id;
    const isDragging = draggedElement?.id === element.id;
    const isResizing = resizingElement?.id === element.id;
    const isRotating = rotatingElement?.id === element.id;

    if (element.type === 'shape') {
      return (
        <ShapeElement
          key={element.id}
          element={element}
          isSelected={isSelected}
          isDragging={isDragging}
          isResizing={isResizing}
          isRotating={isRotating}
          isRotationMode={isRotationMode}
          onMouseDown={onMouseDown}
          onResizeStart={onResizeStart}
          onRotationStart={onRotationStart}
        />
      );
    }

    if (element.type === 'image') {
      return (
        <ImageElement
          key={element.id}
          element={element}
          isSelected={isSelected}
          isDragging={isDragging}
          isResizing={isResizing}
          isRotating={isRotating}
          isRotationMode={isRotationMode}
          onMouseDown={onMouseDown}
          onResizeStart={onResizeStart}
          onRotationStart={onRotationStart}
        />
      );
    }

    return (
      <TextElement
        key={element.id}
        element={element}
        isSelected={isSelected}
        isDragging={isDragging}
        onMouseDown={onMouseDown}
      />
    );
  };

  return (
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
          userSelect: 'none'
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
    </div>
  );
}
