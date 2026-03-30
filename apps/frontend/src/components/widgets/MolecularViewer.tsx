'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Atom,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Layers,
  Info,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Atom definition
export interface MoleculeAtom {
  id: string;
  element: string;
  x: number;
  y: number;
  z: number;
  color?: string;
  radius?: number;
  label?: string;
}

// Bond definition
export interface MoleculeBond {
  id: string;
  atom1: string;
  atom2: string;
  order: 1 | 2 | 3; // Single, double, triple
}

// Molecule definition
export interface Molecule {
  name: string;
  formula: string;
  atoms: MoleculeAtom[];
  bonds: MoleculeBond[];
  description?: string;
}

// Element properties
export interface ElementInfo {
  symbol: string;
  name: string;
  nameThai: string;
  atomicNumber: number;
  color: string;
  radius: number;
}

// Molecular viewer props
export interface MolecularViewerProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description */
  description?: string;
  /** Molecule to display */
  molecule: Molecule;
  /** Canvas width */
  canvasWidth?: number;
  /** Canvas height */
  canvasHeight?: number;
  /** Allow rotation */
  allowRotation?: boolean;
  /** Allow zoom */
  allowZoom?: boolean;
  /** Show atom labels */
  showLabels?: boolean;
  /** Show element info on hover */
  showElementInfo?: boolean;
  /** Display mode */
  displayMode?: 'ball-stick' | 'space-filling' | 'wireframe';
  /** Background color */
  backgroundColor?: string;
}

// Element data
const ELEMENTS: Record<string, ElementInfo> = {
  H: { symbol: 'H', name: 'Hydrogen', nameThai: 'ไฮโดรเจน', atomicNumber: 1, color: '#FFFFFF', radius: 25 },
  C: { symbol: 'C', name: 'Carbon', nameThai: 'คาร์บอน', atomicNumber: 6, color: '#333333', radius: 40 },
  N: { symbol: 'N', name: 'Nitrogen', nameThai: 'ไนโตรเจน', atomicNumber: 7, color: '#3050F8', radius: 38 },
  O: { symbol: 'O', name: 'Oxygen', nameThai: 'ออกซิเจน', atomicNumber: 8, color: '#FF0D0D', radius: 36 },
  S: { symbol: 'S', name: 'Sulfur', nameThai: 'กำมะถัน', atomicNumber: 16, color: '#FFFF30', radius: 45 },
  P: { symbol: 'P', name: 'Phosphorus', nameThai: 'ฟอสฟอรัส', atomicNumber: 15, color: '#FF8000', radius: 44 },
  Cl: { symbol: 'Cl', name: 'Chlorine', nameThai: 'คลอรีน', atomicNumber: 17, color: '#1FF01F', radius: 42 },
  F: { symbol: 'F', name: 'Fluorine', nameThai: 'ฟลูออรีน', atomicNumber: 9, color: '#90E050', radius: 30 },
  Br: { symbol: 'Br', name: 'Bromine', nameThai: 'โบรมีน', atomicNumber: 35, color: '#A62929', radius: 47 },
  I: { symbol: 'I', name: 'Iodine', nameThai: 'ไอโอดีน', atomicNumber: 53, color: '#940094', radius: 53 },
  Na: { symbol: 'Na', name: 'Sodium', nameThai: 'โซเดียม', atomicNumber: 11, color: '#AB5CF2', radius: 50 },
  K: { symbol: 'K', name: 'Potassium', nameThai: 'โพแทสเซียม', atomicNumber: 19, color: '#8F40D4', radius: 55 },
  Ca: { symbol: 'Ca', name: 'Calcium', nameThai: 'แคลเซียม', atomicNumber: 20, color: '#3DFF00', radius: 52 },
  Fe: { symbol: 'Fe', name: 'Iron', nameThai: 'เหล็ก', atomicNumber: 26, color: '#E06633', radius: 48 },
  Mg: { symbol: 'Mg', name: 'Magnesium', nameThai: 'แมกนีเซียม', atomicNumber: 12, color: '#8AFF00', radius: 48 },
};

