'use client';

import { ShapeElement as ShapeElementType } from '@/types';
import React from 'react';

interface ShapeElementProps {
  element: ShapeElementType;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isRotationMode: boolean;
  onMouseDown: (e: React.MouseEvent, element: ShapeElementType) => void;
  onResizeStart: (e: React.MouseEvent, element: ShapeElementType, corner: 'nw' | 'ne' | 'sw' | 'se') => void;
  onRotationStart: (e: React.MouseEvent, element: ShapeElementType) => void;
}

export default function ShapeElement({
  element,
  isSelected,
  isDragging,
  isResizing,
  isRotating,
  isRotationMode,
  onMouseDown,
  onResizeStart,
  onRotationStart,
}: ShapeElementProps) {
  const backgroundColor = element.backgroundColor || '#ffffff';
  const borderWidth = element.borderWidth || 0;
  const borderColor = element.borderColor || '#000000';
  const borderRadius = element.borderRadius || 0;
  const rotation = element.rotation || 0;
  const transform = rotation !== 0 ? `rotate(${rotation}deg)` : 'none';

  // Add pattern for shapes with variable-based colors
  const hasVariableColor = element.backgroundColor && element.backgroundColor.includes('{') && element.backgroundColor.includes('}');
  const backgroundStyle = hasVariableColor
    ? {
        backgroundColor: '#f0f0f0', // Light gray background
        backgroundImage: `repeating-linear-gradient(
          45deg,
          rgba(0, 0, 0, 0.2) 0px,
          rgba(0, 0, 0, 0.2) 4px,
          rgba(0, 0, 0, 0.1) 4px,
          rgba(0, 0, 0, 0.1) 8px
        )`
      }
    : { backgroundColor: backgroundColor };

  return (
    <div
      key={element.id}
      style={{
        position: 'absolute',
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        ...backgroundStyle,
        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
        outline: isSelected ? '2px solid #667eea' : 'none',
        outlineOffset: isSelected ? '2px' : '0',
        borderRadius: `${borderRadius}px`,
        cursor: isRotating ? 'default' : isResizing ? 'default' : isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transform: transform,
        transformOrigin: 'center center'
      }}
      onMouseDown={(e) => onMouseDown(e, element)}
    >
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
