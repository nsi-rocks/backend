export default defineNitroPlugin((nitroApp) => {
// Temporarily disabled - module causing Cloudflare Workers deployment error
// export default defineNitroPlugin((nitroApp) => {
//   nitroApp.hooks.hook('request', async (event) => {
//     event.context.$authorization = {
//       resolveServerUser: async () => {
//         const session = await getUserSession(event)
//         return session.user ?? null
//       },
//     }
//   })
// })
