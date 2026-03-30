'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  RotateCcw,
  Atom,
  Settings,
  Zap,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Physics object types
export interface PhysicsObject {
  id: string;
  type: 'circle' | 'rectangle' | 'ground';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  mass: number;
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  isStatic?: boolean;
  label?: string;
  restitution?: number; // Bounciness (0-1)
  friction?: number;
}

// Physics simulation props
export interface PhysicsSimulationProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description */
  description?: string;
  /** Initial objects */
  initialObjects: PhysicsObject[];
  /** Canvas width */
  canvasWidth?: number;
  /** Canvas height */
  canvasHeight?: number;
  /** Gravity (m/s²) */
  gravity?: number;
  /** Allow adjusting gravity */
  allowGravityControl?: boolean;
  /** Show velocity vectors */
  showVelocityVectors?: boolean;
  /** Show force vectors */
  showForceVectors?: boolean;
  /** Time scale (1 = real-time) */
  timeScale?: number;
  /** Allow adding objects */
  allowAddObjects?: boolean;
  /** Show object labels */
  showLabels?: boolean;
  /** Expected outcome for validation */
  expectedOutcome?: {
    objectId: string;
    property: 'position' | 'velocity';
    value: { x: number; y: number };
    tolerance: number;
  };
}

// Physics constants
const PIXELS_PER_METER = 50;

