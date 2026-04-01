'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// KaTeX-compatible math rendering props
export interface MathRendererProps {
  /** Math expression in LaTeX syntax */
  math: string;
  /** Display mode (block vs inline) */
  displayMode?: boolean;
  /** Custom class name */
  className?: string;
  /** Font size scale */
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  /** Color override */
  color?: string;
  /** Error display */
  showError?: boolean;
  /** Fallback for unsupported browsers */
  fallback?: React.ReactNode;
}

// Font size mapping
const FONT_SIZES: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

/**
 * MathRenderer Component
 *
 * Renders mathematical expressions using a simple text-based approach.
 * For production, integrate with KaTeX library for full LaTeX support.
 *
 * Supported syntax (subset):
 * - Fractions: \frac{a}{b}
 * - Superscript: x^{2} or x^2
 * - Subscript: x_{1} or x_1
 * - Greek letters: \alpha, \beta, \gamma, etc.
 * - Operators: \times, \div, \pm, \sqrt
 * - Relations: \leq, \geq, \neq, \approx
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function MathRenderer({
  math,
  displayMode = false,
  className,
  fontSize = 'base',
  color,
  showError = true,
  fallback,
}: MathRendererProps) {
  const [rendered, setRendered] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Greek letter mapping
  const GREEK_LETTERS: Record<string, string> = {
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\zeta': 'ζ',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\xi': 'ξ',
    '\\pi': 'π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\tau': 'τ',
    '\\upsilon': 'υ',
    '\\phi': 'φ',
    '\\chi': 'χ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    '\\Alpha': 'Α',
    '\\Beta': 'Β',
    '\\Gamma': 'Γ',
    '\\Delta': 'Δ',
    '\\Epsilon': 'Ε',
    '\\Theta': 'Θ',
    '\\Lambda': 'Λ',
    '\\Pi': 'Π',
    '\\Sigma': 'Σ',
    '\\Phi': 'Φ',
    '\\Psi': 'Ψ',
    '\\Omega': 'Ω',
  };

  // Mathematical symbols mapping
  const MATH_SYMBOLS: Record<string, string> = {
    '\\times': '×',
    '\\div': '÷',
    '\\pm': '±',
    '\\mp': '∓',
    '\\cdot': '·',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\approx': '≈',
    '\\equiv': '≡',
    '\\sim': '∼',
    '\\propto': '∝',
    '\\infty': '∞',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\sum': '∑',
    '\\prod': '∏',
    '\\int': '∫',
    '\\oint': '∮',
    '\\sqrt': '√',
    '\\cup': '∪',
    '\\cap': '∩',
    '\\subset': '⊂',
    '\\supset': '⊃',
    '\\in': '∈',
    '\\notin': '∉',
    '\\forall': '∀',
    '\\exists': '∃',
    '\\neg': '¬',
    '\\land': '∧',
    '\\lor': '∨',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\Leftrightarrow': '⇔',
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\leftrightarrow': '↔',
    '\\uparrow': '↑',
    '\\downarrow': '↓',
    '\\circ': '∘',
    '\\degree': '°',
    '\\angle': '∠',
    '\\triangle': '△',
    '\\square': '□',
    '\\star': '★',
    '\\bullet': '•',
    '\\ldots': '…',
    '\\cdots': '⋯',
    '\\vdots': '⋮',
    '\\ddots': '⋱',
  };

  // Helper function to extract balanced brace content
  const extractBraceContent = (str: string, startIndex: number): { content: string; endIndex: number } | null => {
    if (str[startIndex] !== '{') return null;
    let depth = 1;
    let i = startIndex + 1;
    while (i < str.length && depth > 0) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') depth--;
      i++;
    }
    if (depth === 0) {
      return { content: str.slice(startIndex + 1, i - 1), endIndex: i };
    }
    return null;
  };

  // Process \frac with balanced braces
  const processFractions = (input: string): string => {
    let result = input;
    let match;
    const fracRegex = /\\frac\{/g;

    while ((match = fracRegex.exec(result)) !== null) {
      const numStart = match.index + 6; // After '\frac{'
      const numResult = extractBraceContent(result, numStart - 1);
      if (!numResult) continue;

      const denStart = numResult.endIndex;
      if (result[denStart] !== '{') continue;
      const denResult = extractBraceContent(result, denStart);
      if (!denResult) continue;

      const num = numResult.content;
      const den = denResult.content;
      const fullMatch = result.slice(match.index, denResult.endIndex);

      // Replace with fraction representation
      const replacement = (num.length === 1 && den.length === 1)
        ? `${num}/${den}`
        : `(${num})/(${den})`;

      result = result.slice(0, match.index) + replacement + result.slice(denResult.endIndex);
      fracRegex.lastIndex = match.index + replacement.length;
    }
    return result;
  };

  // Process \sqrt with balanced braces
  const processSqrt = (input: string): string => {
    let result = input;
    let match;
    const sqrtRegex = /\\sqrt\{/g;

    while ((match = sqrtRegex.exec(result)) !== null) {
      const contentStart = match.index + 6; // After '\sqrt{'
      const contentResult = extractBraceContent(result, contentStart - 1);
      if (!contentResult) continue;

      const content = contentResult.content;
      const fullMatch = result.slice(match.index, contentResult.endIndex);
      const replacement = content.length === 1 ? `√${content}` : `√(${content})`;

      result = result.slice(0, match.index) + replacement + result.slice(contentResult.endIndex);
      sqrtRegex.lastIndex = match.index + replacement.length;
    }
    return result;
  };

  // Simple LaTeX to HTML/Unicode converter
  useEffect(() => {
    try {
      let result = math;

      // Replace Greek letters
      Object.entries(GREEK_LETTERS).forEach(([latex, unicode]) => {
        result = result.replace(new RegExp(latex.replace(/\\/g, '\\\\'), 'g'), unicode);
      });

      // Replace math symbols
      Object.entries(MATH_SYMBOLS).forEach(([latex, unicode]) => {
        result = result.replace(new RegExp(latex.replace(/\\/g, '\\\\'), 'g'), unicode);
      });

      // Handle fractions with balanced braces (supports nested content)
      result = processFractions(result);

      // Handle sqrt with balanced braces (supports nested content)
      result = processSqrt(result);

      // Handle superscripts: x^{2} or x^2 -> x²
      const superscripts: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
        'n': 'ⁿ', 'i': 'ⁱ',
      };

      result = result.replace(/\^{([^}]+)}/g, (_, content) => {
        return content.split('').map((c: string) => superscripts[c] || `^${c}`).join('');
      });
      result = result.replace(/\^([0-9n])/g, (_, content) => {
        return superscripts[content] || `^${content}`;
      });

      // Handle subscripts: x_{1} or x_1 -> x₁
      const subscripts: Record<string, string> = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
        '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
        'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'o': 'ₒ', 'u': 'ᵤ',
        'n': 'ₙ', 'x': 'ₓ',
      };

      result = result.replace(/_{([^}]+)}/g, (_, content) => {
        return content.split('').map((c: string) => subscripts[c] || `_${c}`).join('');
      });
      result = result.replace(/_([0-9])/g, (_, content) => {
        return subscripts[content] || `_${content}`;
      });

      // Handle text: \text{word}
      result = result.replace(/\\text\{([^}]+)\}/g, '$1');

      // Handle spacing
      result = result.replace(/\\,/g, ' ');
      result = result.replace(/\\;/g, '  ');
      result = result.replace(/\\quad/g, '    ');
      result = result.replace(/\\qquad/g, '        ');

      // Handle left/right brackets
      result = result.replace(/\\left\(/g, '(');
      result = result.replace(/\\right\)/g, ')');
      result = result.replace(/\\left\[/g, '[');
      result = result.replace(/\\right\]/g, ']');
      result = result.replace(/\\left\{/g, '{');
      result = result.replace(/\\right\}/g, '}');
      result = result.replace(/\\left\|/g, '|');
      result = result.replace(/\\right\|/g, '|');

      // Clean up remaining backslashes for unknown commands (silently keep them)
      result = result.replace(/\\([a-zA-Z]+)/g, (match, cmd) => {
        // Silently pass through unknown commands - they may be valid LaTeX not yet supported
        return match;
      });

      setRendered(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render math');
      setRendered(math);
    }
  }, [math]);

  if (error && showError) {
    return (
      <span className={cn('text-red-500 font-mono text-sm', className)}>
        {fallback || `Error: ${error}`}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'font-math',
        FONT_SIZES[fontSize],
        displayMode && 'block text-center my-4',
        !displayMode && 'inline',
        className,
      )}
      style={{ color }}
    >
      {rendered}
    </span>
  );
}

// Inline math shorthand
export function InlineMath({ math, ...props }: Omit<MathRendererProps, 'displayMode'>) {
  return <MathRenderer math={math} displayMode={false} {...props} />;
}

// Display/block math shorthand
export function BlockMath({ math, ...props }: Omit<MathRendererProps, 'displayMode'>) {
  return <MathRenderer math={math} displayMode={true} {...props} />;
}

// Math equation with label
export interface EquationProps extends MathRendererProps {
  label?: string;
  number?: number;
}

export function Equation({ label, number, math, ...props }: EquationProps) {
  return (
    <div className="flex items-center justify-between my-4 px-4">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <MathRenderer math={math} displayMode={true} {...props} />
      {number !== undefined && (
        <span className="text-sm text-muted-foreground">({number})</span>
      )}
    </div>
  );
}

export default MathRenderer;
