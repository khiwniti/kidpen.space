export const siteConfig = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://kidpen.space',
  nav: {
    links: [
      { id: 1, name: 'หน้าแรก', href: '/' },
      { id: 2, name: 'เกี่ยวกับคิดเป็น', href: '/about' },
      { id: 3, name: 'สำหรับโรงเรียน', href: '/schools' },
      { id: 4, name: 'บทเรียน', href: '/lessons' },
    ],
  },
  hero: {
    description:
      'คิดเป็น (Kidpen) - แพลตฟอร์มการเรียนรู้โสคราติสสำหรับเด็กไทย (Socratic Tutoring Platform)',
  },
  footerLinks: [
    {
      title: 'คิดเป็น (Kidpen)',
      links: [
        { id: 1, title: 'เกี่ยวกับเรา', url: '/about' },
        { id: 2, title: 'สำหรับคุณครู', url: '/teachers' },
        { id: 3, title: 'ศูนย์ช่วยเหลือ', url: '/support' },
        { id: 4, title: 'ติดต่อเรา', url: 'mailto:info@kidpen.space' },
      ],
    },
    {
      title: 'แหล่งเรียนรู้',
      links: [
        { id: 5, title: 'บทเรียนทั้งหมด', url: '/lessons' },
        { id: 6, title: 'เอกสารประกอบ', url: 'https://github.com/kidpen/kidpen-space' },
        { id: 7, title: 'GitHub', url: 'https://github.com/kidpen/kidpen-space' },
      ],
    },
    {
      title: 'กฏหมายและนโยบาย',
      links: [
        { id: 8, title: 'นโยบายความเป็นส่วนตัว (PDPA)', url: '/legal?tab=privacy' },
        { id: 9, title: 'ข้อตกลงการใช้งาน', url: '/legal?tab=terms' },
        { id: 10, title: 'สัญญาอนุญาต (License)', url: 'https://github.com/kidpen/kidpen-space/blob/main/LICENSE' },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