/**
 * PhysicsSimulation Widget
 *
 * Interactive 2D physics simulation for mechanics demonstrations.
 * Supports gravity, collisions, and force visualization.
 *
 * Note: For production, integrate with Matter.js for advanced physics.
 * This is a simple implementation for basic demonstrations.
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function PhysicsSimulation({
  id,
  className,
  subject = 'physics',
  disabled = false,
  showHints = true,
  title,
  description,
  initialObjects,
  canvasWidth = 600,
  canvasHeight = 400,
  gravity = 9.8,
  allowGravityControl = true,
  showVelocityVectors = true,
  showForceVectors = false,
  timeScale = 1,
  allowAddObjects = false,
  showLabels = true,
  expectedOutcome,
  onInteract,
  onComplete,
}: PhysicsSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const [objects, setObjects] = useState<PhysicsObject[]>(initialObjects);
  const [isRunning, setIsRunning] = useState(false);
  const [currentGravity, setCurrentGravity] = useState(gravity);
  const [currentTimeScale, setCurrentTimeScale] = useState(timeScale);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [startTime] = useState(Date.now());

  // Get subject color classes
  const getSubjectColorClass = (variant: 'bg' | 'text' | 'border' | 'ring') => {
    const colorMap: Record<string, Record<string, string>> = {
      physics: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        ring: 'ring-orange-500/20',
      },
      science: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        ring: 'ring-emerald-500/20',
      },
    };
    return colorMap[subject]?.[variant] || colorMap.physics[variant];
  };

  // Physics update step
  const updatePhysics = useCallback((dt: number) => {
    setObjects((prevObjects) => {
      return prevObjects.map((obj) => {
        if (obj.isStatic) return obj;

        // Apply gravity
        const gravityForce = currentGravity * PIXELS_PER_METER * dt;

        // Update velocity
        const newVelocity = {
          x: obj.velocity.x + obj.acceleration.x * dt,
          y: obj.velocity.y + gravityForce + obj.acceleration.y * dt,
        };

        // Update position
        let newX = obj.x + newVelocity.x * dt * PIXELS_PER_METER;
        let newY = obj.y + newVelocity.y * dt * PIXELS_PER_METER;

        // Ground collision
        const objBottom = obj.type === 'circle'
          ? newY + (obj.radius || 20)
          : newY + (obj.height || 40);

        const groundY = canvasHeight - 40; // Ground at bottom

        if (objBottom >= groundY) {
          newY = groundY - (obj.type === 'circle' ? (obj.radius || 20) : (obj.height || 40));
          const restitution = obj.restitution ?? 0.6;
          newVelocity.y = -newVelocity.y * restitution;

          // Apply friction
          const friction = obj.friction ?? 0.1;
          newVelocity.x *= (1 - friction);

          // Stop if velocity is very small
          if (Math.abs(newVelocity.y) < 0.5) {
            newVelocity.y = 0;
          }
        }

        // Wall collisions
        const objLeft = obj.type === 'circle' ? newX - (obj.radius || 20) : newX;
        const objRight = obj.type === 'circle' ? newX + (obj.radius || 20) : newX + (obj.width || 40);

        if (objLeft <= 0) {
          newX = obj.type === 'circle' ? (obj.radius || 20) : 0;
          newVelocity.x = -newVelocity.x * (obj.restitution ?? 0.6);
        }
        if (objRight >= canvasWidth) {
          newX = canvasWidth - (obj.type === 'circle' ? (obj.radius || 20) : (obj.width || 40));
          newVelocity.x = -newVelocity.x * (obj.restitution ?? 0.6);
        }

        return {
          ...obj,
          x: newX,
          y: newY,
          velocity: newVelocity,
        };
      });
    });
  }, [currentGravity, canvasWidth, canvasHeight]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const dt = ((timestamp - lastTimeRef.current) / 1000) * currentTimeScale;
    lastTimeRef.current = timestamp;

    if (dt > 0 && dt < 0.1) { // Cap dt to prevent huge jumps
      updatePhysics(dt);
      setElapsedTime((prev) => prev + dt);
    }

    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, currentTimeScale, updatePhysics]);

  // Start/stop animation
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#FFFCF7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = '#6B5344';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 5);

    // Draw grid (light)
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += PIXELS_PER_METER) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height - 40);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height - 40; y += PIXELS_PER_METER) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw objects
    objects.forEach((obj) => {
      if (obj.type === 'circle') {
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius || 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw velocity vector
        if (showVelocityVectors && !obj.isStatic) {
          const vScale = 10;
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x + obj.velocity.x * vScale, obj.y + obj.velocity.y * vScale);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(obj.velocity.y, obj.velocity.x);
          ctx.beginPath();
          ctx.moveTo(
            obj.x + obj.velocity.x * vScale,
            obj.y + obj.velocity.y * vScale
          );
          ctx.lineTo(
            obj.x + obj.velocity.x * vScale - 8 * Math.cos(angle - Math.PI / 6),
            obj.y + obj.velocity.y * vScale - 8 * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            obj.x + obj.velocity.x * vScale - 8 * Math.cos(angle + Math.PI / 6),
            obj.y + obj.velocity.y * vScale - 8 * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = '#2563EB';
          ctx.fill();
        }

        // Draw force vector (gravity)
        if (showForceVectors && !obj.isStatic) {
          const fScale = obj.mass * currentGravity * 0.3;
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x, obj.y + fScale);
          ctx.stroke();
        }
      } else if (obj.type === 'rectangle') {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width || 40, obj.height || 40);
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.width || 40, obj.height || 40);
      }

      // Draw label
      if (showLabels && obj.label) {
        ctx.fillStyle = '#374151';
        ctx.font = '12px "IBM Plex Sans Thai", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          obj.label,
          obj.type === 'circle' ? obj.x : obj.x + (obj.width || 40) / 2,
          obj.type === 'circle' ? obj.y - (obj.radius || 20) - 5 : obj.y - 5
        );
      }
    });

    // Draw legend
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px "IBM Plex Sans Thai", sans-serif';
    ctx.textAlign = 'left';
    if (showVelocityVectors) {
      ctx.fillStyle = '#2563EB';
      ctx.fillText('→ ความเร็ว', 10, 20);
    }
    if (showForceVectors) {
      ctx.fillStyle = '#EF4444';
      ctx.fillText('→ แรง (mg)', 10, 35);
    }

    // Draw time
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'right';
    ctx.fillText(`t = ${elapsedTime.toFixed(2)} วินาที`, canvas.width - 10, 20);
  }, [objects, showVelocityVectors, showForceVectors, showLabels, currentGravity, elapsedTime]);

  // Redraw on changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (disabled) return;

    setIsRunning((prev) => !prev);

    const interaction: WidgetInteraction = {
      type: 'click',
      timestamp: Date.now(),
      data: { action: isRunning ? 'pause' : 'play' },
    };
    onInteract?.(interaction);
  }, [disabled, isRunning, onInteract]);

  // Handle reset
  const handleReset = useCallback(() => {
    setObjects(initialObjects.map(obj => ({ ...obj })));
    setIsRunning(false);
    setElapsedTime(0);
    lastTimeRef.current = 0;
  }, [initialObjects]);

  // Handle gravity change
  const handleGravityChange = useCallback((value: number[]) => {
    setCurrentGravity(value[0]);
  }, []);

  // Handle time scale change
  const handleTimeScaleChange = useCallback((value: number[]) => {
    setCurrentTimeScale(value[0]);
  }, []);

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
              <Atom className={cn('w-5 h-5', getSubjectColorClass('text'))} />
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
            ฟิสิกส์
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Simulation Canvas */}
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
            className="block"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handlePlayPause}
              disabled={disabled}
              className={cn(
                'gap-2',
                'bg-kidpen-gold hover:bg-kidpen-gold/90 text-white shadow-kidpen',
              )}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'หยุด' : 'เริ่ม'}
            </Button>

            <Button variant="outline" onClick={handleReset} disabled={disabled} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              รีเซ็ต
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            className={cn(
              'p-4 rounded-lg space-y-4',
              getSubjectColorClass('bg'),
            )}
          >
            {allowGravityControl && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>แรงโน้มถ่วง (g)</span>
                  <span className="font-mono">{currentGravity.toFixed(1)} m/s²</span>
                </div>
                <Slider
                  value={[currentGravity]}
                  onValueChange={handleGravityChange}
                  min={0}
                  max={20}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (ไร้น้ำหนัก)</span>
                  <span>9.8 (โลก)</span>
                  <span>20</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ความเร็วการจำลอง</span>
                <span className="font-mono">{currentTimeScale.toFixed(1)}x</span>
              </div>
              <Slider
                value={[currentTimeScale]}
                onValueChange={handleTimeScaleChange}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Object Info */}
        <div className="flex flex-wrap gap-2">
          {objects.filter(o => !o.isStatic).map((obj) => (
            <Badge
              key={obj.id}
              variant="outline"
              className="flex items-center gap-2 px-3 py-1.5"
              style={{ borderColor: obj.color }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: obj.color }}
              />
              <span className="text-xs">
                {obj.label || obj.id}: v={Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2).toFixed(1)} m/s
              </span>
            </Badge>
          ))}
        </div>

        {/* Hints */}
        {showHints && (
          <div className="text-xs text-muted-foreground">
            <p>
              💡 กดเริ่มเพื่อรันการจำลอง • ปรับแรงโน้มถ่วงเพื่อดูผลกระทบ • ลูกศรสีน้ำเงินแสดงความเร็ว
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PhysicsSimulation;
