import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { DynamicGreeting } from '@/components/ui/dynamic-greeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = [
    {
      id: 'math-m1',
      name: 'คณิตศาสตร์ ม.1',
      icon: '📐',
      mastery: 65,
      colorClass: 'bg-kidpen-blue text-white',
      borderClass: 'border-kidpen-blue/20 hover:border-kidpen-blue/50',
      bgLightClass: 'bg-kidpen-blue/10',
      textClass: 'text-kidpen-blue',
    },
    {
      id: 'cs-m1',
      name: 'วิทยาการคำนวณ ม.1',
      icon: '💻',
      mastery: 15,
      colorClass: 'bg-kidpen-purple text-white',
      borderClass: 'border-kidpen-purple/20 hover:border-kidpen-purple/50',
      bgLightClass: 'bg-kidpen-purple/10',
      textClass: 'text-kidpen-purple',
    },
    {
      id: 'physics-m4',
      name: 'ฟิสิกส์ ม.4',
      icon: '⚡',
      mastery: 90,
      colorClass: 'bg-kidpen-orange text-white',
      borderClass: 'border-kidpen-orange/20 hover:border-kidpen-orange/50',
      bgLightClass: 'bg-kidpen-orange/10',
      textClass: 'text-kidpen-orange',
    },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Greeting and Header */}
      <div className="mb-8">
        <DynamicGreeting className="text-3xl font-bold font-thai text-kidpen-dark tracking-tight mb-2" />
        <p className="text-kidpen-dark/60 font-thai text-lg">มาเรียนรู้และสนุกไปกับการแก้ปัญหาด้วยกันเถอะ!</p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-kidpen-dark/50 uppercase tracking-widest font-sans">
              Overall Mastery (pyBKT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-kidpen-gold">56%</span>
              <span className="text-kidpen-dark/50 mb-1 font-thai">ความเข้าใจเฉลี่ย</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-kidpen-dark/50 uppercase tracking-widest font-sans">
              Current Scaffold Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-kidpen-blue bg-kidpen-blue/10 px-3 py-1 rounded inline-flex self-start">
                Level 2: Guided
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-kidpen-dark/50 uppercase tracking-widest font-sans">
              Active Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-thai text-kidpen-dark">
              {selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name : 'ยังไม่ได้เลือกวิชา'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Catalog */}
      <h2 className="text-2xl font-bold mb-6 font-thai text-kidpen-dark border-b border-kidpen-dark/10 pb-2">
        วิชาของฉัน (My Subjects)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            onClick={() => setSelectedSubject(subject.id)}
            className={cn(
              "bg-white border-2 p-6 rounded-3xl relative overflow-hidden group transition-all cursor-pointer h-[160px]",
              subject.borderClass,
              selectedSubject === subject.id ? "ring-4 ring-kidpen-gold/30 ring-offset-2" : ""
            )}
            style={{
              boxShadow: selectedSubject === subject.id ? '0 4px 0 0 rgba(245, 166, 35, 0.5)' : 'none',
              transform: selectedSubject === subject.id ? 'translateY(-2px)' : 'none',
            }}
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0", subject.bgLightClass)}></div>
            <div className="relative z-10 flex gap-4 h-full">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-transform shrink-0",
                subject.colorClass,
                "rotate-3 group-hover:rotate-6"
              )}>
                {subject.icon}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold mb-2 font-thai">{subject.name}</h3>
                <div className="flex flex-col gap-1 w-full">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", subject.colorClass)}
                      style={{ width: `${subject.mastery}%` }}
                    ></div>
                  </div>
                  <span className={cn("text-xs font-bold", subject.textClass)}>
                    {subject.mastery}% Mastery
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Start Button Area if subject selected */}
      {selectedSubject && (
        <div className="mt-12 flex justify-center animate-in fade-in duration-300">
          <button className="bg-kidpen-gold hover:bg-kidpen-goldHover active:bg-kidpen-goldHover/90 text-white font-bold py-4 px-12 rounded-full text-xl shadow-[0_4px_0_0_rgba(224,148,27,1)] active:shadow-[0_0_0_0_rgba(224,148,27,1)] active:translate-y-1 transition-all flex items-center gap-3 font-thai">
            🤖 เริ่มติวกับคิดเป็นเลย!
          </button>
        </div>
      )}
    </div>
  );
}
