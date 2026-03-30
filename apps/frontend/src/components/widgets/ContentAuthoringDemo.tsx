'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownWithWidgets } from './MarkdocIntegration';
import { Copy, CheckCheck, BookOpen, Sparkles, Code2 } from 'lucide-react';

// Sample lesson content with embedded widgets
const SAMPLE_LESSON = `# บทเรียน: พื้นที่สี่เหลี่ยมผืนผ้า

ในบทเรียนนี้ เราจะเรียนรู้วิธีการคำนวณพื้นที่สี่เหลี่ยมผืนผ้า

## สูตรพื้นที่

พื้นที่ของสี่เหลี่ยมผืนผ้า = **ความกว้าง × ความยาว**

หรือเขียนเป็นสูตร: **A = w × l**

## ลองทำด้วยตัวเอง

ลากตัวเลื่อนเพื่อเปลี่ยนขนาดของสี่เหลี่ยม แล้วสังเกตว่าพื้นที่เปลี่ยนแปลงอย่างไร:

\`\`\`widget
{
  "type": "slider",
  "id": "area-explorer",
  "props": {
    "title": "สำรวจพื้นที่สี่เหลี่ยม",
    "description": "ลองเปลี่ยนความกว้างและความยาวเพื่อดูว่าพื้นที่เปลี่ยนแปลงอย่างไร",
    "subject": "math",
    "showFormula": true,
    "formula": "A = กว้าง × ยาว",
    "sliders": [
      { "label": "กว้าง", "min": 1, "max": 20, "defaultValue": 5, "step": 1, "unit": "ซม." },
      { "label": "ยาว", "min": 1, "max": 20, "defaultValue": 8, "step": 1, "unit": "ซม." }
    ]
  }
}
\`\`\`

## คำถามทบทวน

จากสิ่งที่คุณสังเกต ตอบคำถามต่อไปนี้:

\`\`\`widget
{
  "type": "multiple-choice",
  "id": "review-question",
  "props": {
    "question": "ถ้าเพิ่มความกว้างเป็น 2 เท่า พื้นที่จะเปลี่ยนแปลงอย่างไร?",
    "subject": "math",
    "columns": 2,
    "options": [
      { "id": "a", "content": "เพิ่มขึ้น 2 เท่า", "isCorrect": true, "explanation": "ถูกต้อง! เมื่อคูณความกว้างด้วย 2 พื้นที่ก็จะเพิ่มขึ้น 2 เท่าเช่นกัน" },
      { "id": "b", "content": "เพิ่มขึ้น 4 เท่า", "isCorrect": false },
      { "id": "c", "content": "เท่าเดิม", "isCorrect": false },
      { "id": "d", "content": "ลดลงครึ่งหนึ่ง", "isCorrect": false }
    ]
  }
}
\`\`\`

## แบบฝึกหัด: เติมคำตอบ

\`\`\`widget
{
  "type": "fill-blank",
  "id": "fill-exercise",
  "props": {
    "title": "คำนวณพื้นที่",
    "subject": "math",
    "content": "สี่เหลี่ยมผืนผ้ามีความกว้าง 6 ซม. และความยาว 9 ซม. พื้นที่ = 6 × 9 = {{answer}} ตร.ซม.",
    "blanks": [
      { "id": "answer", "acceptedAnswers": ["54"], "placeholder": "?", "width": "narrow", "hint": "6 × 9 เท่ากับเท่าไหร่?" }
    ]
  }
}
\`\`\`

---

**สรุป**: พื้นที่สี่เหลี่ยมผืนผ้า = กว้าง × ยาว
`;

