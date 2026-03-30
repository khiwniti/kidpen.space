'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  Check,
  X,
  RotateCcw,
  Lightbulb,
  Move,
} from 'lucide-react';
import {
  DragDropProblemProps,
  DragItem,
  DropZone,
  WidgetInteraction,
  WidgetResult,
} from './types';

/**
 * DragDropProblem Widget
 *
 * An interactive drag-and-drop problem component for STEM learning.
 * Students drag items into correct drop zones to demonstrate understanding.
 *
 * Example use cases:
 * - Classifying elements in the periodic table
 * - Sorting mathematical operations
 * - Ordering scientific processes
 * - Matching vocabulary with definitions
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function DragDropProblem({
  id,
  className,
  subject = 'science',
  disabled = false,
  showHints = true,
  title,
  instructions,
  items,
  zones,
  allowMultiple = true,
  showFeedback = true,
  onInteract,
  onComplete,
}: DragDropProblemProps) {
  // Track which items are in which zones
  const [placements, setPlacements] = useState<Record<string, string[]>>(() => {
    // Initialize empty zones
    return zones.reduce(
      (acc, zone) => {
        acc[zone.id] = [];
        return acc;
      },
      {} as Record<string, string[]>,
    );
  });

  // Track unplaced items
  const [unplacedItems, setUnplacedItems] = useState<string[]>(items.map((item) => item.id));

  // Track dragging state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  // Track attempts and feedback
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [startTime] = useState(Date.now());

  // Get item by ID
  const getItem = useCallback(
    (itemId: string) => items.find((item) => item.id === itemId),
    [items],
  );

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
    return colorMap[subject]?.[variant] || colorMap.science[variant];
  };

  // Handle drag start
  const handleDragStart = useCallback(
    (itemId: string) => {
      if (disabled || submitted) return;
      setDraggedItem(itemId);

      const interaction: WidgetInteraction = {
        type: 'drag',
        timestamp: Date.now(),
        data: { action: 'start', itemId },
      };
      onInteract?.(interaction);
    },
    [disabled, submitted, onInteract],
  );

  // Handle drag over zone
  const handleDragOver = useCallback(
    (e: React.DragEvent, zoneId: string) => {
      e.preventDefault();
      if (disabled || submitted) return;
      setDragOverZone(zoneId);
    },
    [disabled, submitted],
  );

  // Handle drop into zone
  const handleDrop = useCallback(
    (e: React.DragEvent, zoneId: string) => {
      e.preventDefault();
      if (disabled || submitted || !draggedItem) return;

      const zone = zones.find((z) => z.id === zoneId);
      const item = getItem(draggedItem);

      // Check if zone accepts this item's category
      if (zone?.acceptCategories && item?.category) {
        if (!zone.acceptCategories.includes(item.category)) {
          setDraggedItem(null);
          setDragOverZone(null);
          return;
        }
      }

      // Remove item from its current location
      setPlacements((prev) => {
        const newPlacements = { ...prev };
        // Remove from all zones
        Object.keys(newPlacements).forEach((key) => {
          newPlacements[key] = newPlacements[key].filter((id) => id !== draggedItem);
        });
        // Add to target zone
        if (allowMultiple || newPlacements[zoneId].length === 0) {
          newPlacements[zoneId] = [...newPlacements[zoneId], draggedItem];
        } else {
          // Move existing item back to unplaced
          if (newPlacements[zoneId].length > 0) {
            setUnplacedItems((prev) => [...prev, newPlacements[zoneId][0]]);
          }
          newPlacements[zoneId] = [draggedItem];
        }
        return newPlacements;
      });

      // Remove from unplaced items
      setUnplacedItems((prev) => prev.filter((id) => id !== draggedItem));

      // Track interaction
      const interaction: WidgetInteraction = {
        type: 'drag',
        timestamp: Date.now(),
        data: { action: 'drop', itemId: draggedItem, zoneId },
      };
      onInteract?.(interaction);

      setDraggedItem(null);
      setDragOverZone(null);
    },
    [disabled, submitted, draggedItem, zones, getItem, allowMultiple, onInteract],
  );

  // Handle item removal from zone
  const handleRemoveFromZone = useCallback(
    (itemId: string, zoneId: string) => {
      if (disabled || submitted) return;

      setPlacements((prev) => ({
        ...prev,
        [zoneId]: prev[zoneId].filter((id) => id !== itemId),
      }));
      setUnplacedItems((prev) => [...prev, itemId]);
    },
    [disabled, submitted],
  );

  // Check answers
  const checkAnswers = useCallback(() => {
    setAttempts((prev) => prev + 1);
    setSubmitted(true);

    const newFeedback: Record<string, 'correct' | 'incorrect' | null> = {};
    let allCorrect = true;
    let correctCount = 0;

    zones.forEach((zone) => {
      const placedItems = placements[zone.id];
      const correctItems = zone.correctItems || [];

      // Check each placed item
      placedItems.forEach((itemId) => {
        if (correctItems.includes(itemId)) {
          newFeedback[itemId] = 'correct';
          correctCount++;
        } else {
          newFeedback[itemId] = 'incorrect';
          allCorrect = false;
        }
      });

      // Check if required items are missing
      correctItems.forEach((correctId) => {
        if (!placedItems.includes(correctId)) {
          allCorrect = false;
        }
      });
    });

    setFeedback(newFeedback);

    // Report completion
    const result: WidgetResult = {
      success: allCorrect,
      score: Math.round((correctCount / items.length) * 100),
      attempts,
      timeSpent: Date.now() - startTime,
      data: { placements, correctCount, totalItems: items.length },
    };
    onComplete?.(result);
  }, [zones, placements, items.length, attempts, startTime, onComplete]);

  // Reset the problem
  const handleReset = useCallback(() => {
    setPlacements(
      zones.reduce(
        (acc, zone) => {
          acc[zone.id] = [];
          return acc;
        },
        {} as Record<string, string[]>,
      ),
    );
    setUnplacedItems(items.map((item) => item.id));
    setFeedback({});
    setSubmitted(false);
  }, [zones, items]);

  // Check if all items are placed
  const allPlaced = unplacedItems.length === 0;

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
              <Move className={cn('w-5 h-5', getSubjectColorClass('text'))} />
              {title}
            </CardTitle>
            {instructions && (
              <CardDescription className="text-sm text-muted-foreground">
                {instructions}
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
            {items.length - unplacedItems.length}/{items.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Unplaced Items Pool */}
        <div
          className={cn(
            'p-4 rounded-xl border-2 border-dashed min-h-[80px]',
            'bg-muted/30',
            unplacedItems.length === 0 && 'border-muted',
          )}
        >
          <p className="text-xs text-muted-foreground mb-3 font-medium">รายการที่ยังไม่ได้จัดวาง:</p>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map((itemId) => {
              const item = getItem(itemId);
              if (!item) return null;

              return (
                <div
                  key={item.id}
                  draggable={!disabled && !submitted}
                  onDragStart={() => handleDragStart(item.id)}
                  className={cn(
                    'px-3 py-2 rounded-lg border-2 cursor-grab active:cursor-grabbing',
                    'flex items-center gap-2 transition-all duration-200',
                    'bg-white dark:bg-gray-900 shadow-sm',
                    draggedItem === item.id && 'opacity-50 scale-95',
                    !disabled && !submitted && 'hover:shadow-md hover:scale-105',
                    getSubjectColorClass('border'),
                  )}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.content}</span>
                </div>
              );
            })}
            {unplacedItems.length === 0 && (
              <p className="text-sm text-muted-foreground italic">ทุกรายการถูกจัดวางแล้ว!</p>
            )}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="grid gap-4 md:grid-cols-2">
          {zones.map((zone) => (
            <div
              key={zone.id}
              onDragOver={(e) => handleDragOver(e, zone.id)}
              onDragLeave={() => setDragOverZone(null)}
              onDrop={(e) => handleDrop(e, zone.id)}
              className={cn(
                'p-4 rounded-xl border-2 min-h-[120px] transition-all duration-200',
                dragOverZone === zone.id && !disabled && !submitted
                  ? cn(getSubjectColorClass('bg'), getSubjectColorClass('border'), 'scale-[1.02]')
                  : 'border-dashed border-muted-foreground/30 bg-muted/20',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium mb-3',
                  dragOverZone === zone.id ? getSubjectColorClass('text') : 'text-muted-foreground',
                )}
              >
                {zone.label}
              </p>

              <div className="flex flex-wrap gap-2">
                {placements[zone.id].map((itemId) => {
                  const item = getItem(itemId);
                  if (!item) return null;

                  const itemFeedback = feedback[itemId];

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'px-3 py-2 rounded-lg border-2 flex items-center gap-2',
                        'transition-all duration-200',
                        submitted && itemFeedback === 'correct' && 'bg-emerald-100 border-emerald-500 dark:bg-emerald-900/30',
                        submitted && itemFeedback === 'incorrect' && 'bg-red-100 border-red-500 dark:bg-red-900/30',
                        !submitted && cn('bg-white dark:bg-gray-900', getSubjectColorClass('border')),
                      )}
                    >
                      <span className="text-sm font-medium">{item.content}</span>
                      {submitted && showFeedback && itemFeedback === 'correct' && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                      {submitted && showFeedback && itemFeedback === 'incorrect' && (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      {!submitted && (
                        <button
                          onClick={() => handleRemoveFromZone(item.id, zone.id)}
                          className="ml-1 p-0.5 rounded hover:bg-muted"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled || unplacedItems.length === items.length}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            เริ่มใหม่
          </Button>

          <Button
            onClick={checkAnswers}
            disabled={disabled || !allPlaced || submitted}
            className={cn(
              'gap-2',
              'bg-kidpen-gold hover:bg-kidpen-gold/90 text-white shadow-kidpen',
            )}
          >
            <Check className="w-4 h-4" />
            ตรวจคำตอบ
          </Button>
        </div>

        {/* Hint Section */}
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
              ลากและวางแต่ละรายการลงในช่องที่ถูกต้อง - ถ้าทำผิดก็ลองใหม่ได้!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DragDropProblem;