// Predefined molecules
export const MOLECULES: Record<string, Molecule> = {
  water: {
    name: 'Water',
    formula: 'H₂O',
    description: 'โมเลกุลน้ำประกอบด้วยออกซิเจน 1 อะตอมและไฮโดรเจน 2 อะตอม',
    atoms: [
      { id: 'O1', element: 'O', x: 0, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: -0.8, y: 0.6, z: 0 },
      { id: 'H2', element: 'H', x: 0.8, y: 0.6, z: 0 },
    ],
    bonds: [
      { id: 'b1', atom1: 'O1', atom2: 'H1', order: 1 },
      { id: 'b2', atom1: 'O1', atom2: 'H2', order: 1 },
    ],
  },
  methane: {
    name: 'Methane',
    formula: 'CH₄',
    description: 'มีเทนเป็นสารประกอบไฮโดรคาร์บอนที่เรียบง่ายที่สุด',
    atoms: [
      { id: 'C1', element: 'C', x: 0, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: 0, y: 1, z: 0 },
      { id: 'H2', element: 'H', x: 0.95, y: -0.33, z: 0 },
      { id: 'H3', element: 'H', x: -0.47, y: -0.33, z: 0.82 },
      { id: 'H4', element: 'H', x: -0.47, y: -0.33, z: -0.82 },
    ],
    bonds: [
      { id: 'b1', atom1: 'C1', atom2: 'H1', order: 1 },
      { id: 'b2', atom1: 'C1', atom2: 'H2', order: 1 },
      { id: 'b3', atom1: 'C1', atom2: 'H3', order: 1 },
      { id: 'b4', atom1: 'C1', atom2: 'H4', order: 1 },
    ],
  },
  co2: {
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    description: 'คาร์บอนไดออกไซด์เป็นก๊าซเรือนกระจกที่สำคัญ',
    atoms: [
      { id: 'C1', element: 'C', x: 0, y: 0, z: 0 },
      { id: 'O1', element: 'O', x: -1.2, y: 0, z: 0 },
      { id: 'O2', element: 'O', x: 1.2, y: 0, z: 0 },
    ],
    bonds: [
      { id: 'b1', atom1: 'C1', atom2: 'O1', order: 2 },
      { id: 'b2', atom1: 'C1', atom2: 'O2', order: 2 },
    ],
  },
  ammonia: {
    name: 'Ammonia',
    formula: 'NH₃',
    description: 'แอมโมเนียเป็นสารประกอบของไนโตรเจนและไฮโดรเจน',
    atoms: [
      { id: 'N1', element: 'N', x: 0, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: 0, y: 0.9, z: 0.3 },
      { id: 'H2', element: 'H', x: -0.78, y: -0.45, z: 0.3 },
      { id: 'H3', element: 'H', x: 0.78, y: -0.45, z: 0.3 },
    ],
    bonds: [
      { id: 'b1', atom1: 'N1', atom2: 'H1', order: 1 },
      { id: 'b2', atom1: 'N1', atom2: 'H2', order: 1 },
      { id: 'b3', atom1: 'N1', atom2: 'H3', order: 1 },
    ],
  },
};

