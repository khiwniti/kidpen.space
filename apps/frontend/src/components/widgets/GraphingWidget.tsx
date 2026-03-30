'use client';

import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Palette,
  ZoomIn,
  ZoomOut,
  Crosshair,
  RotateCcw,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Graph function definition
export interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  label?: string;
}

// Graphing widget props
export interface GraphingWidgetProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description/instructions */
  description?: string;
  /** Initial functions to display */
  initialFunctions?: GraphFunction[];
  /** Allow adding new functions */
  allowAddFunctions?: boolean;
  /** Allow editing functions */
  allowEditFunctions?: boolean;
  /** X-axis range [min, max] */
  xRange?: [number, number];
  /** Y-axis range [min, max] */
  yRange?: [number, number];
  /** Show grid */
  showGrid?: boolean;
  /** Show axis labels */
  showAxisLabels?: boolean;
  /** Graph height */
  graphHeight?: number;
  /** Expected intersection point for validation */
  expectedIntersection?: { x: number; y: number; tolerance: number };
  /** Expected function to match */
  expectedFunction?: { expression: string; tolerance: number };
}

// Available colors for functions
const FUNCTION_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

/**
 * GraphingWidget
 *
 * Interactive function graphing widget using canvas-based rendering.
 * Supports multiple functions, zooming, and point tracing.
 *
 * Note: For production, integrate with JSXGraph library for advanced features.
 * This is a canvas-based implementation for basic functionality.
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function GraphingWidget({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  description,
  initialFunctions = [],
  allowAddFunctions = true,
  allowEditFunctions = true,
  xRange = [-10, 10],
  yRange = [-10, 10],
  showGrid = true,
  showAxisLabels = true,
  graphHeight = 400,
  expectedIntersection,
  expectedFunction,
  onInteract,
  onComplete,
}: GraphingWidgetProps) {
  const uniqueId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functions, setFunctions] = useState<GraphFunction[]>(
    initialFunctions.length > 0
      ? initialFunctions
      : [{ id: '1', expression: 'x', color: FUNCTION_COLORS[0], visible: true, label: 'f(x) = x' }],
  );
  const [newExpression, setNewExpression] = useState('');
  const [viewRange, setViewRange] = useState({ x: xRange, y: yRange });
  const [tracePoint, setTracePoint] = useState<{ x: number; y: number } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

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
      coding: {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-200 dark:border-violet-800',
        ring: 'ring-violet-500/20',
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

  // Parse and evaluate mathematical expression
  const evaluateExpression = useCallback((expr: string, x: number): number | null => {
    try {
      // Simple expression parser supporting basic math functions
      const sanitized = expr
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/log/g, 'Math.log')
        .replace(/exp/g, 'Math.exp')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e(?![x])/gi, 'Math.E');

      // eslint-disable-next-line no-new-func
      const fn = new Function('x', `return ${sanitized}`);
      const result = fn(x);
      return isFinite(result) ? result : null;
    } catch {
      return null;
    }
  }, []);

  // Draw the graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const [xMin, xMax] = viewRange.x;
    const [yMin, yMax] = viewRange.y;

    // Clear canvas
    ctx.fillStyle = '#FFFCF7'; // Kidpen cream background
    ctx.fillRect(0, 0, width, height);

    // Coordinate transforms
    const xToCanvas = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const yToCanvas = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let x = Math.ceil(xMin); x <= xMax; x++) {
        ctx.beginPath();
        ctx.moveTo(xToCanvas(x), 0);
        ctx.lineTo(xToCanvas(x), height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = Math.ceil(yMin); y <= yMax; y++) {
        ctx.beginPath();
        ctx.moveTo(0, yToCanvas(y));
        ctx.lineTo(width, yToCanvas(y));
        ctx.stroke();
      }
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, yToCanvas(0));
      ctx.lineTo(width, yToCanvas(0));
      ctx.stroke();
    }

    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(xToCanvas(0), 0);
      ctx.lineTo(xToCanvas(0), height);
      ctx.stroke();
    }

    // Draw axis labels
    if (showAxisLabels) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px "IBM Plex Sans Thai", sans-serif';
      ctx.textAlign = 'center';

      // X-axis labels
      for (let x = Math.ceil(xMin); x <= xMax; x++) {
        if (x !== 0) {
          ctx.fillText(x.toString(), xToCanvas(x), yToCanvas(0) + 15);
        }
      }

      // Y-axis labels
      ctx.textAlign = 'right';
      for (let y = Math.ceil(yMin); y <= yMax; y++) {
        if (y !== 0) {
          ctx.fillText(y.toString(), xToCanvas(0) - 5, yToCanvas(y) + 4);
        }
      }

      // Origin
      ctx.fillText('0', xToCanvas(0) - 5, yToCanvas(0) + 15);
    }

    // Draw functions
    functions.forEach((func) => {
      if (!func.visible) return;

      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let started = false;
      const step = (xMax - xMin) / width;

      for (let px = 0; px < width; px++) {
        const x = xMin + px * step;
        const y = evaluateExpression(func.expression, x);

        if (y !== null && y >= yMin && y <= yMax) {
          const canvasY = yToCanvas(y);
          if (!started) {
            ctx.moveTo(px, canvasY);
            started = true;
          } else {
            ctx.lineTo(px, canvasY);
          }
        } else {
          started = false;
        }
      }

      ctx.stroke();
    });

    // Draw trace point
    if (tracePoint) {
      ctx.fillStyle = '#F5A623'; // Kidpen gold
      ctx.beginPath();
      ctx.arc(xToCanvas(tracePoint.x), yToCanvas(tracePoint.y), 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.font = '12px "IBM Plex Sans Thai", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `(${tracePoint.x.toFixed(2)}, ${tracePoint.y.toFixed(2)})`,
        xToCanvas(tracePoint.x) + 10,
        yToCanvas(tracePoint.y) - 10,
      );
    }
  }, [functions, viewRange, showGrid, showAxisLabels, evaluateExpression, tracePoint]);

  // Handle canvas click for tracing
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || disabled) return;

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const [xMin, xMax] = viewRange.x;
      const [yMin, yMax] = viewRange.y;

      const x = xMin + (px / canvas.width) * (xMax - xMin);
      const y = yMax - (py / canvas.height) * (yMax - yMin);

      // Find closest function value
      let closestFunc: GraphFunction | null = null;
      let closestY = Infinity;

      functions.forEach((func) => {
        if (!func.visible) return;
        const fy = evaluateExpression(func.expression, x);
        if (fy !== null && Math.abs(fy - y) < Math.abs(closestY - y)) {
          closestY = fy;
          closestFunc = func;
        }
      });

      if (closestFunc && Math.abs(closestY - y) < 1) {
        setTracePoint({ x, y: closestY });

        const interaction: WidgetInteraction = {
          type: 'click',
          timestamp: Date.now(),
          data: { action: 'trace', x, y: closestY, function: closestFunc.expression },
        };
        onInteract?.(interaction);
      }
    },
    [disabled, viewRange, functions, evaluateExpression, onInteract],
  );

  // Add a new function
  const handleAddFunction = useCallback(() => {
    if (!newExpression.trim() || disabled) return;

    const newFunc: GraphFunction = {
      id: Date.now().toString(),
      expression: newExpression,
      color: FUNCTION_COLORS[functions.length % FUNCTION_COLORS.length],
      visible: true,
      label: `f(x) = ${newExpression}`,
    };

    setFunctions((prev) => [...prev, newFunc]);
    setNewExpression('');
    setAttempts((prev) => prev + 1);

    const interaction: WidgetInteraction = {
      type: 'input',
      timestamp: Date.now(),
      data: { action: 'add_function', expression: newExpression },
    };
    onInteract?.(interaction);

    // Check if matches expected function
    if (expectedFunction) {
      // Simple string comparison for now
      const normalized = newExpression.replace(/\s+/g, '');
      const expectedNormalized = expectedFunction.expression.replace(/\s+/g, '');
      if (normalized === expectedNormalized) {
        const result: WidgetResult = {
          success: true,
          score: 100,
          attempts,
          timeSpent: Date.now() - startTime,
          data: { expression: newExpression },
        };
        onComplete?.(result);
      }
    }
  }, [newExpression, disabled, functions.length, attempts, startTime, expectedFunction, onInteract, onComplete]);

  // Toggle function visibility
  const toggleFunctionVisibility = useCallback((funcId: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === funcId ? { ...f, visible: !f.visible } : f)),
    );
  }, []);

  // Remove function
  const removeFunction = useCallback((funcId: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== funcId));
  }, []);

  // Zoom functions
  const handleZoom = useCallback((factor: number) => {
    setViewRange((prev) => {
      const xMid = (prev.x[0] + prev.x[1]) / 2;
      const yMid = (prev.y[0] + prev.y[1]) / 2;
      const xRange = (prev.x[1] - prev.x[0]) * factor;
      const yRange = (prev.y[1] - prev.y[0]) * factor;
      return {
        x: [xMid - xRange / 2, xMid + xRange / 2] as [number, number],
        y: [yMid - yRange / 2, yMid + yRange / 2] as [number, number],
      };
    });
  }, []);

  // Reset view
  const handleResetView = useCallback(() => {
    setViewRange({ x: xRange, y: yRange });
    setTracePoint(null);
  }, [xRange, yRange]);

  // Redraw when dependencies change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      drawGraph();
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [drawGraph]);

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
              <TrendingUp className={cn('w-5 h-5', getSubjectColorClass('text'))} />
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
            กราฟ
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Graph Canvas */}
        <div
          className={cn(
            'relative rounded-lg border-2 overflow-hidden',
            getSubjectColorClass('border'),
          )}
          style={{ height: graphHeight }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Graph Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={() => handleZoom(0.8)}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={() => handleZoom(1.25)}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={handleResetView}
            >
              <Crosshair className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Function List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">ฟังก์ชัน:</p>
          <div className="flex flex-wrap gap-2">
            {functions.map((func) => (
              <Badge
                key={func.id}
                variant="outline"
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 transition-opacity',
                  !func.visible && 'opacity-50',
                )}
                style={{ borderColor: func.color }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: func.color }}
                />
                <span className="font-mono text-xs">{func.label || `f(x) = ${func.expression}`}</span>
                {allowEditFunctions && (
                  <>
                    <button
                      onClick={() => toggleFunctionVisibility(func.id)}
                      className="p-0.5 hover:bg-gray-100 rounded"
                    >
                      {func.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </button>
                    {functions.length > 1 && (
                      <button
                        onClick={() => removeFunction(func.id)}
                        className="p-0.5 hover:bg-red-100 rounded text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Add Function Input */}
        {allowAddFunctions && (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                f(x) =
              </span>
              <Input
                value={newExpression}
                onChange={(e) => setNewExpression(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFunction()}
                placeholder="x^2, sin(x), 2*x+1"
                className="pl-14 font-mono"
                disabled={disabled}
              />
            </div>
            <Button
              onClick={handleAddFunction}
              disabled={disabled || !newExpression.trim()}
              className="gap-2 bg-kidpen-gold hover:bg-kidpen-gold/90 text-white"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </Button>
          </div>
        )}

        {/* Trace Point Info */}
        {tracePoint && (
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg text-sm',
              getSubjectColorClass('bg'),
            )}
          >
            <Crosshair className={cn('w-4 h-4', getSubjectColorClass('text'))} />
            <span>
              จุดที่เลือก: <code className="font-mono bg-white/50 px-2 py-0.5 rounded">
                ({tracePoint.x.toFixed(3)}, {tracePoint.y.toFixed(3)})
              </code>
            </span>
          </div>
        )}

        {/* Hints */}
        {showHints && (
          <div className="text-xs text-muted-foreground">
            <p>💡 คลิกบนกราฟเพื่อดูค่า • ใช้ปุ่มซูมเพื่อขยาย/ย่อ • รองรับ: x^2, sin(x), cos(x), sqrt(x), log(x)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GraphingWidget;
