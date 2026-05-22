import { z } from 'zod'
import { modelFormSchemas, createFormValidate } from '../../../lib'
import { getDefaults } from '../../../lib/zod/getDefaults'
import { SqlView } from '../../../types/generated'

const { identifiable, withAttributeValues, withDefaultListColumns } =
    modelFormSchemas

const sqlViewBaseSchema = z
    .object({
        type: z.nativeEnum(SqlView.type),
        cacheStrategy: z.nativeEnum(SqlView.cacheStrategy),
        sqlQuery: z.string(),
        description: z.string().trim().optional(),
    })
    .merge(identifiable)

export const sqlViewListSchema = sqlViewBaseSchema.merge(withDefaultListColumns)

export const sqlViewFormSchema = sqlViewBaseSchema.merge(withAttributeValues)

export const initialValues = getDefaults(sqlViewFormSchema, {
    type: SqlView.type.VIEW,
    cacheStrategy: SqlView.cacheStrategy.RESPECT_SYSTEM_SETTING,
})

export const validate = createFormValidate(sqlViewFormSchema)
