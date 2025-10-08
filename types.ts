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

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  name?: string; // custom display name for the layer
  x: number; // percentage of container width
  y: number; // percentage of container height
  width?: number; // percentage of container width
  height?: number; // percentage of container height
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  anchor?: 'left' | 'center' | 'right'; // horizontal anchor point for positioning
  verticalAnchor?: 'top' | 'middle' | 'bottom'; // vertical anchor point for positioning
  content?: string; // for text elements
  src?: string; // for image elements
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'; // for image elements
  preserveAspectRatio?: boolean; // for image elements - whether to maintain aspect ratio during resize
  rotation?: number; // rotation angle in degrees, for image elements and shapes
  shapeType?: 'square'; // for shape elements - starting with square
  backgroundColor?: string; // for shape elements
  borderWidth?: number; // for shape elements
  borderColor?: string; // for shape elements
  borderRadius?: number; // for shape elements - corner radius
}

export interface BibTemplateConfig {
  width: number; // in mm
  height: number; // in mm
  backgroundColor: string;
  borderRadius: number;
  elements: TemplateElement[];
}


