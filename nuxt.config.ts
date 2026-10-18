// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'FlowSpace — Modern Workflow & Project Management',
      htmlAttrs: {
        lang: 'th'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'FlowSpace — แพลตฟอร์มบริหารจัดการงานและจัดระเบียบเวิร์กโฟลว์เอนกประสงค์ รองรับคอลัมน์ยืดหยุ่น ระบบจัดการยศและสิทธิ์ (RBAC) และอัปเดตข้อมูลเรียลไทม์'
        },
        // Open Graph / Facebook / Discord / Line
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'FlowSpace' },
        { property: 'og:url', content: 'https://flow-space-card.vercel.app/' },
        { property: 'og:title', content: 'FlowSpace — Modern Workflow & Project Management' },
        {
          property: 'og:description',
          content: 'An elegant workflow and project management platform featuring flexible board columns, Role-Based Access Control (RBAC), and real-time collaboration.'
        },
        { property: 'og:image', content: 'https://flow-space-card.vercel.app/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'FlowSpace — Modern Workflow & Project Management' },
        // Twitter / X Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://flow-space-card.vercel.app/' },
        { name: 'twitter:title', content: 'FlowSpace — Modern Workflow & Project Management' },
        {
          name: 'twitter:description',
          content: 'An elegant workflow and project management platform featuring flexible board columns, Role-Based Access Control (RBAC), and real-time collaboration.'
        },
        { name: 'twitter:image', content: 'https://flow-space-card.vercel.app/og-image.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
        }
      ],
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('flowspace_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){}})();`
        }
      ]
    }
  },

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  tailwindcss: {
    config: {
      darkMode: 'class'
    }
  },

  future: {
    compatibilityVersion: 4,
  },

  nitro: {
    vercel: {
      regions: ['sin1']
    }
  }
})