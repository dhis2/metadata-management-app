import i18n from '@dhis2/d2-i18n'
import { url as urlValidator } from '@dhis2/ui'
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

// mirrors FileResourceBlocklist in dhis2-core, which rejects these uploads
const BLOCKED_FILE_CONTENT_TYPES = new Set([
    'text/html',
    'text/css',
    'text/javascript',
    'font/otf',
    'application/x-shockwave-flash',
    'application/vnd.debian.binary-package',
    'application/x-rpm',
    'application/java-archive',
    'application/x-ms-dos-executable',
    'application/vnd.microsoft.portable-executable',
    'application/vnd.apple.installer+xml',
    'application/vnd.mozilla.xul+xml',
    'application/x-httpd-php',
    'application/x-sh',
    'application/x-csh',
])

export const BLOCKED_FILE_EXTENSIONS = new Set([
    'html',
    'htm',
    'css',
    'js',
    'mjs',
    'otf',
    'swf',
    'deb',
    'rpm',
    'jar',
    'jsp',
    'exe',
    'msi',
    'mpkg',
    'xul',
    'php',
    'bin',
    'sh',
    'csh',
    'bat',
])

const isAllowedResourceFile = (file: File) => {
    const name = file.name.toLowerCase()
    const extension = name.includes('.') ? name.split('.').pop() : ''
    return (
        !BLOCKED_FILE_EXTENSIONS.has(extension ?? '') &&
        !BLOCKED_FILE_CONTENT_TYPES.has(file.type.toLowerCase())
    )
}

const resourceBaseSchema = z
    .object({
        code: z.string().trim().nullable().optional(),
        resourceType: z.nativeEnum(ResourceType),
        url: z.string().trim().optional(),
        attachment: z.boolean().optional(),
        file: z.any().optional(),
    })
    .merge(identifiable)

const refineResourceTypeFields = (
    values: { resourceType: ResourceType; url?: string; file?: unknown },
    ctx: z.RefinementCtx
) => {
    if (values.resourceType === ResourceType.URL) {
        const urlError = values.url
            ? urlValidator(values.url)
            : i18n.t('A URL is required')
        if (urlError) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: urlError,
                path: ['url'],
            })
        }
    }

    if (values.resourceType === ResourceType.FILE) {
        if (!(values.file instanceof File)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: i18n.t('A file is required'),
                path: ['file'],
            })
        } else if (!isAllowedResourceFile(values.file)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: i18n.t('This file type is not allowed'),
                path: ['file'],
            })
        }
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
