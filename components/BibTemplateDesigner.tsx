'use client';

import { extractFontFamilies, loadFont, loadFonts } from '@/lib/font-loader';
import { useHistory } from '@/lib/use-history';
import { BibData, BibTemplateConfig, RaceConfig, TemplateElement } from '@/types';
import { Download, Eye, EyeOff, Image, Printer, Redo, Square, Type, Undo, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Canvas from './designer/Canvas';
import LayersPanel from './designer/LayersPanel';
import PreviewPanel from './designer/PreviewPanel';
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

interface DraggedElement {
  element: TemplateElement;
  offsetX: number;
  offsetY: number;
  initialState: TemplateElement; // State before dragging started
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
  initialState: TemplateElement; // State before resizing started
}

interface RotationState {
  element: TemplateElement;
  startAngle: number;
  startRotation: number;
  centerX: number;
  centerY: number;
  initialState: TemplateElement; // State before rotating started
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
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { recordAction, undo, redo, canUndo, canRedo } = useHistory();

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
      // For rotated elements, drag from center
      anchorX = baseX + elementWidth / 2;
      anchorY = baseY + elementHeight / 2;
    } else {
      // For all non-rotated elements (including text), drag from top-left
      anchorX = baseX;
      anchorY = baseY;
    }

    const offsetX = e.clientX - anchorX;
    const offsetY = e.clientY - anchorY;

    setDraggedElement({ element, offsetX, offsetY, initialState: { ...element } });
    setSelectedElement(element);

    document.body.style.userSelect = 'none';
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, element: TemplateElement, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;

    // Only allow resizing elements that have width/height defined
    if (element.width === undefined || element.height === undefined) return;

    setResizingElement({
      element,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width || 20,
      startHeight: element.height || 20,
      startLeft: element.x,
      startTop: element.y,
      initialState: { ...element }
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
      centerY,
      initialState: { ...element }
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
        const x = ((e.clientX - rect.left - draggedElement.offsetX) / rect.width) * 100;
        const y = ((e.clientY - rect.top - draggedElement.offsetY) / rect.height) * 100;

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
    // Record history for drag/resize/rotate operations when they complete
    if (draggedElement) {
      const element = template.elements.find(el => el.id === draggedElement.element.id);
      if (element) {
        recordAction('move', element.id, draggedElement.initialState, element);
      }
    }
    if (resizingElement) {
      const element = template.elements.find(el => el.id === resizingElement.element.id);
      if (element) {
        recordAction('resize', element.id, resizingElement.initialState, element);
      }
    }
    if (rotatingElement) {
      const element = template.elements.find(el => el.id === rotatingElement.element.id);
      if (element) {
        recordAction('rotate', element.id, rotatingElement.initialState, element);
      }
    }

    setDraggedElement(null);
    setResizingElement(null);
    setRotatingElement(null);
    document.body.style.userSelect = '';
  }, [draggedElement, resizingElement, rotatingElement, template.elements, recordAction]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    handleMouseMove(e as any);
  }, [handleMouseMove]);

  const handleGlobalMouseUp = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const handleUndo = useCallback(() => {
    const entry = undo();
    if (!entry) return;

    // Restore the state based on the action type
    if (entry.type === 'delete') {
      // Restore deleted element (beforeState has the element)
      if (entry.beforeState) {
        setTemplate(prev => ({
          ...prev,
          elements: [...prev.elements, entry.beforeState!]
        }));
      }
    } else if (entry.type === 'add') {
      // Remove added element
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== entry.elementId)
      }));
      setSelectedElement(null);
    } else {
      // For move, resize, rotate, property changes - restore beforeState
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === entry.elementId && entry.beforeState
            ? entry.beforeState
            : el
        )
      }));
      if (selectedElement?.id === entry.elementId && entry.beforeState) {
        setSelectedElement(entry.beforeState);
      }
    }
  }, [undo, selectedElement]);

  const handleRedo = useCallback(() => {
    const entry = redo();
    if (!entry) return;

    // Apply the state based on the action type
    if (entry.type === 'add') {
      // Re-add element (afterState has the element)
      if (entry.afterState) {
        setTemplate(prev => ({
          ...prev,
          elements: [...prev.elements, entry.afterState!]
        }));
      }
    } else if (entry.type === 'delete') {
      // Re-delete element
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== entry.elementId)
      }));
      setSelectedElement(null);
    } else {
      // For move, resize, rotate, property changes - apply afterState
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === entry.elementId && entry.afterState
            ? entry.afterState
            : el
        )
      }));
      if (selectedElement?.id === entry.elementId && entry.afterState) {
        setSelectedElement(entry.afterState);
      }
    }
  }, [redo, selectedElement]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        // Check for undo/redo shortcuts
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          return;
        }
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
  }, [handleUndo, handleRedo]);

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
      recordAction('add', newElement.id, null, newElement);
    };
    reader.readAsDataURL(file);
  }, [recordAction]);

  const addTextElement = useCallback(() => {
    const newElement: TemplateElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 30,
      height: 10,
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
    recordAction('add', newElement.id, null, newElement);
  }, [recordAction]);

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
    recordAction('add', newElement.id, null, newElement);
  }, [recordAction]);

  const deleteElement = useCallback((elementId: string) => {
    const element = template.elements.find(el => el.id === elementId);
    if (element) {
      recordAction('delete', element.id, element, null);
    }

    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId)
    }));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement, template.elements, recordAction]);

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

  const updateElement = useCallback(async (updates: Partial<TemplateElement>) => {
    if (!selectedElement) return;

    // If font is being updated, load it first
    if ('fontFamily' in updates && updates.fontFamily) {
      await loadFont(updates.fontFamily);
    }

    const beforeState = { ...selectedElement };
    const updatedElement = { ...selectedElement, ...updates };

    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === selectedElement.id
          ? updatedElement
          : el
      )
    }));
    setSelectedElement(updatedElement);

    recordAction('property', updatedElement.id, beforeState, updatedElement);
  }, [selectedElement, recordAction]);

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
    const oldElements = template.elements;
    setTemplate(prev => ({
      ...prev,
      elements
    }));
    // Record reorder action with the first element as reference
    if (elements.length > 0 && oldElements.length > 0) {
      recordAction('reorder', elements[0].id, oldElements[0], elements[0]);
    }
  }, [recordAction, template.elements]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const savedTemplate = localStorage.getItem(LOCALSTORAGE_KEY);
      if (savedTemplate) {
        const parsed = JSON.parse(savedTemplate);
        setTemplate(parsed);
        // Load fonts used in the template
        const fonts = extractFontFamilies(parsed.elements);
        loadFonts(fonts);
      } else {
        // Load fonts from default template
        const fonts = extractFontFamilies(DEFAULT_TEMPLATE.elements);
        loadFonts(fonts);
      }
      // If no saved template, keep DEFAULT_TEMPLATE that was already set
    } catch (e) {
      console.error('Failed to load template from localStorage:', e);
      // Keep DEFAULT_TEMPLATE on error
      // Still load fonts from default template
      const fonts = extractFontFamilies(DEFAULT_TEMPLATE.elements);
      loadFonts(fonts);
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
        // Load fonts used in the imported template
        const fonts = extractFontFamilies(parsed.elements);
        loadFonts(fonts);
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

  const handlePrintEmptyTemplates = useCallback(() => {
    // Get race configs from localStorage or use defaults
    const DEFAULT_RACE_CONFIGS: RaceConfig[] = [
      { id: '2016', label: '900m', yearMatch: '2016 et avant', color: '#3baff7', isParent: false },
      { id: '2017', label: '600m', yearMatch: '2017', color: '#e77f08', isParent: false },
      { id: '2018', label: '600m', yearMatch: '2018', color: '#e77f0b', isParent: false },
      { id: '2019', label: '300m', yearMatch: '2019', color: '#26b55b', isParent: false },
      { id: '2020', label: '300m', yearMatch: '2020', color: '#25b65b', isParent: false },
      { id: 'parent', label: '2.5km / 5km', yearMatch: 'parent', color: '#7b37cd', isParent: true },
    ];

    let raceConfigs = DEFAULT_RACE_CONFIGS;
    const savedConfigs = localStorage.getItem('race-configs');
    if (savedConfigs) {
      try {
        raceConfigs = JSON.parse(savedConfigs);
      } catch (error) {
        console.error('Error loading race configs:', error);
      }
    }

    // Deduplicate by label - only create one empty bib per unique race label
    const seenLabels = new Set<string>();
    const uniqueConfigs = raceConfigs.filter(config => {
      if (seenLabels.has(config.label)) {
        return false;
      }
      seenLabels.add(config.label);
      return true;
    });

    const emptyBibs: BibData[] = uniqueConfigs.map(config => ({
      bibNumber: 0,
      firstName: '',
      lastName: '',
      raceConfig: config,
      category: config.isParent ? 'adult' : 'child1',
    }));
    sessionStorage.setItem('selected-bibs', JSON.stringify(emptyBibs));
    window.open('/print', '_blank');
  }, []);

  // Don't render until we've loaded from localStorage
  if (!isLoaded) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Import/Export Controls */}
        <div style={{ display: 'flex', gap: '10px', padding: '15px', background: '#f7fafc', borderRadius: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
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
              Exporter
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
              Importer
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: showPreview ? '#f59e0b' : 'white',
                color: showPreview ? 'white' : '#4a5568',
                border: showPreview ? 'none' : '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              {showPreview ? 'Masquer la prévisualisation' : 'Prévisualiser'}
            </button>
            <button
              onClick={handlePrintEmptyTemplates}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Printer size={18} />
              Imprimer Dossards Vides
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={importTemplate}
              style={{ display: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              title="Annuler (Cmd/Ctrl+Z)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                background: canUndo ? 'white' : '#e2e8f0',
                color: canUndo ? '#4a5568' : '#a0aec0',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                opacity: canUndo ? 1 : 0.6
              }}
            >
              <Undo size={18} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              title="Rétablir (Cmd/Ctrl+Shift+Z)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                background: canRedo ? 'white' : '#e2e8f0',
                color: canRedo ? '#4a5568' : '#a0aec0',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: canRedo ? 'pointer' : 'not-allowed',
                opacity: canRedo ? 1 : 0.6
              }}
            >
              <Redo size={18} />
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <PreviewPanel template={template} isVisible={showPreview} />

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
        canvasRef={canvasRef}
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
