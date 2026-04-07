const cloudflareDevConfigPath =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env?.CLOUDFLARE_DEV_CONFIG_PATH ?? './wrangler.jsonc'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    'nitro-cloudflare-dev',
    // Temporarily disabled - causes Cloudflare Workers global scope issue
    // 'nuxt-auth-utils',
    // 'nuxt-authorization',
  ],
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
    cloudflareDev: {
      configPath: cloudflareDevConfigPath,
    },
  },
  runtimeConfig: {
    mistral_api_key: ''
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
