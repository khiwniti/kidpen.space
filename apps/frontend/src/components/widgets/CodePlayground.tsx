'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  RotateCcw,
  Lightbulb,
  Code2,
  Terminal,
  Check,
  X,
  Copy,
  CheckCheck,
} from 'lucide-react';
import {
  BaseWidgetProps,
  WidgetInteraction,
  WidgetResult,
} from './types';

// Code playground specific types
export type ProgrammingLanguage = 'javascript' | 'python' | 'html' | 'css';

export interface CodePlaygroundProps extends BaseWidgetProps {
  /** Title text */
  title: string;
  /** Description/instructions */
  description?: string;
  /** Programming language */
  language: ProgrammingLanguage;
  /** Initial code */
  initialCode?: string;
  /** Expected output for validation (optional) */
  expectedOutput?: string;
  /** Test function to validate the code (for JS) */
  testFunction?: string;
  /** Whether to auto-run on load */
  autoRun?: boolean;
  /** Height of the editor */
  editorHeight?: number;
  /** Whether code is read-only */
  readOnly?: boolean;
  /** Starter template code */
  starterCode?: string;
  /** Solution code (hidden, for hints) */
  solutionCode?: string;
}

/**
 * CodePlayground Widget
 *
 * Interactive code editor with execution support.
 * Currently supports JavaScript execution in browser.
 *
 * Example use cases:
 * - Learn JavaScript basics
 * - Practice algorithms
 * - Experiment with code
 * - Complete coding challenges
 *
 * Part of the Kidpen "Spark of Joy" Widget Library
 */