const PHYSICS_LESSON = `# บทเรียน: กฎการเคลื่อนที่ของนิวตัน

## กฎข้อที่ 2: F = ma

แรง = มวล × ความเร่ง

ลองเปลี่ยนค่ามวลและความเร่งเพื่อดูว่าแรงเปลี่ยนแปลงอย่างไร:

\`\`\`widget
{
  "type": "slider",
  "id": "force-explorer",
  "props": {
    "title": "กฎข้อที่สองของนิวตัน",
    "description": "สำรวจความสัมพันธ์ระหว่างแรง มวล และความเร่ง",
    "subject": "physics",
    "showFormula": true,
    "formula": "F = ma",
    "sliders": [
      { "label": "มวล", "min": 1, "max": 100, "defaultValue": 10, "step": 1, "unit": "kg" },
      { "label": "ความเร่ง", "min": 1, "max": 20, "defaultValue": 5, "step": 0.5, "unit": "m/s²" }
    ]
  }
}
\`\`\`

## การทดลอง: การตกอิสระ

กดเริ่มเพื่อดูการเคลื่อนที่ของวัตถุภายใต้แรงโน้มถ่วง:

\`\`\`widget
{
  "type": "physics",
  "id": "free-fall-sim",
  "props": {
    "title": "การตกอิสระ",
    "description": "สังเกตการเคลื่อนที่ของวัตถุภายใต้แรงโน้มถ่วง",
    "subject": "physics",
    "gravity": 9.8,
    "allowGravityControl": true,
    "showVelocityVectors": true,
    "initialObjects": [
      { "id": "ball", "type": "circle", "x": 300, "y": 50, "radius": 25, "color": "#F97316", "mass": 2, "velocity": { "x": 0, "y": 0 }, "acceleration": { "x": 0, "y": 0 }, "restitution": 0.7, "label": "ลูกบอล" }
    ]
  }
}
\`\`\`
`;

const CHEMISTRY_LESSON = `# บทเรียน: โครงสร้างโมเลกุล

## น้ำ (H₂O)

โมเลกุลน้ำประกอบด้วย:
- ออกซิเจน 1 อะตอม
- ไฮโดรเจน 2 อะตอม

หมุนโมเลกุลเพื่อดูโครงสร้าง 3 มิติ:

\`\`\`widget
{
  "type": "molecule",
  "id": "water-viewer",
  "props": {
    "title": "โมเลกุลน้ำ (H₂O)",
    "description": "หมุนเพื่อดูโครงสร้าง 3 มิติ คลิกอะตอมเพื่อดูข้อมูล",
    "subject": "science",
    "molecule": {
      "name": "Water",
      "formula": "H₂O",
      "description": "โมเลกุลน้ำประกอบด้วยออกซิเจน 1 อะตอมและไฮโดรเจน 2 อะตอม",
      "atoms": [
        { "id": "O1", "element": "O", "x": 0, "y": 0, "z": 0 },
        { "id": "H1", "element": "H", "x": -0.8, "y": 0.6, "z": 0 },
        { "id": "H2", "element": "H", "x": 0.8, "y": 0.6, "z": 0 }
      ],
      "bonds": [
        { "id": "b1", "atom1": "O1", "atom2": "H1", "order": 1 },
        { "id": "b2", "atom1": "O1", "atom2": "H2", "order": 1 }
      ]
    }
  }
}
\`\`\`

## จำแนกธาตุ

ลากแต่ละธาตุไปยังหมวดหมู่ที่ถูกต้อง:

\`\`\`widget
{
  "type": "drag-drop",
  "id": "element-classification",
  "props": {
    "title": "จำแนกธาตุ",
    "instructions": "ลากแต่ละธาตุไปยังหมวดหมู่ที่ถูกต้อง",
    "subject": "science",
    "allowMultiple": true,
    "showFeedback": true,
    "items": [
      { "id": "o", "content": "🔴 O (ออกซิเจน)", "category": "nonmetal" },
      { "id": "fe", "content": "⚪ Fe (เหล็ก)", "category": "metal" },
      { "id": "c", "content": "⚫ C (คาร์บอน)", "category": "nonmetal" },
      { "id": "au", "content": "🟡 Au (ทอง)", "category": "metal" },
      { "id": "n", "content": "🔵 N (ไนโตรเจน)", "category": "nonmetal" },
      { "id": "cu", "content": "🟠 Cu (ทองแดง)", "category": "metal" }
    ],
    "zones": [
      { "id": "metals", "label": "⚙️ โลหะ", "acceptCategories": ["metal"], "correctItems": ["fe", "au", "cu"] },
      { "id": "nonmetals", "label": "🧪 อโลหะ", "acceptCategories": ["nonmetal"], "correctItems": ["o", "c", "n"] }
    ]
  }
}
\`\`\`
`;

