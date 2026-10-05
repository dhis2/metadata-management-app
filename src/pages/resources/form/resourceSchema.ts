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

// zod's url() accepts any scheme URL can parse (e.g. javascript:), so also
// restrict to the protocols that make sense for a linked resource
const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'ftp:']

const isValidResourceUrl = (value: string) => {
    if (!z.string().url().safeParse(value).success) {
        return false
    }
    return ALLOWED_URL_PROTOCOLS.includes(new URL(value).protocol)
}

const resourceBaseSchema = z
    .object({
        code: z.string().trim().nullable().optional(),
        resourceType: z.nativeEnum(ResourceType),
        url: z.string().trim().optional(),
        attachment: z.boolean(),
        file: z.any().optional(),
    })
    .merge(identifiable)

const refineResourceTypeFields = (
    values: { resourceType: ResourceType; url?: string; file?: unknown },
    ctx: z.RefinementCtx
) => {
    if (values.resourceType === ResourceType.URL) {
        if (!values.url) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: i18n.t('A URL is required'),
                path: ['url'],
            })
        } else if (!isValidResourceUrl(values.url)) {
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
}

const resourceFormSchema = resourceBaseSchema
    .merge(withAttributeValues)
    .superRefine(refineResourceTypeFields)

export const resourceNewInitialValues = getDefaults(resourceFormSchema, {
    resourceType: ResourceType.FILE,
    attachment: false,
})

export const validateResourceForm = createFormValidate(resourceFormSchema)
