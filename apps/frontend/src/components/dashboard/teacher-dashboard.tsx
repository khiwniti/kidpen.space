import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { DynamicGreeting } from '@/components/ui/dynamic-greeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TeacherDashboard() {
  const students = [
    { id: '1', name: 'ด.ญ. สมใจ รักเรียน', class: 'ม.1/1', pybkt: 85, active: true },
    { id: '2', name: 'ด.ช. ปิติ มานะ', class: 'ม.1/1', pybkt: 42, active: true },
    { id: '3', name: 'ด.ญ. วีณา ใจดี', class: 'ม.4/3', pybkt: 92, active: false },
    { id: '4', name: 'ด.ช. ชูใจ เก่งกาจ', class: 'ม.4/3', pybkt: 15, active: true },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Greeting and Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-thai text-kidpen-dark tracking-tight mb-2">Teacher Dashboard</h1>
          <p className="text-kidpen-dark/60 font-thai text-lg">ภาพรวมระบบ pyBKT Mastery Tracking และการโต้ตอบของนักเรียน</p>
        </div>
        <div className="bg-kidpen-blue/10 text-kidpen-blue px-4 py-2 rounded-full font-bold font-thai text-sm border border-kidpen-blue/20">
          โรงเรียนสาธิตฯ
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm bg-[#FFF8EF] border-kidpen-gold/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-kidpen-gold uppercase tracking-widest font-sans">
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-kidpen-dark">342</div>
            <div className="text-xs text-kidpen-dark/60 font-thai mt-1">กำลังเรียนในสัปดาห์นี้</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-kidpen-dark/50 uppercase tracking-widest font-sans">
              Avg. Scaffold Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-kidpen-blue">2.4</div>
            <div className="text-xs text-kidpen-dark/60 font-thai mt-1">Guided Mode โดยเฉลี่ย</div>
          </CardContent>
        </Card>

        <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-kidpen-dark/50 uppercase tracking-widest font-sans">
              Struggling KC's
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-red-500">12</div>
            <div className="text-xs text-kidpen-dark/60 font-thai mt-1">จุดประสงค์ที่นักเรียนติดขัด</div>
          </CardContent>
        </Card>

        <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-kidpen-dark/50 uppercase tracking-widest font-sans">
              Safety Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-kidpen-green">0</div>
            <div className="text-xs text-kidpen-dark/60 font-thai mt-1">ไม่มีเนื้อหาที่ไม่เหมาะสม</div>
          </CardContent>
        </Card>
      </div>

      {/* Class List Table */}
      <Card className="rounded-gummy border-kidpen-dark/5 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-kidpen-dark/5">
          <CardTitle className="font-thai font-bold text-xl text-kidpen-dark">นักเรียนที่ต้องการความช่วยเหลือด่วน</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 font-thai text-sm font-bold text-kidpen-dark/60 border-b border-gray-100">ชื่อ - นามสกุล</th>
                <th className="p-4 font-thai text-sm font-bold text-kidpen-dark/60 border-b border-gray-100">ระดับชั้น</th>
                <th className="p-4 font-thai text-sm font-bold text-kidpen-dark/60 border-b border-gray-100">สถานะ</th>
                <th className="p-4 font-thai text-sm font-bold text-kidpen-dark/60 border-b border-gray-100">pyBKT Mastery</th>
                <th className="p-4 font-thai text-sm font-bold text-kidpen-dark/60 border-b border-gray-100">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.sort((a,b) => a.pybkt - b.pybkt).map((student) => {
                let statusColor = student.pybkt >= 80 ? 'text-kidpen-green' : student.pybkt >= 40 ? 'text-kidpen-gold' : 'text-red-500';
                let indicator = student.pybkt >= 80 ? 'เข้าใจ' : student.pybkt >= 40 ? 'กำลังเรียนรู้' : 'สุ่มเสี่ยง';
                
                return (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-thai font-medium text-kidpen-dark">{student.name}</td>
                    <td className="p-4 font-thai text-kidpen-dark/70">{student.class}</td>
                    <td className="p-4">
                      {student.active ? (
                        <span className="flex items-center gap-2 text-xs font-thai text-kidpen-green">
                          <span className="w-2 h-2 rounded-full bg-kidpen-green animate-pulse"></span>
                          กำลังติวอยู่
                        </span>
                      ) : (
                        <span className="text-xs font-thai text-gray-400">ออฟไลน์</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", student.pybkt >= 80 ? 'bg-kidpen-green' : student.pybkt >= 40 ? 'bg-kidpen-gold' : 'bg-red-500')}
                            style={{ width: `${student.pybkt}%` }}
                          ></div>
                        </div>
                        <span className={cn("text-sm font-bold", statusColor)}>{student.pybkt}%</span>
                        <span className={cn("text-xs font-thai bg-opacity-10 px-2 py-0.5 rounded", statusColor, `bg-current`)}>{indicator}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="text-kidpen-blue hover:text-kidpen-blueHover font-thai text-sm font-bold underline decoration-2 underline-offset-4">
                        ดูบทสนทนา
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
