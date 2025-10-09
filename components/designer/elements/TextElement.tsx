'use client';

import { TemplateElement, TextElement as TextElementType } from '@/types';
import React from 'react';

interface TextElementProps {
  element: TemplateElement;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent, element: TemplateElement) => void;
  onResizeStart: (e: React.MouseEvent, element: TemplateElement, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
}

export default function TextElement({
  element,
  isSelected,
  isDragging,
  isResizing,
  onMouseDown,
  onResizeStart
}: TextElementProps) {
  const textElement = element as TextElementType;
  const textAlign = textElement.anchor || 'left';
  const verticalAnchor = textElement.verticalAnchor || 'top';

  // Map vertical anchor to flexbox alignment
  let alignItems: 'flex-start' | 'center' | 'flex-end' = 'flex-start';
  if (verticalAnchor === 'middle') {
    alignItems = 'center';
  } else if (verticalAnchor === 'bottom') {
    alignItems = 'flex-end';
  }

  return (
    <div
      key={textElement.id}
      id={textElement.id}
      style={{
        position: 'absolute',
        left: `${textElement.x}%`,
        top: `${textElement.y}%`,
        width: `${textElement.width || 30}%`,
        height: `${textElement.height || 10}%`,
        display: 'flex',
        alignItems: alignItems,
        fontSize: `${textElement.fontSize}px`,
        fontWeight: textElement.fontWeight,
        fontFamily: textElement.fontFamily,
        color: textElement.color,
        textAlign: textAlign,
        textTransform: textElement.textTransform,
        cursor: isResizing ? 'default' : isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #667eea' : '1px dashed #cbd5e0',
        background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
        padding: '4px',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
      onMouseDown={(e) => onMouseDown(e, element)}
    >
      <div style={{ width: '100%' }}>
        {textElement.content}
      </div>

      {/* Resize handles - always show when selected */}
      {isSelected && (
        <>
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
            onMouseDown={(e) => onResizeStart(e, textElement, 'nw')}
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
            onMouseDown={(e) => onResizeStart(e, textElement, 'ne')}
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
            onMouseDown={(e) => onResizeStart(e, textElement, 'sw')}
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
            onMouseDown={(e) => onResizeStart(e, textElement, 'se')}
          />
        </>
      )}
    </div>
  );
}
