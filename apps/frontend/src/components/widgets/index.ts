/**
 * Kidpen Interactive Widget Library
 *
 * Pre-built React components for STEM education
 * Part of the Kidpen "Spark of Joy" Design System
 *
 * @module widgets
 */

// Types
export * from './types';

// Core Widgets
export { SliderExplorer } from './SliderExplorer';
export { DragDropProblem } from './DragDropProblem';
export { StepByStepReveal } from './StepByStepReveal';
export { MultipleChoiceVisual } from './MultipleChoiceVisual';
export { FillInReasoning } from './FillInReasoning';
export { NumberLine } from './NumberLine';
export { BalanceScale } from './BalanceScale';
export { DataTable } from './DataTable';
export { CodePlayground } from './CodePlayground';

// Advanced Widgets
export { GraphingWidget } from './GraphingWidget';
export { GeometryCanvas } from './GeometryCanvas';
export { AnimatedExplanation } from './AnimatedExplanation';
export { PhysicsSimulation } from './PhysicsSimulation';
export { MolecularViewer, MOLECULES } from './MolecularViewer';

// Math Rendering
export { MathRenderer, InlineMath, BlockMath, Equation } from './MathRenderer';

// Widget-specific types
export type { ChoiceOption, MultipleChoiceVisualProps } from './MultipleChoiceVisual';
export type { BlankConfig, FillInReasoningProps } from './FillInReasoning';
export type { NumberLineMarker, NumberLineProblem, NumberLineProps } from './NumberLine';
export type { ScaleItem, BalanceScaleProps } from './BalanceScale';
export type { DataColumn, DataRow, DataTableStats, DataTableProps } from './DataTable';
export type { ProgrammingLanguage, CodePlaygroundProps } from './CodePlayground';

// Advanced widget types
export type { GraphFunction, GraphingWidgetProps } from './GraphingWidget';
export type { GeometryElement, GeometryElementType, GeometryTool, GeometryCanvasProps } from './GeometryCanvas';
export type { AnimationFrame, AnimatedExplanationProps } from './AnimatedExplanation';
export type { PhysicsObject, PhysicsSimulationProps } from './PhysicsSimulation';
export type { MoleculeAtom, MoleculeBond, Molecule, ElementInfo, MolecularViewerProps } from './MolecularViewer';
export type { MathRendererProps, EquationProps } from './MathRenderer';

// Gamification
export {
  XPBadge,
  StreakBadge,
  LeagueBadge,
  MentorBadge,
  CreatorBadge,
  MasteryBadge,
  AchievementBadge,
  BadgeCollection,
} from './GamificationBadges';
export type {
  BadgeType,
  LeagueTier,
  XPBadgeProps,
  StreakBadgeProps,
  LeagueBadgeProps,
  MentorBadgeProps,
  CreatorBadgeProps,
  MasteryBadgeProps,
  AchievementBadgeProps,
  BadgeCollectionProps,
} from './GamificationBadges';

// Default exports for convenience
export { default as SliderExplorerWidget } from './SliderExplorer';
export { default as DragDropProblemWidget } from './DragDropProblem';
export { default as StepByStepRevealWidget } from './StepByStepReveal';
export { default as MultipleChoiceVisualWidget } from './MultipleChoiceVisual';
export { default as FillInReasoningWidget } from './FillInReasoning';
export { default as NumberLineWidget } from './NumberLine';
export { default as BalanceScaleWidget } from './BalanceScale';
export { default as DataTableWidget } from './DataTable';
export { default as CodePlaygroundWidget } from './CodePlayground';
export { default as GraphingWidgetWidget } from './GraphingWidget';
export { default as GeometryCanvasWidget } from './GeometryCanvas';
export { default as AnimatedExplanationWidget } from './AnimatedExplanation';
export { default as PhysicsSimulationWidget } from './PhysicsSimulation';
export { default as MolecularViewerWidget } from './MolecularViewer';
export { default as MathRendererWidget } from './MathRenderer';

// Demo
export { WidgetDemo } from './WidgetDemo';
export { default as WidgetDemoPage } from './WidgetDemo';
export { ContentAuthoringDemo } from './ContentAuthoringDemo';

// Markdoc Integration
export {
  DynamicWidget,
  MarkdownWithWidgets,
  parseWidgetConfig,
  WIDGET_REGISTRY,
  MARKDOC_WIDGET_SCHEMAS,
} from './MarkdocIntegration';
export type { WidgetType, WidgetConfig, DynamicWidgetProps, MarkdownWithWidgetsProps } from './MarkdocIntegration';
