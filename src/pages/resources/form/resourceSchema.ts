import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { modelFormSchemas, createFormValidate } from '../../../lib'
import { getDefaults } from '../../../lib/zod/getDefaults'

const { identifiable, withAttributeValues } = modelFormSchemas

export enum ResourceType {
    FILE = 'file',
    URL = 'url',
}

export const resourceTypeOptions = [
    { value: ResourceType.FILE, label: i18n.t('File') },
    { value: ResourceType.URL, label: i18n.t('URL') },
]

const resourceNewBaseSchema = z
    .object({
        // documents can have a null code (unlike most other schemas)
        code: z.string().trim().nullable().optional(),
        resourceType: z.nativeEnum(ResourceType),
        url: z.string().trim().optional(),
        attachment: z.boolean(),
        file: z.any().optional(),
    })
    .merge(identifiable)

export const resourceNewFormSchema = resourceNewBaseSchema
    .merge(withAttributeValues)
    .superRefine((values, ctx) => {
        if (values.resourceType === ResourceType.URL) {
            if (!values.url) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: i18n.t('A URL is required'),
                    path: ['url'],
                })
            } else if (!z.string().url().safeParse(values.url).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: i18n.t('Enter a valid URL'),
                    path: ['url'],
                })
            }
        }

        if (
            values.resourceType === ResourceType.FILE &&
            !(values.file instanceof File)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: i18n.t('A file is required'),
                path: ['file'],
            })
        }
    })

export const resourceNewInitialValues = getDefaults(resourceNewFormSchema, {
    resourceType: ResourceType.FILE,
    attachment: false,
})

export const validateResourceNewForm = createFormValidate(resourceNewFormSchema)

const resourceEditBaseSchema = z
    .object({
        // documents can have a null code (unlike most other schemas)
        code: z.string().trim().nullable().optional(),
        url: z
            .string()
            .trim()
            .min(1, i18n.t('A URL is required'))
            .url({
                message: i18n.t('Enter a valid URL'),
            }),
    })
    .merge(identifiable)

export const resourceEditFormSchema =
    resourceEditBaseSchema.merge(withAttributeValues)

export const validateResourceEditForm = createFormValidate(
    resourceEditFormSchema
)
