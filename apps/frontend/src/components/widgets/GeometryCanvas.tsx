'use client';

import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Hexagon,
  Circle,
  Square,
  Triangle,
  Ruler,
  RotateCcw,
  Plus,
  Trash2,
  Move,
  MousePointer,
  Pencil,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Geometry element types
export type GeometryElementType = 'point' | 'line' | 'segment' | 'circle' | 'polygon' | 'angle';

// Geometry element definition
export interface GeometryElement {
  id: string;
  type: GeometryElementType;
  points: { x: number; y: number }[];
  color: string;
  label?: string;
  radius?: number; // For circles
}

// Tool mode
export type GeometryTool = 'select' | 'point' | 'line' | 'segment' | 'circle' | 'polygon';

// Geometry canvas props
export interface GeometryCanvasProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description/instructions */
  description?: string;
  /** Initial elements */
  initialElements?: GeometryElement[];
  /** Available tools */
  availableTools?: GeometryTool[];
  /** Canvas width */
  canvasWidth?: number;
  /** Canvas height */
  canvasHeight?: number;
  /** Show grid */
  showGrid?: boolean;
  /** Show measurements */
  showMeasurements?: boolean;
  /** Snap to grid */
  snapToGrid?: boolean;
  /** Grid size */
  gridSize?: number;
  /** Read-only mode */
  readOnly?: boolean;
  /** Expected element for validation */
  expectedElement?: {
    type: GeometryElementType;
    tolerance?: number;
    properties?: Record<string, number>;
  };
}

// Tool icons mapping
const TOOL_ICONS: Record<GeometryTool, React.ReactNode> = {
  select: <MousePointer className="w-4 h-4" />,
  point: <Circle className="w-4 h-4" />,
  line: <Ruler className="w-4 h-4" />,
  segment: <Pencil className="w-4 h-4" />,
  circle: <Circle className="w-4 h-4" />,
  polygon: <Hexagon className="w-4 h-4" />,
};

// Tool labels
const TOOL_LABELS: Record<GeometryTool, string> = {
  select: 'เลือก',
  point: 'จุด',
  line: 'เส้นตรง',
  segment: 'ส่วนของเส้นตรง',
  circle: 'วงกลม',
  polygon: 'รูปหลายเหลี่ยม',
};

// Element colors
const ELEMENT_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#EF4444', // Red
];

