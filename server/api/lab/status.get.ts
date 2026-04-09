import { getLabStatus } from '@@/server/utils/lab'

export default defineEventHandler(async (event) => {
    const open = await getLabStatus(event)
    return { open }
})