/**
 * ContentAuthoringDemo Component
 *
 * Demonstrates the Markdoc integration for content authoring.
 * Shows how widgets can be embedded in markdown content.
 */
export function ContentAuthoringDemo() {
  const [activeLesson, setActiveLesson] = useState<'math' | 'physics' | 'chemistry'>('math');
  const [copied, setCopied] = useState(false);
  const [interactions, setInteractions] = useState<Array<{ widgetId: string; type: string; timestamp: number }>>([]);

  const lessons = {
    math: SAMPLE_LESSON,
    physics: PHYSICS_LESSON,
    chemistry: CHEMISTRY_LESSON,
  };

  const handleWidgetInteract = (widgetId: string, interaction: any) => {
    setInteractions((prev) => [
      ...prev.slice(-9), // Keep last 10
      { widgetId, type: interaction.type, timestamp: Date.now() },
    ]);
    console.log(`Widget ${widgetId} interaction:`, interaction);
  };

  const handleWidgetComplete = (widgetId: string, result: any) => {
    console.log(`Widget ${widgetId} completed:`, result);
  };

  const handleCopySource = async () => {
    await navigator.clipboard.writeText(lessons[activeLesson]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-outfit flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-kidpen-gold" />
          Content Authoring Demo
        </h1>
        <p className="text-muted-foreground">
          ระบบเขียนเนื้อหาแบบ Markdown พร้อม Widget แบบ Interactive
        </p>
      </div>

      {/* Lesson Tabs */}
      <Tabs value={activeLesson} onValueChange={(v) => setActiveLesson(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="math" className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-subject-math" />
            คณิตศาสตร์
          </TabsTrigger>
          <TabsTrigger value="physics" className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-subject-physics" />
            ฟิสิกส์
          </TabsTrigger>
          <TabsTrigger value="chemistry" className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-subject-science" />
            เคมี
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Content Preview */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-kidpen">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-kidpen-gold" />
                    Preview
                  </CardTitle>
                  <CardDescription>บทเรียนพร้อม Widget แบบ Interactive</CardDescription>
                </div>
                <Badge className="bg-kidpen-gold text-white">Live Preview</Badge>
              </CardHeader>
              <CardContent>
                <TabsContent value="math" className="mt-0">
                  <MarkdownWithWidgets
                    content={SAMPLE_LESSON}
                    onWidgetInteract={handleWidgetInteract}
                    onWidgetComplete={handleWidgetComplete}
                  />
                </TabsContent>
                <TabsContent value="physics" className="mt-0">
                  <MarkdownWithWidgets
                    content={PHYSICS_LESSON}
                    onWidgetInteract={handleWidgetInteract}
                    onWidgetComplete={handleWidgetComplete}
                  />
                </TabsContent>
                <TabsContent value="chemistry" className="mt-0">
                  <MarkdownWithWidgets
                    content={CHEMISTRY_LESSON}
                    onWidgetInteract={handleWidgetInteract}
                    onWidgetComplete={handleWidgetComplete}
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </div>

          {/* Source Code & Info */}
          <div className="space-y-4">
            {/* Source Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    Markdown Source
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleCopySource}>
                    {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-[300px]">
                  {lessons[activeLesson].slice(0, 500)}...
                </pre>
              </CardContent>
            </Card>

            {/* Interaction Log */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {interactions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">ลองคลิก Widget ด้านซ้าย</p>
                  ) : (
                    interactions.map((i, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-kidpen-gold" />
                        <span className="font-mono">{i.widgetId}</span>
                        <span className="text-muted-foreground">• {i.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Widget Types */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Available Widgets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {[
                    'slider',
                    'drag-drop',
                    'multiple-choice',
                    'fill-blank',
                    'number-line',
                    'balance-scale',
                    'code-playground',
                    'graphing',
                    'geometry',
                    'animation',
                    'physics',
                    'molecule',
                    'math',
                  ].map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export default ContentAuthoringDemo;
