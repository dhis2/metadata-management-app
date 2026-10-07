import { z } from 'zod'
import { createFormValidate } from '../../../lib'
import { getDefaults } from '../../../lib/zod/getDefaults'

export type IconModel = {
    key: string
    description: string
    href: string
    custom: boolean
    keywords?: string[]
    lastUpdated?: string
    created?: string
    createdBy?: { displayName: string; id: string }
}

export const iconFormSchema = z.object({
    key: z.string(),
    description: z.string().optional(),
    keywords: z.string().optional(),
    file: z.any(),
})

export const initialValues = getDefaults(iconFormSchema)

export const validatingIconFormSchema = iconFormSchema.extend({
    key: z.string().min(1, 'Required'),
    file: z.any().refine((v) => v instanceof File, {
        message: 'An icon image is required',
    }),
})

export const validate = createFormValidate(validatingIconFormSchema)

export const keywordsToString = (keywords?: string[]) =>
    keywords?.join(', ') ?? ''

export const stringToKeywords = (keywords?: string) =>
    keywords
        ?.split(',')
        .map((k) => k.trim())
        .filter(Boolean) ?? []