/**
 * MolecularViewer Widget
 *
 * Interactive 3D molecular structure viewer.
 * Supports rotation, zoom, and element information.
 *
 * Note: For production, integrate with Three.js for true 3D rendering.
 * This is a 2.5D canvas-based implementation for basic visualization.
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function MolecularViewer({
  id,
  className,
  subject = 'science',
  disabled = false,
  showHints = true,
  title,
  description,
  molecule,
  canvasWidth = 500,
  canvasHeight = 400,
  allowRotation = true,
  allowZoom = true,
  showLabels = true,
  showElementInfo = true,
  displayMode = 'ball-stick',
  backgroundColor = '#1a1a2e',
  onInteract,
  onComplete,
}: MolecularViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredAtom, setHoveredAtom] = useState<MoleculeAtom | null>(null);
  const [selectedAtom, setSelectedAtom] = useState<MoleculeAtom | null>(null);
  const [currentMode, setCurrentMode] = useState(displayMode);
  const [startTime] = useState(Date.now());

  // Get subject color classes
  const getSubjectColorClass = (variant: 'bg' | 'text' | 'border' | 'ring') => {
    const colorMap: Record<string, Record<string, string>> = {
      science: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        ring: 'ring-emerald-500/20',
      },
    };
    return colorMap[subject]?.[variant] || colorMap.science[variant];
  };

  // 3D to 2D projection
  const project = useCallback(
    (x: number, y: number, z: number): { x: number; y: number; scale: number } => {
      // Rotate around X axis
      let y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
      let z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);

      // Rotate around Y axis
      let x1 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
      z1 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);

      // Rotate around Z axis
      const x2 = x1 * Math.cos(rotation.z) - y1 * Math.sin(rotation.z);
      const y2 = x1 * Math.sin(rotation.z) + y1 * Math.cos(rotation.z);

      // Perspective projection
      const scale = 100 * zoom;
      const perspective = 5;
      const projectedScale = perspective / (perspective + z1);

      return {
        x: canvasWidth / 2 + x2 * scale * projectedScale,
        y: canvasHeight / 2 - y2 * scale * projectedScale,
        scale: projectedScale,
      };
    },
    [rotation, zoom, canvasWidth, canvasHeight],
  );

  // Draw molecule
  const drawMolecule = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort atoms by depth for proper rendering
    const projectedAtoms = molecule.atoms.map((atom) => {
      const proj = project(atom.x, atom.y, atom.z);
      return { ...atom, px: proj.x, py: proj.y, pscale: proj.scale };
    }).sort((a, b) => a.pscale - b.pscale);

    // Draw bonds first
    molecule.bonds.forEach((bond) => {
      const atom1 = molecule.atoms.find((a) => a.id === bond.atom1);
      const atom2 = molecule.atoms.find((a) => a.id === bond.atom2);
      if (!atom1 || !atom2) return;

      const p1 = project(atom1.x, atom1.y, atom1.z);
      const p2 = project(atom2.x, atom2.y, atom2.z);

      ctx.strokeStyle = '#888888';
      ctx.lineWidth = currentMode === 'wireframe' ? 2 : 4 * Math.min(p1.scale, p2.scale);

      if (bond.order === 1) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else if (bond.order === 2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offset = 3;
        const nx = -dy / len * offset;
        const ny = dx / len * offset;

        ctx.beginPath();
        ctx.moveTo(p1.x + nx, p1.y + ny);
        ctx.lineTo(p2.x + nx, p2.y + ny);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p1.x - nx, p1.y - ny);
        ctx.lineTo(p2.x - nx, p2.y - ny);
        ctx.stroke();
      } else if (bond.order === 3) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offset = 4;
        const nx = -dy / len * offset;
        const ny = dx / len * offset;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p1.x + nx, p1.y + ny);
        ctx.lineTo(p2.x + nx, p2.y + ny);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p1.x - nx, p1.y - ny);
        ctx.lineTo(p2.x - nx, p2.y - ny);
        ctx.stroke();
      }
    });

    // Draw atoms
    if (currentMode !== 'wireframe') {
      projectedAtoms.forEach((atom) => {
        const element = ELEMENTS[atom.element] || ELEMENTS.C;
        const baseRadius = currentMode === 'space-filling'
          ? element.radius * 0.8
          : element.radius * 0.5;
        const radius = baseRadius * atom.pscale * zoom;

        // Gradient for 3D effect
        const gradient = ctx.createRadialGradient(
          atom.px - radius * 0.3,
          atom.py - radius * 0.3,
          0,
          atom.px,
          atom.py,
          radius,
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, atom.color || element.color);
        gradient.addColorStop(1, shadeColor(atom.color || element.color, -40));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(atom.px, atom.py, radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight selected/hovered
        if (selectedAtom?.id === atom.id || hoveredAtom?.id === atom.id) {
          ctx.strokeStyle = '#F5A623';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Draw label
        if (showLabels) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(12, 14 * atom.pscale)}px "IBM Plex Sans Thai", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(atom.element, atom.px, atom.py);
        }
      });
    }

    // Draw molecule name
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${molecule.name} (${molecule.formula})`, canvasWidth / 2, 25);
  }, [molecule, project, currentMode, zoom, backgroundColor, showLabels, hoveredAtom, selectedAtom, canvasWidth]);

  // Shade color helper
  function shadeColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }

  // Redraw on changes
  useEffect(() => {
    drawMolecule();
  }, [drawMolecule]);

  // Auto-rotate
  useEffect(() => {
    if (disabled || isDragging) return;

    const interval = setInterval(() => {
      setRotation((prev) => ({
        ...prev,
        y: prev.y + 0.01,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [disabled, isDragging]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!allowRotation || disabled) return;
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  }, [allowRotation, disabled]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Check hover
      let found = false;
      molecule.atoms.forEach((atom) => {
        const proj = project(atom.x, atom.y, atom.z);
        const element = ELEMENTS[atom.element] || ELEMENTS.C;
        const radius = element.radius * 0.5 * proj.scale * zoom;
        const dist = Math.sqrt((mx - proj.x) ** 2 + (my - proj.y) ** 2);
        if (dist < radius) {
          setHoveredAtom(atom);
          found = true;
        }
      });
      if (!found) setHoveredAtom(null);

      // Drag rotation
      if (isDragging && allowRotation) {
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        setRotation((prev) => ({
          x: prev.x + dy * 0.01,
          y: prev.y + dx * 0.01,
          z: prev.z,
        }));
        setLastMouse({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, lastMouse, allowRotation, molecule.atoms, project, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (hoveredAtom) {
      setSelectedAtom(hoveredAtom);
      const interaction: WidgetInteraction = {
        type: 'click',
        timestamp: Date.now(),
        data: { action: 'select_atom', atom: hoveredAtom.element },
      };
      onInteract?.(interaction);
    }
  }, [hoveredAtom, onInteract]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5));
  }, []);

  // Reset view
  const handleReset = useCallback(() => {
    setRotation({ x: 0.3, y: 0, z: 0 });
    setZoom(1);
    setSelectedAtom(null);
  }, []);

  // Cycle display mode
  const cycleMode = useCallback(() => {
    const modes: typeof displayMode[] = ['ball-stick', 'space-filling', 'wireframe'];
    const currentIndex = modes.indexOf(currentMode);
    setCurrentMode(modes[(currentIndex + 1) % modes.length]);
  }, [currentMode]);

  const selectedElement = selectedAtom ? ELEMENTS[selectedAtom.element] : null;

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
            เคมี
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Viewer Canvas */}
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            className="cursor-grab active:cursor-grabbing"
          />

          {/* Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {allowZoom && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={cycleMode}
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Display mode badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {currentMode === 'ball-stick' && 'Ball & Stick'}
              {currentMode === 'space-filling' && 'Space Filling'}
              {currentMode === 'wireframe' && 'Wireframe'}
            </Badge>
          </div>
        </div>

        {/* Element Info */}
        {showElementInfo && selectedElement && (
          <div
            className={cn(
              'p-4 rounded-lg flex items-center gap-4',
              getSubjectColorClass('bg'),
            )}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: selectedElement.color }}
            >
              {selectedElement.symbol}
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {selectedElement.nameThai} ({selectedElement.name})
              </p>
              <p className="text-sm text-muted-foreground">
                เลขอะตอม: {selectedElement.atomicNumber}
              </p>
            </div>
          </div>
        )}

        {/* Molecule Description */}
        {molecule.description && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{molecule.description}</p>
          </div>
        )}

        {/* Hints */}
        {showHints && (
          <div className="text-xs text-muted-foreground">
            <p>
              💡 ลากเพื่อหมุน • คลิกอะตอมเพื่อดูข้อมูล • ใช้ปุ่มซูมเพื่อขยาย/ย่อ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MolecularViewer;
