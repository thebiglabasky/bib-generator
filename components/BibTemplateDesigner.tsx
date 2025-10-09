'use client';

import { BibTemplateConfig, TemplateElement } from '@/types';
import { Download, Image, Square, Type, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Canvas from './designer/Canvas';
import LayersPanel from './designer/LayersPanel';
import ToolsPanel from './designer/ToolsPanel';

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

interface RotationState {
  element: TemplateElement;
  startAngle: number;
  startRotation: number;
  centerX: number;
  centerY: number;
}

const LOCALSTORAGE_KEY = 'bib-template-design';

export default function BibTemplateDesigner() {
  const [template, setTemplate] = useState<BibTemplateConfig>(DEFAULT_TEMPLATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [draggedElement, setDraggedElement] = useState<DraggedElement | null>(null);
  const [resizingElement, setResizingElement] = useState<ResizeState | null>(null);
  const [rotatingElement, setRotatingElement] = useState<RotationState | null>(null);
  const [isRotationMode, setIsRotationMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: TemplateElement) => {
    e.preventDefault();

    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    const elementWidth = (element.type === 'image' || element.type === 'shape')
      ? (element.width || 20) * canvasRect.width / 100
      : (e.currentTarget as HTMLElement).getBoundingClientRect().width;
    const elementHeight = (element.type === 'image' || element.type === 'shape')
      ? (element.height || 20) * canvasRect.height / 100
      : (e.currentTarget as HTMLElement).getBoundingClientRect().height;

    const baseX = canvasRect.left + (element.x * canvasRect.width / 100);
    const baseY = canvasRect.top + (element.y * canvasRect.height / 100);

    const isRotated = (element.type === 'image' || element.type === 'shape') && element.rotation && Math.abs(element.rotation) > 0.1;

    let anchorX: number;
    let anchorY: number;

    if (isRotated) {
      anchorX = baseX + elementWidth / 2;
      anchorY = baseY + elementHeight / 2;
    } else {
      const anchor = element.type === 'text' ? (element.anchor || 'left') : 'left';
      const verticalAnchor = element.type === 'text' ? (element.verticalAnchor || 'top') : 'top';

      anchorX = baseX;
      anchorY = baseY;

      if (anchor === 'center') {
        anchorX = baseX + elementWidth / 2;
      } else if (anchor === 'right') {
        anchorX = baseX + elementWidth;
      }

      if (verticalAnchor === 'middle') {
        anchorY = baseY + elementHeight / 2;
      } else if (verticalAnchor === 'bottom') {
        anchorY = baseY + elementHeight;
      }
    }

    const offsetX = e.clientX - anchorX;
    const offsetY = e.clientY - anchorY;

    setDraggedElement({ element, offsetX, offsetY });
    setSelectedElement(element);

    document.body.style.userSelect = 'none';
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, element: TemplateElement, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;
    if (element.type === 'text') return; // Text elements don't support manual resizing

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

  const handleRotationStart = useCallback((e: React.MouseEvent, element: TemplateElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;
    if (element.type === 'text') return; // Text elements don't support rotation

    const canvasRect = canvasRef.current.getBoundingClientRect();

    const elementWidth = (element.width || 20) * canvasRect.width / 100;
    const elementHeight = (element.height || 20) * canvasRect.height / 100;

    const centerX = canvasRect.left + (element.x * canvasRect.width / 100) + elementWidth / 2;
    const centerY = canvasRect.top + (element.y * canvasRect.height / 100) + elementHeight / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const startAngle = Math.atan2(deltaY, deltaX);

    setRotatingElement({
      element,
      startAngle,
      startRotation: element.rotation || 0,
      centerX,
      centerY
    });

    setSelectedElement(element);
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();

    if (draggedElement) {
      const rect = canvasRef.current.getBoundingClientRect();
      const element = draggedElement.element;

      const isRotated = (element.type === 'image' || element.type === 'shape') && element.rotation && Math.abs(element.rotation) > 0.1;

      if (isRotated) {
        const centerX = ((e.clientX - rect.left - draggedElement.offsetX) / rect.width) * 100;
        const centerY = ((e.clientY - rect.top - draggedElement.offsetY) / rect.height) * 100;

        const halfWidth = (element.type === 'image' || element.type === 'shape') ? (element.width || 20) / 2 : 10;
        const halfHeight = (element.type === 'image' || element.type === 'shape') ? (element.height || 20) / 2 : 10;

        const x = centerX - halfWidth;
        const y = centerY - halfHeight;

        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            el.id === element.id
              ? { ...el, x: clampedX, y: clampedY }
              : el
          )
        }));

        // Update selectedElement to keep it in sync
        if (selectedElement?.id === element.id) {
          setSelectedElement(prev => prev ? { ...prev, x: clampedX, y: clampedY } : null);
        }
      } else {
        const anchorX = ((e.clientX - rect.left - draggedElement.offsetX) / rect.width) * 100;
        const anchorY = ((e.clientY - rect.top - draggedElement.offsetY) / rect.height) * 100;

        let x = anchorX;
        let y = anchorY;

        if (element.type === 'text') {
          const elementRect = document.getElementById(element.id)?.getBoundingClientRect();
          if (elementRect) {
            const elementWidthPercent = (elementRect.width / rect.width) * 100;
            const elementHeightPercent = (elementRect.height / rect.height) * 100;

            const anchor = element.anchor || 'left';
            const verticalAnchor = element.verticalAnchor || 'top';

            if (anchor === 'center') {
              x = anchorX - elementWidthPercent / 2;
            } else if (anchor === 'right') {
              x = anchorX - elementWidthPercent;
            }

            if (verticalAnchor === 'middle') {
              y = anchorY - elementHeightPercent / 2;
            } else if (verticalAnchor === 'bottom') {
              y = anchorY - elementHeightPercent;
            }
          }
        }

        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            el.id === element.id
              ? { ...el, x: clampedX, y: clampedY }
              : el
          )
        }));

        // Update selectedElement to keep it in sync
        if (selectedElement?.id === element.id) {
          setSelectedElement(prev => prev ? { ...prev, x: clampedX, y: clampedY } : null);
        }
      }
    } else if (resizingElement) {
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - resizingElement.startX;
      const deltaY = e.clientY - resizingElement.startY;

      const element = resizingElement.element;
      // For shapes, default to NOT preserving proportions. For images, default to preserving.
      const preserveAspectRatio = element.type === 'shape'
        ? element.preserveAspectRatio === true
        : element.type === 'image'
          ? element.preserveAspectRatio !== false
          : false;

      let newWidth = resizingElement.startWidth;
      let newHeight = resizingElement.startHeight;
      let newX = resizingElement.startLeft;
      let newY = resizingElement.startTop;

      switch (resizingElement.corner) {
        case 'nw':
          newWidth = Math.max(5, resizingElement.startWidth - (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100);
          newX = resizingElement.startLeft + (resizingElement.startWidth - newWidth);
          newY = preserveAspectRatio
            ? resizingElement.startTop + (resizingElement.startHeight - newHeight)
            : resizingElement.startTop + (resizingElement.startHeight - Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100));
          break;
        case 'ne':
          newWidth = Math.max(5, resizingElement.startWidth + (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100);
          newY = preserveAspectRatio
            ? resizingElement.startTop + (resizingElement.startHeight - newHeight)
            : resizingElement.startTop + (resizingElement.startHeight - Math.max(5, resizingElement.startHeight - (deltaY / rect.height) * 100));
          break;
        case 'sw':
          newWidth = Math.max(5, resizingElement.startWidth - (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight + (deltaY / rect.height) * 100);
          newX = resizingElement.startLeft + (resizingElement.startWidth - newWidth);
          break;
        case 'se':
          newWidth = Math.max(5, resizingElement.startWidth + (deltaX / rect.width) * 100);
          newHeight = preserveAspectRatio
            ? newWidth * (resizingElement.startHeight / resizingElement.startWidth)
            : Math.max(5, resizingElement.startHeight + (deltaY / rect.height) * 100);
          break;
      }

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

      // Update selectedElement to keep it in sync
      if (selectedElement?.id === resizingElement.element.id) {
        setSelectedElement(prev => prev ? { ...prev, x: newX, y: newY, width: newWidth, height: newHeight } : null);
      }
    } else if (rotatingElement) {
      const deltaX = e.clientX - rotatingElement.centerX;
      const deltaY = e.clientY - rotatingElement.centerY;
      const currentAngle = Math.atan2(deltaY, deltaX);

      let angleDiff = currentAngle - rotatingElement.startAngle;

      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      angleDiff = angleDiff * (180 / Math.PI);

      const newRotation = rotatingElement.startRotation + angleDiff;

      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === rotatingElement.element.id
            ? { ...el, rotation: newRotation }
            : el
        )
      }));

      setSelectedElement(prev => prev ? { ...prev, rotation: newRotation } : null);
    }
  }, [draggedElement, resizingElement, rotatingElement, selectedElement]);

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null);
    setResizingElement(null);
    setRotatingElement(null);
    document.body.style.userSelect = '';
  }, []);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    handleMouseMove(e as any);
  }, [handleMouseMove]);

  const handleGlobalMouseUp = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        setIsRotationMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        setIsRotationMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  React.useEffect(() => {
    if (draggedElement || resizingElement || rotatingElement) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggedElement, resizingElement, rotatingElement, handleGlobalMouseMove, handleGlobalMouseUp]);

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

  const addShapeElement = useCallback(() => {
    const newElement: TemplateElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 40,
      y: 40,
      width: 20,
      height: 20,
      shapeType: 'square',
      backgroundColor: '#ffffff',
      borderWidth: 0,
      borderColor: '#000000',
      borderRadius: 0
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

  const bringToFront = useCallback(() => {
    if (!selectedElement) return;

    setTemplate(prev => {
      const element = prev.elements.find(el => el.id === selectedElement.id);
      if (!element) return prev;

      return {
        ...prev,
        elements: [
          ...prev.elements.filter(el => el.id !== selectedElement.id),
          element
        ]
      };
    });
  }, [selectedElement]);

  const bringToBack = useCallback(() => {
    if (!selectedElement) return;

    setTemplate(prev => {
      const element = prev.elements.find(el => el.id === selectedElement.id);
      if (!element) return prev;

      return {
        ...prev,
        elements: [
          element,
          ...prev.elements.filter(el => el.id !== selectedElement.id)
        ]
      };
    });
  }, [selectedElement]);

  const moveElementUp = useCallback((elementId: string) => {
    setTemplate(prev => {
      const currentIndex = prev.elements.findIndex(el => el.id === elementId);
      if (currentIndex === -1 || currentIndex === prev.elements.length - 1) return prev;

      const newElements = [...prev.elements];
      [newElements[currentIndex], newElements[currentIndex + 1]] = [newElements[currentIndex + 1], newElements[currentIndex]];

      return {
        ...prev,
        elements: newElements
      };
    });
  }, []);

  const moveElementDown = useCallback((elementId: string) => {
    setTemplate(prev => {
      const currentIndex = prev.elements.findIndex(el => el.id === elementId);
      if (currentIndex === -1 || currentIndex === 0) return prev;

      const newElements = [...prev.elements];
      [newElements[currentIndex], newElements[currentIndex - 1]] = [newElements[currentIndex - 1], newElements[currentIndex]];

      return {
        ...prev,
        elements: newElements
      };
    });
  }, []);

  const getElementIcon = (element: TemplateElement) => {
    switch (element.type) {
      case 'text':
        return <Type size={16} />;
      case 'image':
        return <Image size={16} />;
      case 'shape':
        return <Square size={16} />;
      default:
        return <Square size={16} />;
    }
  };

  const getElementDisplayName = (element: TemplateElement) => {
    if (element.name) {
      return element.name;
    }

    switch (element.type) {
      case 'text':
        return element.content || 'Texte';
      case 'image':
        return 'Image';
      case 'shape':
        return 'Forme';
      default:
        return 'Élément';
    }
  };

  const updateElement = useCallback((updates: Partial<TemplateElement>) => {
    if (!selectedElement) return;

    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, ...updates }
          : el
      )
    }));
    setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
  }, [selectedElement]);

  const updateElementName = useCallback((elementId: string, name: string) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === elementId
          ? { ...el, name: name || undefined }
          : el
      )
    }));

    setSelectedElement(prev => prev && prev.id === elementId ? { ...prev, name: name || undefined } : prev);
  }, []);

  const handleReorderElements = useCallback((elements: TemplateElement[]) => {
    setTemplate(prev => ({
      ...prev,
      elements
    }));
  }, []);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const savedTemplate = localStorage.getItem(LOCALSTORAGE_KEY);
      if (savedTemplate) {
        setTemplate(JSON.parse(savedTemplate));
      }
      // If no saved template, keep DEFAULT_TEMPLATE that was already set
    } catch (e) {
      console.error('Failed to load template from localStorage:', e);
      // Keep DEFAULT_TEMPLATE on error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever template changes (but not during active drag/resize/rotate)
  useEffect(() => {
    // Don't save until we've loaded from localStorage
    if (!isLoaded) return;

    // Don't save during active interactions to avoid performance issues
    if (!draggedElement && !resizingElement && !rotatingElement) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(template));
    }
  }, [template, draggedElement, resizingElement, rotatingElement, isLoaded]);

  // Export template as JSON file
  const exportTemplate = useCallback(() => {
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bib-template-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [template]);

  // Import template from JSON file
  const importTemplate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json) as BibTemplateConfig;
        setTemplate(parsed);
        // Save immediately to localStorage
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(parsed));
        setSelectedElement(null);
      } catch (error) {
        console.error('Failed to import template:', error);
        alert('Erreur lors de l\'importation du template. Vérifiez le format du fichier.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Don't render until we've loaded from localStorage
  if (!isLoaded) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Import/Export Controls */}
        <div style={{ display: 'flex', gap: '10px', padding: '15px', background: '#f7fafc', borderRadius: '12px' }}>
          <button
            onClick={exportTemplate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Download size={18} />
            Exporter le template
          </button>
          <button
            onClick={triggerFileInput}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Upload size={18} />
            Importer un template
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={importTemplate}
            style={{ display: 'none' }}
          />
        </div>

        {/* Designer Panels */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <LayersPanel
        template={template}
        selectedElement={selectedElement}
        onSelectElement={setSelectedElement}
        onDeleteElement={deleteElement}
        onUpdateElementName={updateElementName}
        onReorderElements={handleReorderElements}
                      getElementIcon={getElementIcon}
                      getElementDisplayName={getElementDisplayName}
                    />

      <Canvas
        template={template}
        selectedElement={selectedElement}
        draggedElement={draggedElement?.element || null}
        resizingElement={resizingElement?.element || null}
        rotatingElement={rotatingElement?.element || null}
        isRotationMode={isRotationMode}
        canvasRef={canvasRef}
        onMouseDown={handleMouseDown}
        onResizeStart={handleResizeStart}
        onRotationStart={handleRotationStart}
      />

      <ToolsPanel
        selectedElement={selectedElement}
        onAddTextElement={addTextElement}
        onAddShapeElement={addShapeElement}
        onImageUpload={handleImageUpload}
        onUpdateElement={updateElement}
        onBringToFront={bringToFront}
        onBringToBack={bringToBack}
        onMoveElementUp={moveElementUp}
        onMoveElementDown={moveElementDown}
      />
        </div>
      </div>
    );
}
