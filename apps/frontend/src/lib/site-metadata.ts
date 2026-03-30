/**
 * Site metadata configuration for Kidpen.space
 * Thai STEM Education Platform
 * 
 * Uses brand identity from ./brand-identity.ts
 */

import { brandIdentity, brandColors } from './brand-identity';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kidpen.space';

export const siteMetadata = {
  // Core identity
  name: brandIdentity.name,
  nameThai: brandIdentity.nameThai,
  title: `${brandIdentity.name}.space - ${brandIdentity.tagline}`,
  description: `${brandIdentity.name}.space - ${brandIdentity.tagline} (${brandIdentity.taglineEn}) สำหรับนักเรียน ม.1-ม.6 วิชาคณิตศาสตร์ วิทยาศาสตร์ โค้ดดิ้ง และฟิสิกส์`,
  url: baseUrl,
  keywords: [
    'Kidpen',
    'คิดเป็น',
    'STEM Education',
    'Thai Education',
    'Socratic Tutoring',
    'การเรียนรู้แบบโสคราติส',
    'คณิตศาสตร์',
    'วิทยาศาสตร์',
    'โค้ดดิ้ง',
    'ฟิสิกส์',
    'เด็กไทย',
    'ม.1-ม.6',
    'สสวท.',
    'IPST',
    'AI Tutor',
    'EdTech Thailand',
  ].join(', '),
  
  // Subject themes for dynamic content
  subjects: {
    math: {
      name: brandColors.subjects.math.name,
      nameEn: brandColors.subjects.math.nameEn,
      color: brandColors.subjects.math.primary,
      icon: brandColors.subjects.math.icon,
    },
    science: {
      name: brandColors.subjects.science.name,
      nameEn: brandColors.subjects.science.nameEn,
      color: brandColors.subjects.science.primary,
      icon: brandColors.subjects.science.icon,
    },
    coding: {
      name: brandColors.subjects.coding.name,
      nameEn: brandColors.subjects.coding.nameEn,
      color: brandColors.subjects.coding.primary,
      icon: brandColors.subjects.coding.icon,
    },
    physics: {
      name: brandColors.subjects.physics.name,
      nameEn: brandColors.subjects.physics.nameEn,
      color: brandColors.subjects.physics.primary,
      icon: brandColors.subjects.physics.icon,
    },
    data: {
      name: brandColors.subjects.data.name,
      nameEn: brandColors.subjects.data.nameEn,
      color: brandColors.subjects.data.primary,
      icon: brandColors.subjects.data.icon,
    },
  },
  
  // Brand colors (for external use)
  brand: {
    primary: brandColors.brand.gold,
    primaryLight: brandColors.brand.goldLight,
    primaryDark: brandColors.brand.goldDark,
  },
  
  // Social links
  social: {
    github: 'https://github.com/kidpen-ai/kidpen.space',
    email: 'info@kidpen.space',
  },
  
  // Target audience
  audience: brandIdentity.audience,
};

export type SiteMetadata = typeof siteMetadata;
