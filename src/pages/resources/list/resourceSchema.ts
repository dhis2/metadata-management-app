import { z } from 'zod'
import { modelFormSchemas } from '../../../lib'

const { identifiable, withDefaultListColumns } = modelFormSchemas

export const resourceListSchema = z
    .object({
        code: z.string().or(z.null()),
        external: z.boolean(),
        url: z.string(),
    })
    .merge(identifiable)
    .merge(withDefaultListColumns)
