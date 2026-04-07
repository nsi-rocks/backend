export default defineEventHandler(async (event) => {
  const db = useDb(event);
  const config = useRuntimeConfig();
  const result = await db.select().from(t.users).all();
  return {
    users: result,
    test: config.mistral_api_key
  }
})
