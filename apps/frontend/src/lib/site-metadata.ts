/**
 * Site metadata configuration for Kidpen.space
 * Thai STEM Education Platform
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kidpen.space';

export const siteMetadata = {
  name: 'Kidpen',
  title: 'Kidpen.space - แพลตฟอร์ม STEM สำหรับเด็กไทย',
  description: 'Kidpen.space - แพลตฟอร์มการเรียนรู้ STEM แบบเกมมิฟิเคชันสำหรับเด็กไทย วิชาคณิตศาสตร์ วิทยาศาสตร์ โค้ดดิ้ง และฟิสิกส์ เรียนรู้อย่างสนุกสนาน ปลอดภัย และมีประสิทธิภาพ',
  url: baseUrl,
  keywords: 'Kidpen, STEM Education, Thai Education, คณิตศาสตร์, วิทยาศาสตร์, โค้ดดิ้ง, ฟิสิกส์, เด็กไทย, แพลตฟอร์มการเรียนรู้, Gamification, EdTech',
  // Subject themes for dynamic content
  subjects: {
    math: {
      name: 'คณิตศาสตร์',
      nameEn: 'Mathematics',
      color: '#2563EB',
      icon: '🔢',
    },
    science: {
      name: 'วิทยาศาสตร์',
      nameEn: 'Science',
      color: '#10B981',
      icon: '🔬',
    },
    coding: {
      name: 'โค้ดดิ้ง',
      nameEn: 'Coding',
      color: '#8B5CF6',
      icon: '💻',
    },
    physics: {
      name: 'ฟิสิกส์',
      nameEn: 'Physics',
      color: '#F97316',
      icon: '⚛️',
    },
    data: {
      name: 'ข้อมูล',
      nameEn: 'Data Science',
      color: '#14B8A6',
      icon: '📊',
    },
  },
  // Brand colors
  brand: {
    primary: '#F5A623',
    primaryLight: '#FFF0D4',
    primaryDark: '#C47A06',
  },
};
