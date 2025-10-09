export interface RaceConfig {
  id: string;
  label: string;
  yearMatch: string; // e.g., "2020", "2019", "2020 ; 2019", "2016 et avant"
  color: string;
  isParent?: boolean;
}

export interface ColumnMapping {
  orderRef?: number;
  familyName?: number;
  adultFirstName?: number;
  childFirstName?: number;
  birthYear?: number;
  relay?: number;
  adult2FirstName?: number;
}

export interface BibData {
  bibNumber: number;
  firstName: string;
  lastName: string;
  raceConfig: RaceConfig;
}

export interface ParsedRow {
  [key: string]: string;
}

// Condition for conditional display of elements
export interface DisplayCondition {
  variable: string; // e.g., "race.label" or "race.color"
  value: string; // value to match
}

// Base properties shared by all element types
interface BaseTemplateElement {
  id: string;
  name?: string; // custom display name for the layer
  x: number; // percentage of container width
  y: number; // percentage of container height
  condition?: DisplayCondition; // optional condition for displaying this element
}

// Text element specific properties
export interface TextElement extends BaseTemplateElement {
  type: 'text';
  content?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  anchor?: 'left' | 'center' | 'right'; // horizontal anchor point for positioning
  verticalAnchor?: 'top' | 'middle' | 'bottom'; // vertical anchor point for positioning
}

// Image element specific properties
export interface ImageElement extends BaseTemplateElement {
  type: 'image';
  src?: string;
  width?: number; // percentage of container width
  height?: number; // percentage of container height
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  preserveAspectRatio?: boolean; // whether to maintain aspect ratio during resize
  rotation?: number; // rotation angle in degrees
}

// Shape element specific properties
export interface ShapeElement extends BaseTemplateElement {
  type: 'shape';
  width?: number; // percentage of container width
  height?: number; // percentage of container height
  shapeType?: 'square'; // starting with square
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number; // corner radius
  preserveAspectRatio?: boolean; // whether to maintain aspect ratio during resize
  rotation?: number; // rotation angle in degrees
}

// Discriminated union of all element types
export type TemplateElement = TextElement | ImageElement | ShapeElement;

export interface BibTemplateConfig {
  width: number; // in mm
  height: number; // in mm
  backgroundColor: string;
  borderRadius: number;
  elements: TemplateElement[];
}


