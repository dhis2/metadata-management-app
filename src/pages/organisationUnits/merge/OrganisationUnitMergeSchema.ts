import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { mergeFormSchemaBase } from '../../../components/merge'
import { createFormValidate } from '../../../lib'

const organisationUnitSchema = z.object({
    id: z.string(),
    displayName: z.string(),
    name: z.string(),
})

export const mergeFormSchema = mergeFormSchemaBase
    .extend({
        sources: z
            .array(organisationUnitSchema)
            .min(1, i18n.t('At least one source is required'))
            .default([]),
        target: organisationUnitSchema,
        dataApprovalMergeStrategy: z
            .enum(['LAST_UPDATED', 'DISCARD'])
            .default('LAST_UPDATED'),
        dataValueMergeStrategy: z
            .enum(['LAST_UPDATED', 'DISCARD'])
            .default('LAST_UPDATED'),
    })
    .transform((data) => ({
        ...data,
        sources: data.sources.map((source) => source.id),
        target: data.target.id,
    }))

export type OrganisationUnitMergeFormValues = z.input<typeof mergeFormSchema>

export const validate = createFormValidate(mergeFormSchema)
