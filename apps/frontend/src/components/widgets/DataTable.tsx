'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Check,
  RotateCcw,
  Lightbulb,
  Table2,
  Plus,
  Trash2,
  Calculator,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Data table specific types
export interface DataColumn {
  id: string;
  header: string;
  type: 'number' | 'text' | 'computed';
  /** For computed columns, the formula to apply */
  formula?: (row: Record<string, number | string>) => number | string;
  /** Whether column is editable */
  editable?: boolean;
  /** Column width */
  width?: 'narrow' | 'normal' | 'wide';
}

export interface DataRow {
  id: string;
  values: Record<string, number | string>;
}

export interface DataTableStats {
  sum?: boolean;
  mean?: boolean;
  median?: boolean;
  mode?: boolean;
  min?: boolean;
  max?: boolean;
  range?: boolean;
  count?: boolean;
}

export interface DataTableProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description/instructions */
  description?: string;
  /** Column definitions */
  columns: DataColumn[];
  /** Initial data rows */
  initialData?: DataRow[];
  /** Whether students can add rows */
  allowAddRows?: boolean;
  /** Whether students can delete rows */
  allowDeleteRows?: boolean;
  /** Statistics to compute and display */
  showStats?: DataTableStats;
  /** Expected answer (for validation) */
  expectedAnswer?: {
    statistic: keyof DataTableStats;
    column: string;
    value: number;
    tolerance?: number;
  };
}

