'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Calculator, Info } from 'lucide-react';
import {
  SliderExplorerProps,
  SliderResult,
  SUBJECT_COLORS,
  WidgetInteraction,
} from './types';

/**
 * SliderExplorer Widget
 *
 * An interactive slider-based exploration tool for STEM concepts.
 * Students can manipulate parameters to see real-time results.
 *
 * Example use cases:
 * - Exploring area formulas (width × height)
 * - Understanding physics equations (F = ma)
 * - Visualizing mathematical relationships
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function SliderExplorer({
  id,
  className,
  subject = 'math',
  disabled = false,
  showHints = true,
  title,
  description,
  sliders,
  compute,
  showFormula = false,
  formula,
  onInteract,
  onComplete,
}: SliderExplorerProps) {
  // Initialize slider values from defaults
  const initialValues = useMemo(() => {
    return sliders.reduce(
      (acc, slider) => {
        acc[slider.label] = slider.defaultValue;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [sliders]);

  const [values, setValues] = useState<Record<string, number>>(initialValues);
  const [interactionCount, setInteractionCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Compute the result based on current values
  const result: SliderResult = useMemo(() => {
    return compute(values);
  }, [compute, values]);

  // Handle slider value change
  const handleSliderChange = useCallback(
    (label: string, newValue: number[]) => {
      const value = newValue[0];
      setValues((prev) => ({ ...prev, [label]: value }));
      setInteractionCount((prev) => prev + 1);

      // Track interaction
      const interaction: WidgetInteraction = {
        type: 'slide',
        timestamp: Date.now(),
        data: { parameter: label, value, allValues: { ...values, [label]: value } },
      };
      onInteract?.(interaction);
    },
    [values, onInteract],
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
    return colorMap[subject]?.[variant] || colorMap.math[variant];
  };

  // Get indicator color
  const getIndicatorClass = (indicator?: string) => {
    switch (indicator) {
      case 'success':
        return 'bg-emerald-500 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return `${getSubjectColorClass('bg')} ${getSubjectColorClass('text')}`;
    }
  };

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
      {/* Decorative corner accent */}
      <div
        className={cn(
          'absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-20',
          getSubjectColorClass('bg'),
        )}
      />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-outfit font-semibold flex items-center gap-2">
              <Calculator className={cn('w-5 h-5', getSubjectColorClass('text'))} />
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>

          {showFormula && formula && (
            <Badge
              variant="outline"
              className={cn(
                'font-mono text-xs px-3 py-1',
                getSubjectColorClass('bg'),
                getSubjectColorClass('text'),
                getSubjectColorClass('border'),
              )}
            >
              {formula}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sliders */}
        <div className="space-y-5">
          {sliders.map((slider) => (
            <div key={slider.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  {slider.label}
                  {slider.description && showHints && (
                    <span className="group relative">
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {slider.description}
                      </span>
                    </span>
                  )}
                </label>
                <span
                  className={cn(
                    'text-sm font-mono font-semibold px-2 py-0.5 rounded-md',
                    getSubjectColorClass('bg'),
                    getSubjectColorClass('text'),
                  )}
                >
                  {values[slider.label]}
                  {slider.unit && <span className="ml-0.5 text-xs opacity-70">{slider.unit}</span>}
                </span>
              </div>

              <Slider
                value={[values[slider.label]]}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                onValueChange={(value) => handleSliderChange(slider.label, value)}
                disabled={disabled}
                className={cn(
                  'cursor-pointer',
                  '[&_[role=slider]]:bg-kidpen-gold [&_[role=slider]]:border-kidpen-gold',
                  '[&_[role=slider]]:shadow-kidpen',
                )}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {slider.min}
                  {slider.unit}
                </span>
                <span>
                  {slider.max}
                  {slider.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Result Display */}
        <div
          className={cn(
            'relative p-4 rounded-xl border-2',
            'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950',
            getSubjectColorClass('border'),
          )}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{result.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-outfit tabular-nums">
                  {typeof result.value === 'number' ? result.value.toLocaleString() : result.value}
                </span>
                {result.unit && (
                  <span className="text-lg text-muted-foreground">{result.unit}</span>
                )}
              </div>
            </div>

            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                getIndicatorClass(result.indicator),
              )}
            >
              <Lightbulb className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Hint Section */}
        {showHints && (
          <div
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-sm',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
            )}
          >
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              ลองเปลี่ยนค่าต่างๆ แล้วสังเกตผลลัพธ์ที่เปลี่ยนไป - การทดลองจะช่วยให้เข้าใจแนวคิดได้ดีขึ้น!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export default for convenience
export default SliderExplorer;
