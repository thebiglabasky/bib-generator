'use client';

import { TemplateElement } from '@/types';
import React from 'react';

interface TextElementProps {
  element: TemplateElement;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent, element: TemplateElement) => void;
}

export default function TextElement({ element, isSelected, isDragging, onMouseDown }: TextElementProps) {
  const anchor = element.anchor || 'left';
  const verticalAnchor = element.verticalAnchor || 'top';
  const textAlign = anchor;

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
      id={element.id}
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
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #667eea' : '1px dashed #cbd5e0',
        background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
        padding: '4px',
        minWidth: '50px',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transform: transform
      }}
      onMouseDown={(e) => onMouseDown(e, element)}
    >
      {element.content}
    </div>
  );
}
