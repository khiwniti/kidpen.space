'use client';

import React from 'react';
import { SliderExplorer } from './SliderExplorer';
import { DragDropProblem } from './DragDropProblem';
import { StepByStepReveal } from './StepByStepReveal';
import { MultipleChoiceVisual } from './MultipleChoiceVisual';
import { FillInReasoning } from './FillInReasoning';
import { NumberLine } from './NumberLine';
import { BalanceScale } from './BalanceScale';
import { DataTable } from './DataTable';
import { CodePlayground } from './CodePlayground';
import { GraphingWidget } from './GraphingWidget';
import { GeometryCanvas } from './GeometryCanvas';
import { AnimatedExplanation } from './AnimatedExplanation';
import { PhysicsSimulation } from './PhysicsSimulation';
import { MolecularViewer, MOLECULES } from './MolecularViewer';
import { MathRenderer, BlockMath, InlineMath } from './MathRenderer';
import {
  XPBadge,
  StreakBadge,
  LeagueBadge,
  MentorBadge,
  CreatorBadge,
  MasteryBadge,
  BadgeCollection,
} from './GamificationBadges';

/**
 * Widget Demo Component
 *
 * Showcases all available interactive STEM widgets
 * with example configurations.
 */
export function WidgetDemo() {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-outfit">Kidpen Widget Library</h1>
        <p className="text-muted-foreground">
          Interactive STEM learning components for Thai students
        </p>
      </div>

      {/* Gamification Badges Demo */}
      <section className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <h2 className="text-xl font-semibold font-outfit">🏆 Gamification Badges</h2>
        <div className="flex flex-wrap gap-3">
          <XPBadge xp={1240} />
          <StreakBadge days={14} />
          <LeagueBadge tier="gold" />
          <MentorBadge helped={12} />
          <CreatorBadge created={5} />
          <MasteryBadge subject="คณิต" percentage={85} />
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Badge Collection:</p>
          <BadgeCollection
            badges={[
              { type: 'xp', label: 'XP', value: 500 },
              { type: 'streak', label: 'Streak', value: 7 },
              { type: 'mastery', label: 'Master', unlocked: true },
              { type: 'helper', label: 'Helper', unlocked: false },
            ]}
          />
        </div>
      </section>

      {/* Math: Area Calculator */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: พื้นที่สี่เหลี่ยม</h2>
        <SliderExplorer
          subject="math"
          title="สำรวจพื้นที่สี่เหลี่ยม"
          description="ลองเปลี่ยนความกว้างและความยาวเพื่อดูว่าพื้นที่เปลี่ยนแปลงอย่างไร"
          showFormula
          formula="A = กว้าง × ยาว"
          sliders={[
            {
              label: 'กว้าง',
              min: 1,
              max: 20,
              defaultValue: 5,
              step: 1,
              unit: 'ซม.',
              description: 'ความกว้างของสี่เหลี่ยม',
            },
            {
              label: 'ยาว',
              min: 1,
              max: 20,
              defaultValue: 8,
              step: 1,
              unit: 'ซม.',
              description: 'ความยาวของสี่เหลี่ยม',
            },
          ]}
          compute={(values) => ({
            value: values['กว้าง'] * values['ยาว'],
            label: 'พื้นที่',
            unit: 'ตร.ซม.',
            indicator: values['กว้าง'] * values['ยาว'] > 100 ? 'success' : 'neutral',
          })}
          onInteract={(interaction) => console.log('Interaction:', interaction)}
          onComplete={(result) => console.log('Complete:', result)}
        />
      </section>

      {/* Physics: Force = Mass × Acceleration */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">ฟิสิกส์: แรง = มวล × ความเร่ง</h2>
        <SliderExplorer
          subject="physics"
          title="กฎข้อที่สองของนิวตัน"
          description="สำรวจความสัมพันธ์ระหว่างแรง มวล และความเร่ง"
          showFormula
          formula="F = ma"
          sliders={[
            {
              label: 'มวล',
              min: 1,
              max: 100,
              defaultValue: 10,
              step: 1,
              unit: 'kg',
              description: 'มวลของวัตถุ',
            },
            {
              label: 'ความเร่ง',
              min: 1,
              max: 20,
              defaultValue: 5,
              step: 0.5,
              unit: 'm/s²',
              description: 'ความเร่งของวัตถุ',
            },
          ]}
          compute={(values) => ({
            value: Math.round(values['มวล'] * values['ความเร่ง'] * 100) / 100,
            label: 'แรง',
            unit: 'N',
            indicator: values['มวล'] * values['ความเร่ง'] > 500 ? 'warning' : 'neutral',
          })}
        />
      </section>

      {/* Science: Classification */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">วิทยาศาสตร์: จำแนกสิ่งมีชีวิต</h2>
        <DragDropProblem
          subject="science"
          title="จำแนกสัตว์"
          instructions="ลากแต่ละสัตว์ไปยังหมวดหมู่ที่ถูกต้อง"
          items={[
            { id: 'dog', content: '🐕 หมา', category: 'mammal' },
            { id: 'eagle', content: '🦅 นกอินทรี', category: 'bird' },
            { id: 'salmon', content: '🐟 ปลาแซลมอน', category: 'fish' },
            { id: 'cat', content: '🐱 แมว', category: 'mammal' },
            { id: 'parrot', content: '🦜 นกแก้ว', category: 'bird' },
            { id: 'shark', content: '🦈 ฉลาม', category: 'fish' },
          ]}
          zones={[
            {
              id: 'mammals',
              label: '🐾 สัตว์เลี้ยงลูกด้วยนม',
              acceptCategories: ['mammal'],
              correctItems: ['dog', 'cat'],
            },
            {
              id: 'birds',
              label: '🐦 สัตว์ปีก',
              acceptCategories: ['bird'],
              correctItems: ['eagle', 'parrot'],
            },
            {
              id: 'fish',
              label: '🐠 ปลา',
              acceptCategories: ['fish'],
              correctItems: ['salmon', 'shark'],
            },
          ]}
          allowMultiple
          showFeedback
          onComplete={(result) => console.log('Classification result:', result)}
        />
      </section>

      {/* Multiple Choice Visual */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">วิทยาศาสตร์: รูปทรงเรขาคณิต</h2>
        <MultipleChoiceVisual
          subject="math"
          question="รูปทรงใดมี 6 หน้า?"
          options={[
            { id: 'sphere', content: '🔵 ทรงกลม', isCorrect: false },
            { id: 'cube', content: '🟦 ลูกบาศก์', isCorrect: true, explanation: 'ลูกบาศก์มี 6 หน้า แต่ละหน้าเป็นสี่เหลี่ยมจัตุรัส' },
            { id: 'pyramid', content: '🔺 พีระมิด', isCorrect: false },
            { id: 'cylinder', content: '🛢️ ทรงกระบอก', isCorrect: false },
          ]}
          columns={2}
          shuffleOptions
        />
      </section>

      {/* Fill In Reasoning */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: เติมคำตอบ</h2>
        <FillInReasoning
          subject="math"
          title="เติมจำนวนที่หายไป"
          content="ถ้า 3 × {{x}} = 12 แล้ว {{x}} = {{answer}}"
          blanks={[
            { id: 'x', acceptedAnswers: ['x', 'X'], placeholder: 'ตัวแปร', width: 'narrow' },
            { id: 'x', acceptedAnswers: ['x', 'X'], placeholder: 'ตัวแปร', width: 'narrow' },
            { id: 'answer', acceptedAnswers: ['4'], placeholder: '?', width: 'narrow', hint: '12 หาร 3 เท่ากับ?' },
          ]}
        />
      </section>

      {/* Number Line */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: เส้นจำนวน</h2>
        <NumberLine
          subject="math"
          title="วางตำแหน่งจำนวน"
          description="คลิกบนเส้นจำนวนเพื่อวางตำแหน่งของเลข 3.5"
          min={0}
          max={10}
          step={1}
          showLabels
          showMinorTicks
          problem={{
            targetValue: 3.5,
            tolerance: 0.25,
            label: '3.5',
          }}
        />
      </section>

      {/* Balance Scale */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: แก้สมการด้วยตาชั่ง</h2>
        <BalanceScale
          subject="math"
          title="แก้สมการ 2x + 3 = 11"
          description="ทำการคำนวณกับทั้งสองข้างเพื่อหาค่า x"
          leftItems={[
            { id: 'x1', display: 'x', weight: 4, isVariable: true },
            { id: 'x2', display: 'x', weight: 4, isVariable: true },
            { id: 'c1', display: '3', weight: 3 },
          ]}
          rightItems={[
            { id: 'r1', display: '11', weight: 11 },
          ]}
          targetVariable="x"
          expectedSolution={4}
          operations={['add', 'subtract', 'multiply', 'divide']}
        />
      </section>

      {/* Data Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: สถิติข้อมูล</h2>
        <DataTable
          subject="math"
          title="คะแนนสอบวิชาคณิตศาสตร์"
          description="กรอกคะแนนสอบของนักเรียนแล้วดูค่าสถิติ"
          columns={[
            { id: 'name', header: 'ชื่อ', type: 'text', width: 'normal' },
            { id: 'score', header: 'คะแนน', type: 'number', width: 'narrow' },
          ]}
          initialData={[
            { id: '1', values: { name: 'สมชาย', score: 85 } },
            { id: '2', values: { name: 'สมหญิง', score: 92 } },
            { id: '3', values: { name: 'สมศรี', score: 78 } },
            { id: '4', values: { name: 'สมศักดิ์', score: 88 } },
          ]}
          allowAddRows
          allowDeleteRows
          showStats={{ sum: true, mean: true, median: true, min: true, max: true }}
          expectedAnswer={{
            statistic: 'mean',
            column: 'score',
            value: 85.75,
            tolerance: 0.5,
          }}
        />
      </section>

      {/* Math: Step-by-step equation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: แก้สมการ</h2>
        <StepByStepReveal
          subject="math"
          title="แก้สมการ 2x + 5 = 13"
          steps={[
            {
              id: 'step1',
              content: 'เริ่มจากสมการ: 2x + 5 = 13',
              hint: 'เขียนสมการที่กำหนดให้',
              explanation: 'เราต้องหาค่า x ที่ทำให้สมการเป็นจริง',
            },
            {
              id: 'step2',
              content: 'ลบ 5 ทั้งสองข้าง: 2x + 5 - 5 = 13 - 5',
              hint: 'ย้าย 5 ไปอีกข้างหนึ่ง',
              explanation: 'เราย้าย +5 ไปอีกด้านโดยการลบ 5 ทั้งสองข้าง',
            },
            {
              id: 'step3',
              content: 'จะได้: 2x = 8',
              hint: 'คำนวณผลลัพธ์',
              explanation: '5 - 5 = 0 ทางซ้าย และ 13 - 5 = 8 ทางขวา',
            },
            {
              id: 'step4',
              content: 'หารทั้งสองข้างด้วย 2: 2x ÷ 2 = 8 ÷ 2',
              hint: 'หาร 2 เพื่อให้ได้ x เดี่ยว',
              explanation: 'เราต้องการให้ x อยู่คนเดียว จึงหาร 2 ทั้งสองข้าง',
            },
            {
              id: 'step5',
              content: 'คำตอบ: x = 4',
              hint: 'ตรวจคำตอบ: 2(4) + 5 = 8 + 5 = 13 ✓',
              explanation: 'ตรวจสอบ: แทน x = 4 ลงในสมการเดิม จะได้ 2(4) + 5 = 13 ถูกต้อง!',
            },
          ]}
          requireAttempt={false}
          autoAdvance
          onComplete={(result) => console.log('Equation solving result:', result)}
        />
      </section>

      {/* Coding: Sorting Algorithm */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">การเขียนโปรแกรม: Bubble Sort</h2>
        <StepByStepReveal
          subject="coding"
          title="เรียงลำดับด้วย Bubble Sort"
          steps={[
            {
              id: 'step1',
              content: 'เริ่มต้น: [5, 2, 8, 1, 9]',
              explanation: 'นี่คืออาร์เรย์ที่เราต้องการเรียงลำดับจากน้อยไปมาก',
            },
            {
              id: 'step2',
              content: 'รอบที่ 1: เปรียบเทียบ 5 กับ 2 → สลับ! → [2, 5, 8, 1, 9]',
              explanation: '5 > 2 จึงต้องสลับตำแหน่ง',
            },
            {
              id: 'step3',
              content: 'รอบที่ 1: เปรียบเทียบ 8 กับ 1 → สลับ! → [2, 5, 1, 8, 9]',
              explanation: '8 > 1 จึงต้องสลับตำแหน่ง',
            },
            {
              id: 'step4',
              content: 'รอบที่ 2: [2, 1, 5, 8, 9] → สลับ 2 กับ 1',
              explanation: 'ทำซ้ำอีกรอบ เปรียบเทียบและสลับตำแหน่ง',
            },
            {
              id: 'step5',
              content: 'ผลลัพธ์สุดท้าย: [1, 2, 5, 8, 9] ✓',
              explanation: 'อาร์เรย์ถูกเรียงลำดับจากน้อยไปมากแล้ว!',
            },
          ]}
          onComplete={(result) => console.log('Bubble sort result:', result)}
        />
      </section>

      {/* Code Playground */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">การเขียนโปรแกรม: JavaScript Playground</h2>
        <CodePlayground
          subject="coding"
          title="ทดลองเขียน JavaScript"
          description="เขียนโค้ดเพื่อคำนวณผลรวมของ 1 ถึง 10"
          language="javascript"
          initialCode={`// คำนวณผลรวม 1 + 2 + 3 + ... + 10
let sum = 0;
for (let i = 1; i <= 10; i++) {
  sum += i;
}
console.log("ผลรวม:", sum);`}
          expectedOutput="ผลรวม: 55"
          solutionCode={`let sum = 0;
for (let i = 1; i <= 10; i++) {
  sum += i;
}
console.log("ผลรวม:", sum);`}
        />
      </section>

      {/* Graphing Widget */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: กราฟฟังก์ชัน</h2>
        <GraphingWidget
          subject="math"
          title="สำรวจกราฟพาราโบลา"
          description="ลองเพิ่มฟังก์ชันต่างๆ เพื่อดูรูปร่างกราฟ"
          initialFunctions={[
            { id: '1', expression: 'x^2', color: '#2563EB', visible: true, label: 'f(x) = x²' },
            { id: '2', expression: '2*x + 1', color: '#10B981', visible: true, label: 'g(x) = 2x + 1' },
          ]}
          xRange={[-5, 5]}
          yRange={[-2, 10]}
          graphHeight={350}
        />
      </section>

      {/* Geometry Canvas */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: เรขาคณิต</h2>
        <GeometryCanvas
          subject="math"
          title="วาดรูปสามเหลี่ยม"
          description="ใช้เครื่องมือวาดเพื่อสร้างรูปสามเหลี่ยมมุมฉาก"
          canvasWidth={500}
          canvasHeight={350}
          availableTools={['select', 'point', 'segment', 'polygon']}
        />
      </section>

      {/* Animated Explanation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: ทฤษฎีบทพีทาโกรัส</h2>
        <AnimatedExplanation
          subject="math"
          title="เข้าใจทฤษฎีบทพีทาโกรัส"
          description="ดูขั้นตอนการพิสูจน์ทฤษฎีบทพีทาโกรัสแบบภาพเคลื่อนไหว"
          frames={[
            {
              id: 'f1',
              duration: 3000,
              content: 'pythagoras-1',
              narration: 'เริ่มจากสี่เหลี่ยมจัตุรัสบนด้าน a ของสามเหลี่ยมมุมฉาก พื้นที่ = a²',
            },
            {
              id: 'f2',
              duration: 3000,
              content: 'pythagoras-2',
              narration: 'เพิ่มสี่เหลี่ยมจัตุรัสบนด้าน b พื้นที่ = b²',
            },
            {
              id: 'f3',
              duration: 4000,
              content: 'pythagoras-3',
              narration: 'สี่เหลี่ยมบนด้านตรงข้ามมุมฉาก (c) มีพื้นที่เท่ากับผลรวมของอีกสองรูป: a² + b² = c²',
            },
          ]}
          animationHeight={280}
          pauseAtFrameEnd
        />
      </section>

      {/* Physics Simulation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">ฟิสิกส์: การตกอิสระ</h2>
        <PhysicsSimulation
          subject="physics"
          title="การตกอิสระภายใต้แรงโน้มถ่วง"
          description="สังเกตการเคลื่อนที่ของวัตถุภายใต้แรงโน้มถ่วง ลองปรับค่า g ดู"
          initialObjects={[
            {
              id: 'ball1',
              type: 'circle',
              x: 150,
              y: 50,
              radius: 25,
              color: '#2563EB',
              mass: 2,
              velocity: { x: 2, y: 0 },
              acceleration: { x: 0, y: 0 },
              restitution: 0.7,
              label: 'ลูกบอล 2kg',
            },
            {
              id: 'ball2',
              type: 'circle',
              x: 400,
              y: 80,
              radius: 35,
              color: '#F97316',
              mass: 5,
              velocity: { x: -1, y: 0 },
              acceleration: { x: 0, y: 0 },
              restitution: 0.5,
              label: 'ลูกบอล 5kg',
            },
          ]}
          canvasWidth={550}
          canvasHeight={350}
          showVelocityVectors
          allowGravityControl
        />
      </section>

      {/* Molecular Viewer */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold font-outfit">เคมี: โครงสร้างโมเลกุล</h2>
        <MolecularViewer
          subject="science"
          title="โมเลกุลน้ำ (H₂O)"
          description="หมุนเพื่อดูโครงสร้าง 3 มิติของโมเลกุลน้ำ"
          molecule={MOLECULES.water}
          canvasWidth={450}
          canvasHeight={350}
        />
      </section>

      {/* Math Renderer Demo */}
      <section className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <h2 className="text-xl font-semibold font-outfit">คณิตศาสตร์: การแสดงผลสมการ</h2>
        <div className="space-y-3">
          <p className="text-sm">
            สูตรพื้นที่วงกลม: <InlineMath math="A = \pi r^2" fontSize="lg" />
          </p>
          <p className="text-sm">
            ทฤษฎีบทพีทาโกรัส: <InlineMath math="a^2 + b^2 = c^2" fontSize="lg" />
          </p>
          <p className="text-sm">
            สมการกำลังสอง: <InlineMath math="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" fontSize="lg" />
          </p>
          <div className="mt-4 p-4 bg-white/50 rounded-lg">
            <BlockMath math="E = mc^2" fontSize="2xl" />
            <p className="text-center text-sm text-muted-foreground mt-2">สมการพลังงาน-มวลของไอน์สไตน์</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WidgetDemo;
