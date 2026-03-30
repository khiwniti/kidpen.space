'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Import all widgets
import { SliderExplorer } from './SliderExplorer';
import { DragDropProblem } from './DragDropProblem';
import { StepByStepReveal } from './StepByStepReveal';
import { MultipleChoiceVisual } from './MultipleChoiceVisual';
import { FillInReasoning } from './FillInReasoning';
import { NumberLine } from './NumberLine';
import { BalanceScale } from './BalanceScale';
import { DataTable } from './DataTable';
import { CodePlayground } from './CodePlayground';
import { GraphingWidget } from './GraphingWidget';
import { GeometryCanvas } from './GeometryCanvas';
import { AnimatedExplanation } from './AnimatedExplanation';
import { PhysicsSimulation } from './PhysicsSimulation';
import { MolecularViewer, MOLECULES } from './MolecularViewer';
import { MathRenderer, InlineMath, BlockMath } from './MathRenderer';

// Widget type definitions for Markdoc schema
export type WidgetType =
  | 'slider'
  | 'drag-drop'
  | 'step-reveal'
  | 'multiple-choice'
  | 'fill-blank'
  | 'number-line'
  | 'balance-scale'
  | 'data-table'
  | 'code-playground'
  | 'graphing'
  | 'geometry'
  | 'animation'
  | 'physics'
  | 'molecule'
  | 'math';

// Widget registry for dynamic rendering
export const WIDGET_REGISTRY: Record<WidgetType, React.ComponentType<any>> = {
  slider: SliderExplorer,
  'drag-drop': DragDropProblem,
  'step-reveal': StepByStepReveal,
  'multiple-choice': MultipleChoiceVisual,
  'fill-blank': FillInReasoning,
  'number-line': NumberLine,
  'balance-scale': BalanceScale,
  'data-table': DataTable,
  'code-playground': CodePlayground,
  graphing: GraphingWidget,
  geometry: GeometryCanvas,
  animation: AnimatedExplanation,
  physics: PhysicsSimulation,
  molecule: MolecularViewer,
  math: BlockMath,
};

// Widget config interface
export interface WidgetConfig {
  type: WidgetType;
  props: Record<string, any>;
  id?: string;
}

// Parse widget JSON from markdown code block
export function parseWidgetConfig(jsonString: string): WidgetConfig | null {
  try {
    const config = JSON.parse(jsonString);
    if (config.type && WIDGET_REGISTRY[config.type as WidgetType]) {
      return config as WidgetConfig;
    }
    return null;
  } catch {
    return null;
  }
}

// Dynamic widget renderer
export interface DynamicWidgetProps {
  config: WidgetConfig;
  className?: string;
  onInteract?: (interaction: any) => void;
  onComplete?: (result: any) => void;
}

export function DynamicWidget({
  config,
  className,
  onInteract,
  onComplete,
}: DynamicWidgetProps) {
  const WidgetComponent = WIDGET_REGISTRY[config.type];

  if (!WidgetComponent) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
        Unknown widget type: {config.type}
      </div>
    );
  }

  // Merge callbacks with config props
  const props = {
    ...config.props,
    id: config.id,
    onInteract,
    onComplete,
  };

  return (
    <div className={cn('kidpen-widget my-6', className)}>
      <WidgetComponent {...props} />
    </div>
  );
}

// Markdown content with embedded widgets
export interface MarkdownWithWidgetsProps {
  content: string;
  widgets?: WidgetConfig[];
  className?: string;
  onWidgetInteract?: (widgetId: string, interaction: any) => void;
  onWidgetComplete?: (widgetId: string, result: any) => void;
}

/**
 * MarkdownWithWidgets Component
 *
 * Renders markdown content with embedded interactive widgets.
 * Widgets can be defined either:
 * 1. As a separate widgets array (for programmatic use)
 * 2. Inline using ```widget JSON code blocks (for content authoring)
 *
 * Example markdown with inline widget:
 * ```
 * # บทเรียน: พื้นที่สี่เหลี่ยม
 *
 * ลองเปลี่ยนค่าความกว้างและความยาวเพื่อดูว่าพื้นที่เปลี่ยนแปลงอย่างไร:
 *
 * ```widget
 * {
 *   "type": "slider",
 *   "id": "area-explorer",
 *   "props": {
 *     "title": "สำรวจพื้นที่สี่เหลี่ยม",
 *     "subject": "math",
 *     "sliders": [
 *       { "label": "กว้าง", "min": 1, "max": 20, "defaultValue": 5, "unit": "ซม." },
 *       { "label": "ยาว", "min": 1, "max": 20, "defaultValue": 8, "unit": "ซม." }
 *     ]
 *   }
 * }
 * ```
 *
 * จากผลลัพธ์ข้างต้น เราจะเห็นว่า...
 * ```
 */