/**
 * DataTable Widget
 *
 * Interactive data table for statistics and data entry exercises.
 * Students can enter data and see computed statistics.
 *
 * Example use cases:
 * - Calculate mean, median, mode
 * - Data analysis exercises
 * - Scientific data recording
 * - Statistics visualization
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function DataTable({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  description,
  columns,
  initialData = [],
  allowAddRows = true,
  allowDeleteRows = true,
  showStats = { sum: true, mean: true, median: true, min: true, max: true },
  expectedAnswer,
  onInteract,
  onComplete,
}: DataTableProps) {
  const [data, setData] = useState<DataRow[]>(initialData);
  const [submitted, setSubmitted] = useState(false);
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

  // Calculate statistics for a column
  const calculateStats = useCallback(
    (columnId: string) => {
      const numericValues = data
        .map((row) => {
          const val = row.values[columnId];
          return typeof val === 'number' ? val : parseFloat(val as string);
        })
        .filter((v) => !isNaN(v));

      if (numericValues.length === 0) {
        return { sum: 0, mean: 0, median: 0, mode: 0, min: 0, max: 0, range: 0, count: 0 };
      }

      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / numericValues.length;

      // Median
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

      // Mode
      const frequency: Record<number, number> = {};
      numericValues.forEach((v) => {
        frequency[v] = (frequency[v] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      const mode = parseFloat(
        Object.keys(frequency).find((k) => frequency[parseFloat(k)] === maxFreq) || '0',
      );

      return {
        sum: Math.round(sum * 100) / 100,
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        mode,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        range: Math.max(...numericValues) - Math.min(...numericValues),
        count: numericValues.length,
      };
    },
    [data],
  );

  // Handle cell value change
  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: string) => {
      if (disabled || submitted) return;

      setData((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;
          const column = columns.find((c) => c.id === columnId);
          const parsedValue = column?.type === 'number' ? parseFloat(value) || 0 : value;
          return {
            ...row,
            values: { ...row.values, [columnId]: parsedValue },
          };
        }),
      );

      const interaction: WidgetInteraction = {
        type: 'input',
        timestamp: Date.now(),
        data: { rowId, columnId, value },
      };
      onInteract?.(interaction);
    },
    [disabled, submitted, columns, onInteract],
  );

  // Add new row
  const handleAddRow = useCallback(() => {
    if (disabled || submitted || !allowAddRows) return;

    const newRow: DataRow = {
      id: `row-${Date.now()}`,
      values: columns.reduce(
        (acc, col) => {
          acc[col.id] = col.type === 'number' ? 0 : '';
          return acc;
        },
        {} as Record<string, number | string>,
      ),
    };
    setData((prev) => [...prev, newRow]);
  }, [disabled, submitted, allowAddRows, columns]);

  // Delete row
  const handleDeleteRow = useCallback(
    (rowId: string) => {
      if (disabled || submitted || !allowDeleteRows) return;
      setData((prev) => prev.filter((row) => row.id !== rowId));
    },
    [disabled, submitted, allowDeleteRows],
  );

  // Reset
  const handleReset = useCallback(() => {
    setData(initialData);
    setSubmitted(false);
  }, [initialData]);

  // Check answer
  const handleSubmit = useCallback(() => {
    setAttempts((prev) => prev + 1);
    setSubmitted(true);

    let isCorrect = true;
    if (expectedAnswer) {
      const stats = calculateStats(expectedAnswer.column);
      const actualValue = stats[expectedAnswer.statistic] as number;
      const tolerance = expectedAnswer.tolerance ?? 0.01;
      isCorrect = Math.abs(actualValue - expectedAnswer.value) <= tolerance;
    }

    const result: WidgetResult = {
      success: isCorrect,
      score: isCorrect ? 100 : 0,
      attempts: attempts + 1,
      timeSpent: Date.now() - startTime,
      data: { data, stats: columns.map((col) => ({ column: col.id, stats: calculateStats(col.id) })) },
    };
    onComplete?.(result);
  }, [expectedAnswer, calculateStats, data, columns, attempts, startTime, onComplete]);

  // Get column width class
  const getWidthClass = (width?: 'narrow' | 'normal' | 'wide') => {
    return {
      narrow: 'w-20',
      normal: 'w-32',
      wide: 'w-48',
    }[width || 'normal'];
  };

  // Numeric columns for stats
  const numericColumns = columns.filter((c) => c.type === 'number');

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
              <Table2 className={cn('w-5 h-5', getSubjectColorClass('text'))} />
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
              'font-mono text-xs px-3 py-1',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
              getSubjectColorClass('border'),
            )}
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            {data.length} แถว
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border-2 border-muted">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn('border-b-2', getSubjectColorClass('bg'))}>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className={cn(
                      'px-3 py-2 text-left font-semibold',
                      getWidthClass(col.width),
                      getSubjectColorClass('text'),
                    )}
                  >
                    {col.header}
                  </th>
                ))}
                {allowDeleteRows && !submitted && (
                  <th className="w-12 px-2 py-2"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b hover:bg-muted/30',
                    rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-muted/10',
                  )}
                >
                  {columns.map((col) => {
                    const value = col.type === 'computed' && col.formula
                      ? col.formula(row.values)
                      : row.values[col.id];

                    return (
                      <td key={col.id} className={cn('px-3 py-2', getWidthClass(col.width))}>
                        {col.editable !== false && col.type !== 'computed' && !submitted ? (
                          <Input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                            disabled={disabled}
                            className="h-8 text-center"
                          />
                        ) : (
                          <span className="block text-center font-mono">
                            {typeof value === 'number' ? Math.round(value * 100) / 100 : value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {allowDeleteRows && !submitted && (
                    <td className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRow(row.id)}
                        disabled={disabled || data.length <= 1}
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        {allowAddRows && !submitted && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            disabled={disabled}
            className="w-full gap-2 border-dashed"
          >
            <Plus className="w-4 h-4" />
            เพิ่มแถว
          </Button>
        )}

        {/* Statistics Display */}
        {Object.values(showStats).some(Boolean) && numericColumns.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calculator className="w-4 h-4" />
              สถิติ
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {numericColumns.map((col) => {
                const stats = calculateStats(col.id);

                return (
                  <div
                    key={col.id}
                    className={cn(
                      'p-3 rounded-lg border-2',
                      getSubjectColorClass('border'),
                      getSubjectColorClass('bg'),
                    )}
                  >
                    <h4 className={cn('text-sm font-semibold mb-2', getSubjectColorClass('text'))}>
                      {col.header}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {showStats.count && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">จำนวน:</span>
                          <span className="font-mono font-semibold">{stats.count}</span>
                        </div>
                      )}
                      {showStats.sum && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ผลรวม:</span>
                          <span className="font-mono font-semibold">{stats.sum}</span>
                        </div>
                      )}
                      {showStats.mean && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ค่าเฉลี่ย:</span>
                          <span className="font-mono font-semibold">{stats.mean}</span>
                        </div>
                      )}
                      {showStats.median && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">มัธยฐาน:</span>
                          <span className="font-mono font-semibold">{stats.median}</span>
                        </div>
                      )}
                      {showStats.mode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ฐานนิยม:</span>
                          <span className="font-mono font-semibold">{stats.mode}</span>
                        </div>
                      )}
                      {showStats.min && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ต่ำสุด:</span>
                          <span className="font-mono font-semibold">{stats.min}</span>
                        </div>
                      )}
                      {showStats.max && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">สูงสุด:</span>
                          <span className="font-mono font-semibold">{stats.max}</span>
                        </div>
                      )}
                      {showStats.range && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">พิสัย:</span>
                          <span className="font-mono font-semibold">{stats.range}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            เริ่มใหม่
          </Button>

          {expectedAnswer && !submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={disabled || data.length === 0}
              className={cn(
                'gap-2',
                'bg-kidpen-gold hover:bg-kidpen-gold/90 text-white shadow-kidpen',
              )}
            >
              <Check className="w-4 h-4" />
              ตรวจคำตอบ
            </Button>
          ) : submitted ? (
            <Badge
              className={cn(
                'gap-1 px-3 py-1.5',
                (() => {
                  if (!expectedAnswer) return 'bg-emerald-500';
                  const stats = calculateStats(expectedAnswer.column);
                  const actualValue = stats[expectedAnswer.statistic] as number;
                  const tolerance = expectedAnswer.tolerance ?? 0.01;
                  return Math.abs(actualValue - expectedAnswer.value) <= tolerance
                    ? 'bg-emerald-500'
                    : 'bg-amber-500';
                })(),
                'text-white',
              )}
            >
              {(() => {
                if (!expectedAnswer) return '✓ บันทึกแล้ว';
                const stats = calculateStats(expectedAnswer.column);
                const actualValue = stats[expectedAnswer.statistic] as number;
                const tolerance = expectedAnswer.tolerance ?? 0.01;
                return Math.abs(actualValue - expectedAnswer.value) <= tolerance
                  ? '✓ ถูกต้อง!'
                  : '✗ ลองอีกครั้ง';
              })()}
            </Badge>
          ) : null}
        </div>

        {/* Hint */}
        {showHints && !submitted && (
          <div
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-sm',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
            )}
          >
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              กรอกข้อมูลในตาราง แล้วดูค่าสถิติที่คำนวณอัตโนมัติด้านล่าง
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DataTable;
