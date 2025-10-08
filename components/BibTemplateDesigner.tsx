'use client';

import { BibTemplateConfig, TemplateElement } from '@/types';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  ChevronsDownUp,
  GripVertical,
  Image,
  Layers,
  Maximize,
  Minimize,
  Move,
  Plus,
  Settings,
  Square,
  Trash2,
  Type
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

interface RotationState {
  element: TemplateElement;
  startAngle: number;
  startRotation: number;
  centerX: number;
  centerY: number;
}

interface SortableItemProps {
  element: TemplateElement;
  isSelected: boolean;
  onSelect: (element: TemplateElement) => void;
  onDelete: (elementId: string) => void;
  onUpdateName: (elementId: string, name: string) => void;
  getElementIcon: (element: TemplateElement) => React.ReactNode;
  getElementDisplayName: (element: TemplateElement) => string;
}

function SortableItem({ element, isSelected, onSelect, onDelete, onUpdateName, getElementIcon, getElementDisplayName }: SortableItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(getElementDisplayName(element));
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const saveEdit = () => {
    if (editValue.trim()) {
      onUpdateName(element.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-item"
      onClick={() => onSelect(element)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        startEditing();
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
          background: isSelected ? '#e6f7ff' : 'white',
          border: isSelected ? '1px solid #667eea' : '1px solid #e2e8f0',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        <div
          {...attributes}
          {...listeners}
          style={{
            color: '#a0aec0',
            display: 'flex',
            alignItems: 'center',
            cursor: 'grab',
            touchAction: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <div style={{ color: '#a0aec0', display: 'flex', alignItems: 'center' }}>
          {getElementIcon(element)}
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveEdit}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              padding: '1px 3px',
              margin: '0 -4px',
              border: '1px solid #667eea',
              borderRadius: '3px',
              fontSize: '12px',
              fontWeight: '500',
              outline: 'none',
              background: 'white',
              minWidth: '50px'
            }}
          />
        ) : (
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getElementDisplayName(element)}
          </span>
        )}
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            title="Supprimer l'élément"
            style={{
              padding: '4px',
              border: 'none',
              background: 'transparent',
              color: '#a0aec0',
              cursor: 'pointer',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#a0aec0';
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function BibTemplateDesigner() {
  const [template, setTemplate] = useState<BibTemplateConfig>(DEFAULT_TEMPLATE);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [draggedElement, setDraggedElement] = useState<DraggedElement | null>(null);
  const [resizingElement, setResizingElement] = useState<ResizeState | null>(null);
  const [rotatingElement, setRotatingElement] = useState<RotationState | null>(null);
  const [isRotationMode, setIsRotationMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleMouseDown = useCallback((e: React.MouseEvent, element: TemplateElement) => {
    e.preventDefault(); // Prevent text selection and default drag behavior

    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    // Calculate element dimensions based on template data (not DOM bounding rect)
    const elementWidth = (element.type === 'image' || element.type === 'shape')
      ? (element.width || 20) * canvasRect.width / 100
      : (e.currentTarget as HTMLElement).getBoundingClientRect().width;
    const elementHeight = (element.type === 'image' || element.type === 'shape')
      ? (element.height || 20) * canvasRect.height / 100
      : (e.currentTarget as HTMLElement).getBoundingClientRect().height;

    // Calculate base position (top-left corner) from template coordinates
    const baseX = canvasRect.left + (element.x * canvasRect.width / 100);
    const baseY = canvasRect.top + (element.y * canvasRect.height / 100);

    // For rotated elements, always use center point
    const isRotated = element.rotation && Math.abs(element.rotation) > 0.1;

    let anchorX: number;
    let anchorY: number;

    if (isRotated) {
      // Use center point for rotated elements
      anchorX = baseX + elementWidth / 2;
      anchorY = baseY + elementHeight / 2;
    } else {
      // Calculate anchor point based on anchor settings
      const anchor = element.anchor || 'left';
      const verticalAnchor = element.verticalAnchor || 'top';

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

    // Calculate offset between mouse position and element's anchor/center point
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

  const handleRotationStart = useCallback((e: React.MouseEvent, element: TemplateElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    // Calculate center based on element's position in template (not DOM bounding rect)
    // This ensures the center stays fixed even as the element rotates
    const elementWidth = (element.width || 20) * canvasRect.width / 100;
    const elementHeight = (element.height || 20) * canvasRect.height / 100;

    // Calculate the actual center position based on template coordinates
    const centerX = canvasRect.left + (element.x * canvasRect.width / 100) + elementWidth / 2;
    const centerY = canvasRect.top + (element.y * canvasRect.height / 100) + elementHeight / 2;

    // Calculate initial angle from center to mouse
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

      // Check if element is rotated
      const isRotated = element.rotation && Math.abs(element.rotation) > 0.1;

      if (isRotated) {
        // For rotated elements, we dragged from center, so calculate center position
        const centerX = ((e.clientX - rect.left - draggedElement.offsetX) / rect.width) * 100;
        const centerY = ((e.clientY - rect.top - draggedElement.offsetY) / rect.height) * 100;

        // Convert center position to top-left corner (x, y in template)
        const halfWidth = (element.width || 20) / 2;
        const halfHeight = (element.height || 20) / 2;

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
      } else {
        // For non-rotated elements, calculate anchor position first
        const anchorX = ((e.clientX - rect.left - draggedElement.offsetX) / rect.width) * 100;
        const anchorY = ((e.clientY - rect.top - draggedElement.offsetY) / rect.height) * 100;

        // For text elements, convert anchor position to base position (x, y)
        let x = anchorX;
        let y = anchorY;

        if (element.type === 'text') {
          // Get element dimensions to calculate offset from anchor to base
          const elementRect = document.getElementById(element.id)?.getBoundingClientRect();
          if (elementRect) {
            const elementWidthPercent = (elementRect.width / rect.width) * 100;
            const elementHeightPercent = (elementRect.height / rect.height) * 100;

            const anchor = element.anchor || 'left';
            const verticalAnchor = element.verticalAnchor || 'top';

            // Adjust x based on horizontal anchor
            if (anchor === 'center') {
              x = anchorX - elementWidthPercent / 2;
            } else if (anchor === 'right') {
              x = anchorX - elementWidthPercent;
            }

            // Adjust y based on vertical anchor
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
      }
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
    } else if (rotatingElement) {
      // Calculate new angle
      const deltaX = e.clientX - rotatingElement.centerX;
      const deltaY = e.clientY - rotatingElement.centerY;
      const currentAngle = Math.atan2(deltaY, deltaX);

      // Calculate rotation difference with angle normalization
      let angleDiff = currentAngle - rotatingElement.startAngle;

      // Normalize angle difference to handle crossing the negative x-axis
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      angleDiff = angleDiff * (180 / Math.PI); // Convert to degrees

      // Apply rotation
      const newRotation = rotatingElement.startRotation + angleDiff;

      // Update the element and trigger a re-render to show live rotation value
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === rotatingElement.element.id
            ? { ...el, rotation: newRotation }
            : el
        )
      }));

      // Force update the selected element to show live rotation value in input
      setSelectedElement(prev => prev ? { ...prev, rotation: newRotation } : null);
    }
  }, [draggedElement, resizingElement, rotatingElement]);

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null);
    setResizingElement(null);
    setRotatingElement(null);
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

  // Handle rotation mode with Cmd/Ctrl key
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

  // Add global listeners when dragging, resizing, or rotating starts
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

    setTemplate(prev => ({
      ...prev,
      elements: [
        ...prev.elements.filter(el => el.id !== selectedElement.id),
        selectedElement
      ]
    }));
  }, [selectedElement]);

  const bringToBack = useCallback(() => {
    if (!selectedElement) return;

    setTemplate(prev => ({
      ...prev,
      elements: [
        selectedElement,
        ...prev.elements.filter(el => el.id !== selectedElement.id)
      ]
    }));
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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTemplate((prev) => {
        const oldIndex = prev.elements.findIndex((el) => el.id === active.id);
        const newIndex = prev.elements.findIndex((el) => el.id === over.id);

        const newElements = arrayMove(prev.elements, oldIndex, newIndex);

        return {
          ...prev,
          elements: newElements,
        };
      });
    }
  }, []);

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

  const updateElementName = useCallback((elementId: string, name: string) => {
    setTemplate(prev => {
      const newTemplate = {
        ...prev,
        elements: prev.elements.map(el =>
          el.id === elementId
            ? { ...el, name: name || undefined }
            : el
        )
      };
      // Auto-save to localStorage
      localStorage.setItem('bibTemplate', JSON.stringify(newTemplate));
      return newTemplate;
    });

    // Update selected element if it's the one being renamed
    setSelectedElement(prev => prev && prev.id === elementId ? { ...prev, name: name || undefined } : prev);
  }, []);

  const renderElement = (element: TemplateElement) => {
    const isSelected = selectedElement?.id === element.id;

    if (element.type === 'shape') {
      const backgroundColor = element.backgroundColor || '#ffffff';
      const borderWidth = element.borderWidth || 0;
      const borderColor = element.borderColor || '#000000';
      const borderRadius = element.borderRadius || 0;
      const rotation = element.rotation || 0;

      // Build transform string with rotation
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
            backgroundColor: backgroundColor,
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
            outline: isSelected ? '2px solid #667eea' : 'none',
            outlineOffset: isSelected ? '2px' : '0',
            borderRadius: `${borderRadius}px`,
            cursor: rotatingElement ? 'default' : resizingElement ? 'default' : draggedElement ? 'grabbing' : 'grab',
            userSelect: 'none',
            transform: transform,
            transformOrigin: 'center center'
          }}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          {/* Handles - only show for selected shapes */}
          {isSelected && (
            <>
              {isRotationMode ? (
                // Rotation handles - circular
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
                  onMouseDown={(e) => handleRotationStart(e, element)}
                />
              ) : (
                // Resize handles - square
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
            </>
          )}
        </div>
      );
    }

    if (element.type === 'image') {
      const objectFit = element.objectFit || 'contain';
      const rotation = element.rotation || 0;

      // Build transform string with rotation
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
            cursor: rotatingElement ? 'default' : resizingElement ? 'default' : draggedElement ? 'grabbing' : 'grab',
            border: isSelected ? '2px solid #667eea' : '1px dashed #cbd5e0',
            background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
            userSelect: 'none',
            transform: transform,
            transformOrigin: 'center center'
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

          {/* Handles - only show for selected images */}
          {isSelected && (
            <>
              {isRotationMode ? (
                // Rotation handles - circular
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
                  onMouseDown={(e) => handleRotationStart(e, element)}
                />
              ) : (
                // Resize handles - square
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
    <>
      <style jsx global>{`
        .sortable-item {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Layers Panel */}
      <div style={{ width: '250px' }}>
        <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '5px 20px 20px 20px' }}>
          <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} />
            Calques
          </h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {template.elements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0', fontSize: '14px' }}>
                  Aucun élément
                </div>
              ) : (
                <SortableContext
                  items={[...template.elements].reverse().map(el => el.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {[...template.elements].reverse().map((element) => (
                    <SortableItem
                      key={element.id}
                      element={element}
                      isSelected={selectedElement?.id === element.id}
                      onSelect={setSelectedElement}
                      onDelete={deleteElement}
                      onUpdateName={updateElementName}
                      getElementIcon={getElementIcon}
                      getElementDisplayName={getElementDisplayName}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          </DndContext>
        </div>
      </div>

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
      </div>

      {/* Tools Panel */}
      <div style={{ width: '300px' }}>
        <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '5px 20px 20px 20px' }}>
          <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} />
            Outils
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Ajouter un élément</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={addTextElement}
                title="Ajouter du texte"
                style={{
                  padding: '8px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Type size={16} />
              </button>
              <button
                onClick={addShapeElement}
                title="Ajouter une forme"
                style={{
                  padding: '8px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Square size={16} />
              </button>
              <label
                title="Ajouter une image"
                style={{
                  padding: '8px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image size={16} />
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
                Ordre des calques
              </h4>
              <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                  onClick={bringToFront}
                  title="Mettre au premier plan"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRight: '1px solid #e2e8f0',
                    background: '#f7fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowUpToLine size={14} />
                </button>
                <button
                  onClick={() => moveElementUp(selectedElement.id)}
                  title="Monter d'un niveau"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRight: '1px solid #e2e8f0',
                    background: '#f7fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveElementDown(selectedElement.id)}
                  title="Descendre d'un niveau"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRight: '1px solid #e2e8f0',
                    background: '#f7fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={bringToBack}
                  title="Mettre à l'arrière-plan"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    background: '#f7fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowDownToLine size={14} />
                </button>
              </div>
            </div>
          )}

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
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Police</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

                      {/* Size and Color on same row */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Taille</label>
                          <input
                            type="number"
                            value={selectedElement.fontSize || 24}
                            onChange={(e) => updateElement({ fontSize: parseInt(e.target.value) })}
                            style={{
                              width: '60px',
                              padding: '4px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '3px',
                              fontSize: '11px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Couleur</label>
                          <input
                            type="color"
                            value={selectedElement.color || '#000000'}
                            onChange={(e) => updateElement({ color: e.target.value })}
                            style={{
                              width: '60px',
                              height: '28px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                      </div>
                    </div>
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
                  {/* Width, Height, and Rotation on same line */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Largeur</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.width || 20).toString()).toFixed(2)}
                        onChange={(e) => updateElement({ width: parseFloat(e.target.value) })}
                        step="1"
                        style={{
                          width: '50px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Hauteur</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.height || 20).toString()).toFixed(2)}
                        onChange={(e) => updateElement({ height: parseFloat(e.target.value) })}
                        step="1"
                        style={{
                          width: '50px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Rotation</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.rotation || 0).toString()).toFixed(1)}
                        onChange={(e) => updateElement({ rotation: parseFloat(e.target.value) })}
                        step="1"
                        min="-360"
                        max="360"
                        style={{
                          width: '50px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Object-fit button bar */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Ajustement</label>
                    <div style={{ display: 'flex', gap: '1px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      {[
                        { value: 'contain', icon: Minimize, tooltip: 'Contenir' },
                        { value: 'cover', icon: Maximize, tooltip: 'Couvrir' },
                        { value: 'fill', icon: Move, tooltip: 'Remplir' },
                        { value: 'none', icon: Plus, tooltip: 'Original' }
                      ].map(({ value, icon: IconComponent, tooltip }) => (
                        <button
                          key={value}
                          onClick={() => updateElement({ objectFit: value as 'contain' | 'cover' | 'fill' | 'none' })}
                          title={tooltip}
                          style={{
                            flex: 1,
                            padding: '5px',
                            border: 'none',
                            background: (selectedElement.objectFit || 'contain') === value ? '#667eea' : '#f7fafc',
                            color: (selectedElement.objectFit || 'contain') === value ? 'white' : '#4a5568',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconComponent size={12} />
                        </button>
                      ))}
                    </div>
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

              {selectedElement.type === 'shape' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Width, Height, and Rotation on same line */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Largeur</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.width || 20).toString()).toFixed(2)}
                        onChange={(e) => updateElement({ width: parseFloat(e.target.value) })}
                        step="1"
                        style={{
                          width: '50px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Hauteur</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.height || 20).toString()).toFixed(2)}
                        onChange={(e) => updateElement({ height: parseFloat(e.target.value) })}
                        step="1"
                        style={{
                          width: '50px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Rotation</label>
                      <input
                        type="number"
                        value={parseFloat((selectedElement.rotation || 0).toString()).toFixed(1)}
                        onChange={(e) => updateElement({ rotation: parseFloat(e.target.value) })}
                        step="1"
                        min="-360"
                        max="360"
                        style={{
                          width: '50px',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Background Color - its own row */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Fond</label>
                    <input
                      type="color"
                      value={selectedElement.backgroundColor || '#ffffff'}
                      onChange={(e) => updateElement({ backgroundColor: e.target.value })}
                      style={{
                        width: '100%',
                        height: '32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  {/* Border properties on same line: color, thickness, corner radius */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Bordure</label>
                      <input
                        type="color"
                        value={selectedElement.borderColor || '#000000'}
                        onChange={(e) => updateElement({ borderColor: e.target.value })}
                        style={{
                          width: '100%',
                          height: '28px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Épaisseur</label>
                      <input
                        type="number"
                        value={selectedElement.borderWidth || 0}
                        onChange={(e) => updateElement({ borderWidth: parseInt(e.target.value) })}
                        min="0"
                        max="20"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Coins</label>
                      <input
                        type="number"
                        value={selectedElement.borderRadius || 0}
                        onChange={(e) => updateElement({ borderRadius: parseInt(e.target.value) })}
                        min="0"
                        max="50"
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
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
    </>
  );
}