/**
 * GeometryCanvas Widget
 *
 * Interactive geometry construction canvas.
 * Supports points, lines, segments, circles, and polygons.
 *
 * Note: For production, integrate with JSXGraph library for advanced features.
 * This is a canvas-based implementation for basic functionality.
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function GeometryCanvas({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  description,
  initialElements = [],
  availableTools = ['select', 'point', 'line', 'segment', 'circle', 'polygon'],
  canvasWidth = 600,
  canvasHeight = 400,
  showGrid = true,
  showMeasurements = true,
  snapToGrid = true,
  gridSize = 20,
  readOnly = false,
  expectedElement,
  onInteract,
  onComplete,
}: GeometryCanvasProps) {
  const uniqueId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<GeometryElement[]>(initialElements);
  const [currentTool, setCurrentTool] = useState<GeometryTool>('select');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tempPoints, setTempPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [colorIndex, setColorIndex] = useState(0);

  // Get subject color classes
  const getSubjectColorClass = (variant: 'bg' | 'text' | 'border' | 'ring') => {
    const colorMap: Record<string, Record<string, string>> = {
      math: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        ring: 'ring-blue-500/20',
      },
      science: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        ring: 'ring-emerald-500/20',
      },
      physics: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        ring: 'ring-orange-500/20',
      },
    };
    return colorMap[subject]?.[variant] || colorMap.math[variant];
  };

  // Snap point to grid
  const snapPoint = useCallback(
    (x: number, y: number) => {
      if (!snapToGrid) return { x, y };
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    },
    [snapToGrid, gridSize],
  );

  // Calculate distance between two points
  const distance = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  // Calculate angle between three points
  const calculateAngle = useCallback(
    (p1: { x: number; y: number }, vertex: { x: number; y: number }, p2: { x: number; y: number }) => {
      const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
      const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      const angle = Math.acos(dot / (mag1 * mag2));
      return (angle * 180) / Math.PI;
    },
    [],
  );

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#FFFCF7'; // Kidpen cream
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw elements
    elements.forEach((element) => {
      const isSelected = element.id === selectedElement;
      ctx.strokeStyle = isSelected ? '#F5A623' : element.color;
      ctx.fillStyle = element.color;
      ctx.lineWidth = isSelected ? 3 : 2;

      switch (element.type) {
        case 'point':
          ctx.beginPath();
          ctx.arc(element.points[0].x, element.points[0].y, 6, 0, Math.PI * 2);
          ctx.fill();
          if (element.label) {
            ctx.fillStyle = '#374151';
            ctx.font = '14px "IBM Plex Sans Thai", sans-serif';
            ctx.fillText(element.label, element.points[0].x + 10, element.points[0].y - 10);
          }
          break;

        case 'line':
        case 'segment':
          if (element.points.length >= 2) {
            ctx.beginPath();
            if (element.type === 'line') {
              // Extend line beyond points
              const dx = element.points[1].x - element.points[0].x;
              const dy = element.points[1].y - element.points[0].y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const scale = 1000 / len;
              ctx.moveTo(element.points[0].x - dx * scale, element.points[0].y - dy * scale);
              ctx.lineTo(element.points[1].x + dx * scale, element.points[1].y + dy * scale);
            } else {
              ctx.moveTo(element.points[0].x, element.points[0].y);
              ctx.lineTo(element.points[1].x, element.points[1].y);
            }
            ctx.stroke();

            // Draw endpoints
            element.points.forEach((p) => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
              ctx.fill();
            });

            // Show length measurement
            if (showMeasurements && element.type === 'segment') {
              const len = distance(element.points[0], element.points[1]) / gridSize;
              const midX = (element.points[0].x + element.points[1].x) / 2;
              const midY = (element.points[0].y + element.points[1].y) / 2;
              ctx.fillStyle = '#374151';
              ctx.font = '12px "IBM Plex Sans Thai", sans-serif';
              ctx.fillText(`${len.toFixed(1)} หน่วย`, midX + 5, midY - 5);
            }
          }
          break;

        case 'circle':
          if (element.points.length >= 1 && element.radius) {
            ctx.beginPath();
            ctx.arc(element.points[0].x, element.points[0].y, element.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Center point
            ctx.beginPath();
            ctx.arc(element.points[0].x, element.points[0].y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Show radius
            if (showMeasurements) {
              const r = element.radius / gridSize;
              ctx.fillStyle = '#374151';
              ctx.font = '12px "IBM Plex Sans Thai", sans-serif';
              ctx.fillText(`r = ${r.toFixed(1)}`, element.points[0].x + 10, element.points[0].y - 10);
            }
          }
          break;

        case 'polygon':
          if (element.points.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            element.points.forEach((p, i) => {
              if (i > 0) ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();
            ctx.globalAlpha = 0.2;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.stroke();

            // Draw vertices
            element.points.forEach((p, i) => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
              ctx.fill();

              // Label vertices
              if (element.label) {
                ctx.fillStyle = '#374151';
                ctx.font = '14px "IBM Plex Sans Thai", sans-serif';
                ctx.fillText(String.fromCharCode(65 + i), p.x + 10, p.y - 5);
              }
            });
          }
          break;
      }
    });

    // Draw temporary construction points
    if (tempPoints.length > 0) {
      ctx.strokeStyle = '#F5A623';
      ctx.fillStyle = '#F5A623';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      tempPoints.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(tempPoints[i - 1].x, tempPoints[i - 1].y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      });

      ctx.setLineDash([]);
    }
  }, [elements, selectedElement, showGrid, gridSize, showMeasurements, tempPoints, distance]);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (disabled || readOnly) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const point = snapPoint(rawX, rawY);

      setAttempts((prev) => prev + 1);

      const interaction: WidgetInteraction = {
        type: 'click',
        timestamp: Date.now(),
        data: { tool: currentTool, point },
      };
      onInteract?.(interaction);

      switch (currentTool) {
        case 'select':
          // Find clicked element
          let found = false;
          for (const element of elements) {
            for (const p of element.points) {
              if (distance(p, point) < 15) {
                setSelectedElement(element.id);
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (!found) setSelectedElement(null);
          break;

        case 'point':
          const newPoint: GeometryElement = {
            id: Date.now().toString(),
            type: 'point',
            points: [point],
            color: ELEMENT_COLORS[colorIndex % ELEMENT_COLORS.length],
            label: String.fromCharCode(65 + elements.filter((e) => e.type === 'point').length),
          };
          setElements((prev) => [...prev, newPoint]);
          setColorIndex((prev) => prev + 1);
          break;

        case 'line':
        case 'segment':
          if (tempPoints.length === 0) {
            setTempPoints([point]);
          } else {
            const newLine: GeometryElement = {
              id: Date.now().toString(),
              type: currentTool,
              points: [...tempPoints, point],
              color: ELEMENT_COLORS[colorIndex % ELEMENT_COLORS.length],
            };
            setElements((prev) => [...prev, newLine]);
            setTempPoints([]);
            setColorIndex((prev) => prev + 1);
          }
          break;

        case 'circle':
          if (tempPoints.length === 0) {
            setTempPoints([point]);
          } else {
            const radius = distance(tempPoints[0], point);
            const newCircle: GeometryElement = {
              id: Date.now().toString(),
              type: 'circle',
              points: [tempPoints[0]],
              color: ELEMENT_COLORS[colorIndex % ELEMENT_COLORS.length],
              radius,
            };
            setElements((prev) => [...prev, newCircle]);
            setTempPoints([]);
            setColorIndex((prev) => prev + 1);
          }
          break;

        case 'polygon':
          // Double-click to complete
          if (
            tempPoints.length >= 2 &&
            distance(point, tempPoints[0]) < 15
          ) {
            const newPolygon: GeometryElement = {
              id: Date.now().toString(),
              type: 'polygon',
              points: [...tempPoints],
              color: ELEMENT_COLORS[colorIndex % ELEMENT_COLORS.length],
              label: 'รูปหลายเหลี่ยม',
            };
            setElements((prev) => [...prev, newPolygon]);
            setTempPoints([]);
            setColorIndex((prev) => prev + 1);

            // Check if expected polygon
            if (expectedElement?.type === 'polygon') {
              const result: WidgetResult = {
                success: true,
                score: 100,
                attempts,
                timeSpent: Date.now() - startTime,
                data: { polygon: newPolygon },
              };
              onComplete?.(result);
            }
          } else {
            setTempPoints((prev) => [...prev, point]);
          }
          break;
      }
    },
    [
      disabled,
      readOnly,
      currentTool,
      tempPoints,
      elements,
      colorIndex,
      distance,
      snapPoint,
      expectedElement,
      attempts,
      startTime,
      onInteract,
      onComplete,
    ],
  );

  // Delete selected element
  const handleDelete = useCallback(() => {
    if (!selectedElement) return;
    setElements((prev) => prev.filter((e) => e.id !== selectedElement));
    setSelectedElement(null);
  }, [selectedElement]);

  // Clear all elements
  const handleClear = useCallback(() => {
    setElements(initialElements);
    setTempPoints([]);
    setSelectedElement(null);
    setColorIndex(0);
  }, [initialElements]);

  // Cancel current construction
  const handleCancel = useCallback(() => {
    setTempPoints([]);
  }, []);

  // Redraw on changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    drawCanvas();
  }, [canvasWidth, canvasHeight, drawCanvas]);

  return (
    <Card
      id={id}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'border-2 shadow-kidpen hover:shadow-kidpen-lg',
        getSubjectColorClass('border'),
        disabled && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-outfit font-semibold flex items-center gap-2">
              <Hexagon className={cn('w-5 h-5', getSubjectColorClass('text'))} />
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>

          <Badge
            variant="outline"
            className={cn(
              'text-xs px-3 py-1',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
              getSubjectColorClass('border'),
            )}
          >
            เรขาคณิต
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        {!readOnly && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {availableTools.map((tool) => (
                <Button
                  key={tool}
                  variant={currentTool === tool ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setCurrentTool(tool);
                    setTempPoints([]);
                  }}
                  className={cn(
                    'gap-1.5',
                    currentTool === tool && 'bg-kidpen-gold hover:bg-kidpen-gold/90 text-white',
                  )}
                >
                  {TOOL_ICONS[tool]}
                  <span className="text-xs">{TOOL_LABELS[tool]}</span>
                </Button>
              ))}
            </div>

            <div className="flex gap-1">
              {selectedElement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="gap-1.5 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบ
                </Button>
              )}
              {tempPoints.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5">
                  ยกเลิก
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5">
                <RotateCcw className="w-4 h-4" />
                ล้าง
              </Button>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div
          className={cn(
            'relative rounded-lg border-2 overflow-hidden',
            getSubjectColorClass('border'),
          )}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onClick={handleCanvasClick}
            className="cursor-crosshair"
          />
        </div>

        {/* Element Count */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>รูปทรง: {elements.length}</span>
          {tempPoints.length > 0 && (
            <span className="text-amber-600">
              กำลังวาด... ({tempPoints.length} จุด)
            </span>
          )}
        </div>

        {/* Hints */}
        {showHints && !readOnly && (
          <div className="text-xs text-muted-foreground">
            <p>
              💡 เลือกเครื่องมือ → คลิกบนกระดานเพื่อวาด • สำหรับรูปหลายเหลี่ยม คลิกจุดแรกอีกครั้งเพื่อปิดรูป
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GeometryCanvas;
