'use client';

import { TemplateElement } from '@/types';
import React from 'react';

interface ImageElementProps {
  element: TemplateElement;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isRotationMode: boolean;
  onMouseDown: (e: React.MouseEvent, element: TemplateElement) => void;
  onResizeStart: (e: React.MouseEvent, element: TemplateElement, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
  onRotationStart: (e: React.MouseEvent, element: TemplateElement) => void;
}

export default function ImageElement({
  element,
  isSelected,
  isDragging,
  isResizing,
  isRotating,
  isRotationMode,
  onMouseDown,
  onResizeStart,
  onRotationStart,
}: ImageElementProps) {
  const objectFit = element.objectFit || 'contain';
  const rotation = element.rotation || 0;
  const transform = rotation !== 0 ? `rotate(${rotation}deg)` : 'none';

  return (
    <div
      key={element.id}
      style={{
        position: 'absolute',
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        cursor: isRotating ? 'default' : isResizing ? 'default' : isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #667eea' : '1px dashed #cbd5e0',
        background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
        userSelect: 'none',
        transform: transform,
        transformOrigin: 'center center'
      }}
      onMouseDown={(e) => onMouseDown(e, element)}
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

      {isSelected && (
        <>
          {isRotationMode ? (
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '12px',
                background: '#667eea',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'alias'
              }}
              onMouseDown={(e) => onRotationStart(e, element)}
            />
          ) : (
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
                onMouseDown={(e) => onResizeStart(e, element, 'nw')}
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
                onMouseDown={(e) => onResizeStart(e, element, 'ne')}
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
                onMouseDown={(e) => onResizeStart(e, element, 'sw')}
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
                onMouseDown={(e) => onResizeStart(e, element, 'se')}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
