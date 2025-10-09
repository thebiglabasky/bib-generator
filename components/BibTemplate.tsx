import { extractFontFamilies, loadFonts } from '@/lib/font-loader';
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
      x: 5,
      y: 5,
      width: 40,
      height: 5,
      fontSize: 18,
      fontWeight: 700,
      fontFamily: '"Oswald", sans-serif',
      color: '#2d3748',
      textAlign: 'left',
      textTransform: 'uppercase',
      anchor: 'left',
      verticalAnchor: 'top',
      content: '{race.distance}'
    },
    {
      id: 'bib-number',
      type: 'text',
      x: 5,
      y: 30,
      width: 90,
      height: 25,
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
      x: 5,
      y: 60,
      width: 90,
      height: 15,
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
      x: 5,
      y: 78,
      width: 90,
      height: 18,
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

function getVariableValue(variable: string, bib: BibData): string {
  switch (variable) {
    case 'bib.number':
      return bib.bibNumber.toString().padStart(3, '0');
    case 'participant.firstName':
      return bib.firstName;
    case 'participant.lastName':
      return bib.lastName;
    case 'race.label':
    case 'race.distance':
      return bib.raceConfig.label;
    case 'race.color':
      return bib.raceConfig.color;
    case 'race.id':
      return bib.raceConfig.id;
    default:
      return '';
  }
}

function replaceTemplateVariables(content: string, bib: BibData): string {
  return content
    .replace('{bib.number}', bib.bibNumber.toString().padStart(3, '0'))
    .replace('{participant.firstName}', bib.firstName)
    .replace('{participant.lastName}', bib.lastName)
    .replace('{race.distance}', bib.raceConfig.label)
    .replace('{race.label}', bib.raceConfig.label)
    .replace('{race.color}', bib.raceConfig.color)
    .replace('{race.id}', bib.raceConfig.id);
}

function resolveColorValue(color: string | undefined, bib: BibData, defaultColor: string): string {
  if (!color) return defaultColor;

  // Check if color contains a variable reference
  if (color.includes('{') && color.includes('}')) {
    return replaceTemplateVariables(color, bib);
  }

  return color;
}

function shouldDisplayElement(element: TemplateElement, bib: BibData): boolean {
  if (!element.condition) {
    return true; // No condition, always display
  }

  const actualValue = getVariableValue(element.condition.variable, bib);
  return actualValue === element.condition.value;
}

export default function BibTemplate({ bib }: BibTemplateProps) {
  const [template, setTemplate] = useState<BibTemplateConfig>(DEFAULT_TEMPLATE);

  useEffect(() => {
    const savedTemplate = localStorage.getItem('bib-template-design');
    if (savedTemplate) {
      try {
        const parsed = JSON.parse(savedTemplate);
        setTemplate(parsed);
        // Load fonts used in the template
        const fonts = extractFontFamilies(parsed.elements);
        loadFonts(fonts);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    } else {
      // Load fonts from default template
      const fonts = extractFontFamilies(DEFAULT_TEMPLATE.elements);
      loadFonts(fonts);
    }
  }, []);

  const renderElement = (element: TemplateElement) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
    };

    if (element.type === 'shape') {
      const backgroundColor = resolveColorValue(element.backgroundColor, bib, '#ffffff');
      const borderWidth = element.borderWidth || 0;
      const borderColor = resolveColorValue(element.borderColor, bib, '#000000');
      const borderRadius = element.borderRadius || 0;
      const rotation = element.rotation || 0;

      // Apply rotation transform
      const transform = rotation !== 0 ? `rotate(${rotation}deg)` : undefined;

      return (
        <div
          key={element.id}
          style={{
            ...style,
            width: `${element.width}%`,
            height: `${element.height}%`,
            backgroundColor: backgroundColor,
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            borderRadius: `${borderRadius}px`,
            transform: transform,
            transformOrigin: 'center center'
          }}
        />
      );
    }

    if (element.type === 'image') {
      const objectFit = element.objectFit || 'contain';
      const rotation = element.rotation || 0;

      // Apply rotation transform
      const transform = rotation !== 0 ? `rotate(${rotation}deg)` : undefined;

      return (
        <img
          key={element.id}
          src={element.src}
          alt="Template element"
          style={{
            ...style,
            width: `${element.width}%`,
            height: `${element.height}%`,
            objectFit: objectFit,
            transform: transform,
            transformOrigin: 'center center'
          }}
        />
      );
    }

    const hasExplicitSize = element.width !== undefined && element.height !== undefined;
    const textAlign = element.anchor || 'left';
    const verticalAnchor = element.verticalAnchor || 'top';

    // Map vertical anchor to flexbox alignment
    let alignItems: 'flex-start' | 'center' | 'flex-end' = 'flex-start';
    if (verticalAnchor === 'middle') {
      alignItems = 'center';
    } else if (verticalAnchor === 'bottom') {
      alignItems = 'flex-end';
    }

    return (
      <div
        key={element.id}
        style={{
          ...style,
          width: hasExplicitSize ? `${element.width}%` : 'auto',
          height: hasExplicitSize ? `${element.height}%` : 'auto',
          display: 'flex',
          alignItems: alignItems,
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          fontFamily: element.fontFamily,
          color: resolveColorValue(element.color, bib, '#000000'),
          textAlign: textAlign,
          textTransform: element.textTransform,
          whiteSpace: hasExplicitSize ? 'pre-wrap' : 'pre-wrap',
          lineHeight: 1.2,
          overflow: hasExplicitSize ? 'hidden' : 'visible',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%' }}>
          {replaceTemplateVariables(element.content || '', bib)}
        </div>
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
        background: 'white',
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
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {template.elements.filter(el => shouldDisplayElement(el, bib)).map(renderElement)}
      </div>
    </div>
  );
}