export function MarkdownWithWidgets({
  content,
  widgets = [],
  className,
  onWidgetInteract,
  onWidgetComplete,
}: MarkdownWithWidgetsProps) {
  // Parse inline widget definitions from markdown
  const parseContent = React.useCallback(() => {
    const widgetPattern = /```widget\n([\s\S]*?)\n```/g;
    const parts: Array<{ type: 'text' | 'widget'; content: string | WidgetConfig }> = [];
    let lastIndex = 0;
    let match;

    while ((match = widgetPattern.exec(content)) !== null) {
      // Add text before the widget
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      // Parse and add the widget
      const widgetConfig = parseWidgetConfig(match[1]);
      if (widgetConfig) {
        parts.push({
          type: 'widget',
          content: widgetConfig,
        });
      } else {
        // If parsing fails, keep as text
        parts.push({
          type: 'text',
          content: match[0],
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts;
  }, [content]);

  const parts = parseContent();

  // Also add widgets from the widgets prop
  const allWidgets = [
    ...parts.filter((p) => p.type === 'widget').map((p) => p.content as WidgetConfig),
    ...widgets,
  ];

  // Create handler wrappers
  const createInteractHandler = (widgetId: string) => (interaction: any) => {
    onWidgetInteract?.(widgetId, interaction);
  };

  const createCompleteHandler = (widgetId: string) => (result: any) => {
    onWidgetComplete?.(widgetId, result);
  };

  return (
    <div className={cn('kidpen-content', className)}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <div
              key={`text-${index}`}
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(part.content as string) }}
            />
          );
        }

        const config = part.content as WidgetConfig;
        const widgetId = config.id || `widget-${index}`;

        return (
          <DynamicWidget
            key={widgetId}
            config={config}
            onInteract={createInteractHandler(widgetId)}
            onComplete={createCompleteHandler(widgetId)}
          />
        );
      })}
    </div>
  );
}

// Simple markdown to HTML converter for non-widget content
function simpleMarkdownToHtml(md: string): string {
  let html = md;

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-semibold mt-8 mb-4">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md text-sm font-mono bg-gray-100 dark:bg-gray-800">$1</code>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="my-4">');
  html = '<p class="my-4">' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p class="my-4"><\/p>/g, '');
  html = html.replace(/<p class="my-4">(<h[1-6])/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');

  return html;
}

// Markdoc schema definitions for content authoring
export const MARKDOC_WIDGET_SCHEMAS = {
  slider: {
    render: 'SliderExplorer',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      subject: { type: String, default: 'math' },
      sliders: { type: Array, required: true },
      showFormula: { type: Boolean, default: false },
      formula: { type: String },
    },
  },
  'drag-drop': {
    render: 'DragDropProblem',
    attributes: {
      title: { type: String, required: true },
      instructions: { type: String },
      subject: { type: String, default: 'science' },
      items: { type: Array, required: true },
      zones: { type: Array, required: true },
      allowMultiple: { type: Boolean, default: true },
      showFeedback: { type: Boolean, default: true },
    },
  },
  'multiple-choice': {
    render: 'MultipleChoiceVisual',
    attributes: {
      question: { type: String, required: true },
      options: { type: Array, required: true },
      subject: { type: String, default: 'math' },
      columns: { type: Number, default: 2 },
      shuffleOptions: { type: Boolean, default: false },
    },
  },
  'fill-blank': {
    render: 'FillInReasoning',
    attributes: {
      title: { type: String, required: true },
      content: { type: String, required: true },
      blanks: { type: Array, required: true },
      subject: { type: String, default: 'math' },
    },
  },
  'number-line': {
    render: 'NumberLine',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      step: { type: Number, default: 1 },
      problem: { type: Object },
      subject: { type: String, default: 'math' },
    },
  },
  'balance-scale': {
    render: 'BalanceScale',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      leftItems: { type: Array, required: true },
      rightItems: { type: Array, required: true },
      targetVariable: { type: String },
      expectedSolution: { type: Number },
      subject: { type: String, default: 'math' },
    },
  },
  'code-playground': {
    render: 'CodePlayground',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      language: { type: String, default: 'javascript' },
      initialCode: { type: String },
      expectedOutput: { type: String },
      solutionCode: { type: String },
    },
  },
  graphing: {
    render: 'GraphingWidget',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      initialFunctions: { type: Array },
      xRange: { type: Array },
      yRange: { type: Array },
      graphHeight: { type: Number, default: 400 },
      subject: { type: String, default: 'math' },
    },
  },
  geometry: {
    render: 'GeometryCanvas',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      availableTools: { type: Array },
      canvasWidth: { type: Number, default: 600 },
      canvasHeight: { type: Number, default: 400 },
      subject: { type: String, default: 'math' },
    },
  },
  animation: {
    render: 'AnimatedExplanation',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      frames: { type: Array, required: true },
      autoPlay: { type: Boolean, default: false },
      loop: { type: Boolean, default: false },
      pauseAtFrameEnd: { type: Boolean, default: true },
      subject: { type: String, default: 'math' },
    },
  },
  physics: {
    render: 'PhysicsSimulation',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      initialObjects: { type: Array, required: true },
      gravity: { type: Number, default: 9.8 },
      allowGravityControl: { type: Boolean, default: true },
      showVelocityVectors: { type: Boolean, default: true },
    },
  },
  molecule: {
    render: 'MolecularViewer',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      molecule: { type: Object, required: true },
      displayMode: { type: String, default: 'ball-stick' },
      allowRotation: { type: Boolean, default: true },
      allowZoom: { type: Boolean, default: true },
    },
  },
  math: {
    render: 'BlockMath',
    attributes: {
      expression: { type: String, required: true },
      fontSize: { type: String, default: 'lg' },
    },
  },
};

// Export predefined molecules for easy access
export { MOLECULES };

export default MarkdownWithWidgets;
