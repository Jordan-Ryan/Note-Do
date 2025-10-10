export type PARACategory = 'projects' | 'areas' | 'resources' | 'archive';

export interface PARAItem {
  id: string;
  name: string;
  type: PARACategory;
  parentId?: string;
  children?: PARAItem[];
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PARAFolder extends PARAItem {
  children: PARAItem[];
  notesCount: number;
}

export interface NoteContent {
  id: string;
  title: string;
  contentJson: any; // JSONContent from TipTap
  paraPath: string[]; // Array of folder IDs representing the path (e.g., ['projects', 'launch-q1-campaign'])
  updatedAt: string;
  createdAt: string;
}

export interface PARAState {
  folders: Record<string, PARAFolder>;
  notes: NoteContent[];
  selectedPath: string[];
  expandedFolders: Set<string>;
}

// Default PARA structure
export const DEFAULT_PARA_STRUCTURE: PARAItem[] = [
  {
    id: 'projects',
    name: 'Projects',
    type: 'projects',
    children: [],
    notesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'areas',
    name: 'Areas',
    type: 'areas',
    children: [],
    notesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'resources',
    name: 'Resources',
    type: 'resources',
    children: [],
    notesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'archive',
    name: 'Archive',
    type: 'archive',
    children: [],
    notesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
