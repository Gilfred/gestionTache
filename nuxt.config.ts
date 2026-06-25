// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4,
  },

  tailwindcss: {
    configPath: 'tailwind.config.js',
    exposeConfig: true,
    viewer: true,
  },

  app: {
    head: {
      script: [
        // Microsoft Clarity
        {
          type: 'text/javascript',
          innerHTML: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);
              t.async=1;
              t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];
              y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xckd2pk0ci");
          `
        },

        // Google Analytics
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-WP9JSZ10YF',
          async: true
        },
        {
          type: 'text/javascript',
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WP9JSZ10YF');
          `
        }
      ]
    }
  }
})