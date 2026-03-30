/**
 * Kidpen Interactive Widget System
 * Core types for STEM learning widgets
 *
 * Part of the "Spark of Joy" Design System
 */

// Subject color worlds from design system
export type SubjectColor = 'math' | 'science' | 'coding' | 'physics';

// Common widget props
export interface BaseWidgetProps {
  /** Unique identifier for the widget instance */
  id?: string;
  /** CSS class names for styling */
  className?: string;
  /** Subject color theme */
  subject?: SubjectColor;
  /** Whether the widget is disabled */
  disabled?: boolean;
  /** Whether to show step-by-step hints */
  showHints?: boolean;
  /** Callback when the student interacts */
  onInteract?: (interaction: WidgetInteraction) => void;
  /** Callback when the student completes the activity */
  onComplete?: (result: WidgetResult) => void;
}

// Widget interaction event
export interface WidgetInteraction {
  type: 'input' | 'drag' | 'click' | 'slide' | 'draw';
  timestamp: number;
  data: Record<string, unknown>;
}

// Widget completion result
export interface WidgetResult {
  success: boolean;
  score?: number;
  attempts: number;
  timeSpent: number;
  data?: Record<string, unknown>;
}

// SliderExplorer specific types
export interface SliderConfig {
  /** Parameter name displayed to the user */
  label: string;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Initial/default value */
  defaultValue: number;
  /** Step increment */
  step: number;
  /** Units to display (e.g., "cm", "kg", "°") */
  unit?: string;
  /** Description of what this parameter affects */
  description?: string;
}

export interface SliderExplorerProps extends BaseWidgetProps {
  /** Title of the exploration */
  title: string;
  /** Description/question for students */
  description?: string;
  /** Array of slider configurations */
  sliders: SliderConfig[];
  /** Function to compute the result based on slider values */
  compute: (values: Record<string, number>) => SliderResult;
  /** Whether to show the formula */
  showFormula?: boolean;
  /** LaTeX formula string (optional) */
  formula?: string;
}

export interface SliderResult {
  /** The computed value */
  value: number;
  /** Display label for the result */
  label: string;
  /** Unit for the result */
  unit?: string;
  /** Color indicator for the result */
  indicator?: 'success' | 'warning' | 'error' | 'neutral';
}

// GraphingWidget specific types
export interface GraphPoint {
  x: number;
  y: number;
  label?: string;
}

export interface GraphFunction {
  /** Function expression (e.g., "x^2 + 2*x + 1") */
  expression: string;
  /** Display label */
  label: string;
  /** Line color */
  color?: string;
  /** Line style */
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface GraphingWidgetProps extends BaseWidgetProps {
  /** Title of the graph */
  title: string;
  /** X-axis configuration */
  xAxis: {
    min: number;
    max: number;
    label: string;
    unit?: string;
  };
  /** Y-axis configuration */
  yAxis: {
    min: number;
    max: number;
    label: string;
    unit?: string;
  };
  /** Functions to plot */
  functions?: GraphFunction[];
  /** Points to display */
  points?: GraphPoint[];
  /** Whether students can add points */
  allowAddPoints?: boolean;
  /** Whether students can draw functions */
  allowDrawFunction?: boolean;
  /** Grid visibility */
  showGrid?: boolean;
}

// GeometryCanvas specific types
export interface GeometryShape {
  type: 'point' | 'line' | 'circle' | 'triangle' | 'polygon' | 'angle';
  id: string;
  label?: string;
  color?: string;
  draggable?: boolean;
  data: Record<string, unknown>;
}

export interface GeometryCanvasProps extends BaseWidgetProps {
  /** Title of the geometry exercise */
  title: string;
  /** Initial shapes on the canvas */
  shapes?: GeometryShape[];
  /** Whether to show measurements */
  showMeasurements?: boolean;
  /** Whether to show coordinate grid */
  showGrid?: boolean;
  /** Canvas size in pixels */
  width?: number;
  height?: number;
  /** Tools available to the student */
  tools?: ('point' | 'line' | 'circle' | 'polygon' | 'measure' | 'angle')[];
}

// DragDropProblem specific types
export interface DragItem {
  id: string;
  content: string;
  category?: string;
}

export interface DropZone {
  id: string;
  label: string;
  acceptCategories?: string[];
  correctItems?: string[];
}

export interface DragDropProblemProps extends BaseWidgetProps {
  /** Title of the problem */
  title: string;
  /** Instructions for the student */
  instructions?: string;
  /** Items that can be dragged */
  items: DragItem[];
  /** Drop zones */
  zones: DropZone[];
  /** Whether to allow multiple items per zone */
  allowMultiple?: boolean;
  /** Whether to show immediate feedback */
  showFeedback?: boolean;
}

// StepByStepReveal specific types
export interface RevealStep {
  id: string;
  content: string;
  hint?: string;
  explanation?: string;
}

export interface StepByStepRevealProps extends BaseWidgetProps {
  /** Title of the step-by-step solution */
  title: string;
  /** Array of steps to reveal */
  steps: RevealStep[];
  /** Whether to require student attempt before revealing */
  requireAttempt?: boolean;
  /** Whether to auto-advance on correct answer */
  autoAdvance?: boolean;
}

// Subject color utilities
export const SUBJECT_COLORS: Record<SubjectColor, { primary: string; light: string; dark: string }> = {
  math: {
    primary: 'hsl(var(--subject-math))',
    light: 'hsl(var(--subject-math) / 0.1)',
    dark: 'hsl(var(--subject-math) / 0.9)',
  },
  science: {
    primary: 'hsl(var(--subject-science))',
    light: 'hsl(var(--subject-science) / 0.1)',
    dark: 'hsl(var(--subject-science) / 0.9)',
  },
  coding: {
    primary: 'hsl(var(--subject-coding))',
    light: 'hsl(var(--subject-coding) / 0.1)',
    dark: 'hsl(var(--subject-coding) / 0.9)',
  },
  physics: {
    primary: 'hsl(var(--subject-physics))',
    light: 'hsl(var(--subject-physics) / 0.1)',
    dark: 'hsl(var(--subject-physics) / 0.9)',
  },
};

// XP and gamification types
export interface XPReward {
  amount: number;
  reason: string;
  multiplier?: number;
}

export interface WidgetProgress {
  widgetId: string;
  completed: boolean;
  score: number;
  xpEarned: number;
  streakCount: number;
  lastInteraction: number;
}
