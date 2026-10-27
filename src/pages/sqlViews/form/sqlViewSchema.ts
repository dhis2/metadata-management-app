import { z } from 'zod'
import { modelFormSchemas, createFormValidate } from '../../../lib'
import { getDefaults } from '../../../lib/zod/getDefaults'
import { CacheStrategy, SqlViewType } from '../../../types/generated'

const { identifiable, withAttributeValues, withDefaultListColumns } =
    modelFormSchemas

const sqlViewBaseSchema = z
    .object({
        type: z.nativeEnum(SqlViewType),
        cacheStrategy: z.nativeEnum(CacheStrategy),
        sqlQuery: z.string(),
        description: z.string().trim().optional(),
    })
    .merge(identifiable)

export const sqlViewListSchema = sqlViewBaseSchema.merge(withDefaultListColumns)

export const sqlViewFormSchema = sqlViewBaseSchema.merge(withAttributeValues)

export const initialValues = getDefaults(sqlViewFormSchema, {
    type: SqlViewType.VIEW,
    cacheStrategy: CacheStrategy.RESPECT_SYSTEM_SETTING,
})

export const validate = createFormValidate(sqlViewFormSchema)