export function CodePlayground({
  id,
  className,
  subject = 'coding',
  disabled = false,
  showHints = true,
  title,
  description,
  language = 'javascript',
  initialCode = '',
  expectedOutput,
  testFunction,
  autoRun = false,
  editorHeight = 200,
  readOnly = false,
  starterCode,
  solutionCode,
  onInteract,
  onComplete,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode || starterCode || '');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    return colorMap[subject]?.[variant] || colorMap.coding[variant];
  };

  // Run JavaScript code
  const runJavaScript = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setAttempts((prev) => prev + 1);

    try {
      // Capture console.log output
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      };

      // Execute the code
      // eslint-disable-next-line no-new-func
      const result = new Function(code)();

      // Restore console.log
      console.log = originalLog;

      // Combine logs and result
      let outputText = logs.join('\n');
      if (result !== undefined) {
        outputText += (outputText ? '\n' : '') + `→ ${typeof result === 'object' ? JSON.stringify(result) : result}`;
      }

      setOutput(outputText || '(ไม่มี output)');

      // Check expected output
      let isCorrect = true;
      if (expectedOutput) {
        isCorrect = outputText.trim() === expectedOutput.trim();
      }

      // Run test function if provided
      if (testFunction) {
        try {
          // eslint-disable-next-line no-new-func
          const testResult = new Function('userCode', testFunction)(code);
          isCorrect = testResult === true;
        } catch {
          isCorrect = false;
        }
      }

      // Track interaction
      const interaction: WidgetInteraction = {
        type: 'click',
        timestamp: Date.now(),
        data: { action: 'run', code, output: outputText, success: isCorrect },
      };
      onInteract?.(interaction);

      // Report completion if there's expected output
      if (expectedOutput || testFunction) {
        const widgetResult: WidgetResult = {
          success: isCorrect,
          score: isCorrect ? 100 : 0,
          attempts,
          timeSpent: Date.now() - startTime,
          data: { code, output: outputText },
        };
        onComplete?.(widgetResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setOutput('');
    } finally {
      setIsRunning(false);
    }
  }, [code, expectedOutput, testFunction, attempts, startTime, onInteract, onComplete]);

  // Run code based on language
  const handleRun = useCallback(() => {
    if (disabled || isRunning) return;

    if (language === 'javascript') {
      runJavaScript();
    } else {
      setOutput(`⚠️ การรัน ${language} ยังไม่รองรับในเบราว์เซอร์`);
    }
  }, [disabled, isRunning, language, runJavaScript]);

  // Reset to initial/starter code
  const handleReset = useCallback(() => {
    setCode(initialCode || starterCode || '');
    setOutput('');
    setError(null);
    setShowSolution(false);
  }, [initialCode, starterCode]);

  // Copy code to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  // Auto-run on load
  useEffect(() => {
    if (autoRun && code) {
      handleRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    },
    [handleRun],
  );

  // Get language display name
  const getLanguageName = (lang: ProgrammingLanguage) => {
    const names: Record<ProgrammingLanguage, string> = {
      javascript: 'JavaScript',
      python: 'Python',
      html: 'HTML',
      css: 'CSS',
    };
    return names[lang];
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
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-outfit font-semibold flex items-center gap-2">
              <Code2 className={cn('w-5 h-5', getSubjectColorClass('text'))} />
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
            {getLanguageName(language)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Code Editor */}
        <div className="relative">
          <div
            className={cn(
              'absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-3',
              'bg-gray-100 dark:bg-gray-800 border-b rounded-t-lg',
              getSubjectColorClass('border'),
            )}
          >
            <span className="text-xs text-muted-foreground font-mono">
              {getLanguageName(language)}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckCheck className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || readOnly}
            placeholder="// เขียนโค้ดที่นี่..."
            spellCheck={false}
            className={cn(
              'w-full font-mono text-sm p-4 pt-10 rounded-lg border-2 resize-none',
              'bg-gray-50 dark:bg-gray-900',
              'focus:outline-none focus:ring-2',
              getSubjectColorClass('border'),
              getSubjectColorClass('ring'),
              readOnly && 'cursor-not-allowed opacity-70',
            )}
            style={{ height: editorHeight }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={disabled}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              รีเซ็ต
            </Button>

            {solutionCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSolution(!showSolution)}
                disabled={disabled}
                className="gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {showSolution ? 'ซ่อนเฉลย' : 'ดูเฉลย'}
              </Button>
            )}
          </div>

          <Button
            onClick={handleRun}
            disabled={disabled || isRunning || !code.trim()}
            className={cn(
              'gap-2',
              'bg-kidpen-gold hover:bg-kidpen-gold/90 text-white shadow-kidpen',
            )}
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'กำลังรัน...' : 'รัน (Ctrl+Enter)'}
          </Button>
        </div>

        {/* Solution Display */}
        {showSolution && solutionCode && (
          <div
            className={cn(
              'p-4 rounded-lg border-2 border-dashed',
              'bg-amber-50 dark:bg-amber-900/20',
              'border-amber-300 dark:border-amber-700',
            )}
          >
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              เฉลย:
            </p>
            <pre className="text-sm font-mono bg-white dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
              {solutionCode}
            </pre>
          </div>
        )}

        {/* Output Display */}
        <div
          className={cn(
            'p-4 rounded-lg border-2',
            error
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700',
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Terminal className={cn('w-4 h-4', error ? 'text-red-500' : 'text-muted-foreground')} />
            <span className="text-sm font-medium">
              {error ? 'Error' : 'Output'}
            </span>
            {expectedOutput && output && (
              <Badge
                className={cn(
                  'ml-auto text-xs',
                  output.trim() === expectedOutput.trim()
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white',
                )}
              >
                {output.trim() === expectedOutput.trim() ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    ถูกต้อง
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    ยังไม่ถูก
                  </>
                )}
              </Badge>
            )}
          </div>

          <pre
            className={cn(
              'text-sm font-mono whitespace-pre-wrap',
              error ? 'text-red-600 dark:text-red-400' : 'text-foreground',
            )}
          >
            {error || output || '(รันโค้ดเพื่อดู output)'}
          </pre>
        </div>

        {/* Expected Output Hint */}
        {expectedOutput && showHints && !output && (
          <div
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-sm',
              getSubjectColorClass('bg'),
              getSubjectColorClass('text'),
            )}
          >
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              Output ที่ต้องการ: <code className="font-mono bg-white/50 px-1 rounded">{expectedOutput}</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CodePlayground;
