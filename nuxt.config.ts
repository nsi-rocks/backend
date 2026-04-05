// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
    modules: [
    '@nuxt/eslint',
    'nuxt-auth-utils',
    'nuxt-authorization',
  ],
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    }
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
