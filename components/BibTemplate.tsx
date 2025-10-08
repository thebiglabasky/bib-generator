import { BibData, BibTemplateConfig, TemplateElement } from '@/types';
import { useEffect, useState } from 'react';

interface BibTemplateProps {
  bib: BibData;
}

const DEFAULT_TEMPLATE: BibTemplateConfig = {
  width: 210,
  height: 148.5,
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
      color: '#ffffff',
      textAlign: 'center',
      textTransform: 'uppercase',
      content: '{race.distance}'
    },
    {
      id: 'bib-number',
      type: 'text',
      x: 50,
      y: 40,
      fontSize: 120,
      fontWeight: 900,
      color: '#2d3748',
      textAlign: 'center',
      content: '{bib.number}'
    },
    {
      id: 'first-name',
      type: 'text',
      x: 50,
      y: 70,
      fontSize: 48,
      fontWeight: 600,
      color: '#4a5568',
      textAlign: 'center',
      content: '{participant.firstName}'
    },
    {
      id: 'last-name',
      type: 'text',
      x: 50,
      y: 85,
      fontSize: 56,
      fontWeight: 900,
      color: '#1a202c',
      textAlign: 'center',
      textTransform: 'uppercase',
      content: '{participant.lastName}'
    }
  ]
};

function replaceTemplateVariables(content: string, bib: BibData): string {
  return content
    .replace('{bib.number}', bib.bibNumber.toString().padStart(3, '0'))
    .replace('{participant.firstName}', bib.firstName)
    .replace('{participant.lastName}', bib.lastName)
    .replace('{race.distance}', bib.raceConfig.label)
    .replace('{race.color}', bib.raceConfig.color);
}

export default function BibTemplate({ bib }: BibTemplateProps) {
  const [template, setTemplate] = useState<BibTemplateConfig>(DEFAULT_TEMPLATE);

  useEffect(() => {
    const savedTemplate = localStorage.getItem('bibTemplate');
    if (savedTemplate) {
      try {
        setTemplate(JSON.parse(savedTemplate));
      } catch (error) {
        console.error('Error loading template:', error);
      }
    }
  }, []);

  const renderElement = (element: TemplateElement) => {
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

    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
      transform,
    };

    if (element.type === 'image') {
      const objectFit = element.objectFit || 'contain';

      return (
        <img
          key={element.id}
          src={element.src}
          alt="Template element"
          style={{
            ...style,
            width: `${element.width}%`,
            height: `${element.height}%`,
            objectFit: objectFit
          }}
        />
      );
    }

    return (
      <div
        key={element.id}
        style={{
          ...style,
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          fontFamily: element.fontFamily,
          color: element.color,
          textAlign: textAlign,
          textTransform: element.textTransform,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.2
        }}
      >
        {replaceTemplateVariables(element.content || '', bib)}
      </div>
    );
  };

  return (
    <div
      style={{
        width: `${template.width}mm`,
        height: `${template.height}mm`,
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid',
        padding: '20mm',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          background: template.backgroundColor,
          width: '100%',
          height: '100%',
          borderRadius: `${template.borderRadius}px`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {template.elements.map(renderElement)}
      </div>
    </div>
  );
}


