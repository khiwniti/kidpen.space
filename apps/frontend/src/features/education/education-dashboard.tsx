/**
 * Education Dashboard — student home page for kidpen education platform.
 *
 * Features:
 *   - Time-based greeting (สวัสดีตอนเช้า/บ่าย/เย็น)
 *   -ak XP and streak display
 *   - Subject cards with mastery bars
 *   - Quick action: "ถาม AI" → tutor chat
 *   - Recent threads list
 */

'use client';

import { useEffect, useState } from 'react';
import { fetchSubjects, fetchMyMastery } from '@/lib/education/api-client';
import { SUBJECT_DETAILS } from '@/lib/education/types';
import type { EducationSubject, SubjectKey, MasteryState } from '@/lib/education/types';
import TutorChatPanel from '@/features/education/tutor-chat/tutor-chat-panel';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'สวัสดีตอนเช้า ☀️';
  if (hour < 17) return 'สวัสดีตอนบ่าย 🌤️';
  if (hour < 20) return 'สวัสดีตอนเย็น 🌅';
  return 'สวัสดีตอนค่ำ 🌙';
}

export default function EducationDashboard() {
  const [subjects, setSubjects] = useState<EducationSubject[]>([]);
  const [mastery, setMastery] = useState<MasteryState[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | undefined>();

  useEffect(() => {
    fetchSubjects().then(setSubjects).catch(console.error);
    fetchMyMastery().then((data) => setMastery(data.mastery)).catch(console.error);
  }, []);

  const openChat = (subject?: SubjectKey) => {
    setSelectedSubject(subject);
    setShowChat(true);
  };

  if (showChat) {
    return <TutorChatPanel key={selectedSubject} />;
  }

  return (
    <div className="min-h-screen bg-kidpen-background p-4 md:p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-kidpen-text">{getGreeting()}</h1>
        <p className="text-sm text-kidpen-text-secondary mt-1">
          วันนี้อยากเรียนอะไร? "คิดเป็น" พร้อมช่วยเสมอ!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-kidpen-surface rounded-2xl p-4">
          <p className="text-xs text-kidpen-text-secondary">XP สะสม</p>
          <p className="text-2xl font-bold text-kidpen-primary mt-1">---</p>
        </div>
        <div className="bg-kidpen-surface rounded-2xl p-4">
          <p className="text-xs text-kidpen-text-secondary">วันที่เรียนต่อเนื่อง</p>
          <p className="text-2xl font-bold text-kidpen-accent mt-1">--- 🔥</p>
        </div>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => openChat()}
        className="w-full bg-kidpen-primary text-white rounded-2xl py-4 text-lg font-medium hover:opacity-90 transition-opacity"
      >
        🧑‍🏫 ถาม "คิดเป็น"
      </button>

      {/* Subject Cards */}
      <div>
        <h2 className="text-lg font-semibold text-kidpen-text mb-3">วิชา</h2>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => {
            const subjectKey = subject.key as SubjectKey;
            const details = SUBJECT_DETAILS[subjectKey];
            const subjectMastery = mastery.find((m) =>
              m.kc_id.startsWith(subjectKey),
            );

            return (
              <button
                key={subject.key}
                onClick={() => openChat(subjectKey)}
                className="bg-kidpen-surface rounded-2xl p-4 text-left hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-2"
                  style={{ backgroundColor: details.color }}
                >
                  {details.name_th.charAt(0)}
                </div>
                <p className="font-medium text-kidpen-text text-sm">{details.name_th}</p>
                {subjectMastery && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-kidpen-border/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round(subjectMastery.p_mastery * 100)}%`,
                          backgroundColor: details.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-kidpen-text-secondary mt-1">
                      {Math.round(subjectMastery.p_mastery * 100)}% ชำนาญ
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}