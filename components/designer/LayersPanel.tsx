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
import { GripVertical, Layers, Trash2 } from 'lucide-react';
import React from 'react';

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

interface LayersPanelProps {
  template: BibTemplateConfig;
  selectedElement: TemplateElement | null;
  onSelectElement: (element: TemplateElement) => void;
  onDeleteElement: (elementId: string) => void;
  onUpdateElementName: (elementId: string, name: string) => void;
  onReorderElements: (elements: TemplateElement[]) => void;
  getElementIcon: (element: TemplateElement) => React.ReactNode;
  getElementDisplayName: (element: TemplateElement) => string;
}

export default function LayersPanel({
  template,
  selectedElement,
  onSelectElement,
  onDeleteElement,
  onUpdateElementName,
  onReorderElements,
  getElementIcon,
  getElementDisplayName,
}: LayersPanelProps) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = template.elements.findIndex((el) => el.id === active.id);
      const newIndex = template.elements.findIndex((el) => el.id === over.id);
      const newElements = arrayMove(template.elements, oldIndex, newIndex);
      onReorderElements(newElements);
    }
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
                      onSelect={onSelectElement}
                      onDelete={onDeleteElement}
                      onUpdateName={onUpdateElementName}
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
    </>
  );
}
