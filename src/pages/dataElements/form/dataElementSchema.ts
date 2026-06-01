import { z } from 'zod'
import {
    createFormValidate,
    DEFAULT_CATEGORY_COMBO,
    getDefaultsOld,
    modelFormSchemas,
} from '../../../lib'
import { DataElement } from '../../../types/generated'

const {
    identifiable,
    withAttributeValues,
    withDefaultListColumns,
    referenceCollection,
} = modelFormSchemas

const dataElementBaseSchema = z.object({
    shortName: z.string().trim(),
    code: z.string().trim().optional(),
    description: z.string().trim().optional(),
    formName: z.string().trim().optional(),
    url: z.string().trim().optional(),
    fieldMask: z.string().trim().optional(),
    style: z
        .object({
            color: z.string().optional(),
            icon: z.string().optional(),
        })
        .default({}),
    domainType: z.nativeEnum(DataElement.domainType),
    valueType: z
        .nativeEnum(DataElement.valueType)
        .default(DataElement.valueType.NUMBER),
    aggregationType: z
        .nativeEnum(DataElement.aggregationType)
        .default(DataElement.aggregationType.NONE),
    categoryCombo: z
        .object({ id: z.string(), displayName: z.string().optional() })
        .default(DEFAULT_CATEGORY_COMBO),
    optionSet: z
        .object({ id: z.string(), displayName: z.string().optional() })
        .optional(),
    commentOptionSet: z
        .object({ id: z.string(), displayName: z.string().optional() })
        .optional(),
    legendSets: z
        .array(z.object({ id: z.string(), displayName: z.string().optional() }))
        .default([]),
    aggregationLevels: z.array(z.number()).default([]),
    zeroIsSignificant: z.boolean().default(false),
    dataElementGroups: referenceCollection.default([]),
})
export const dataElementListSchema = dataElementBaseSchema
    .merge(withDefaultListColumns)
    .merge(withAttributeValues)
    .extend({
        name: z.string(),
    })

export const dataElementFormSchema = dataElementBaseSchema
    .merge(identifiable)
    .merge(withAttributeValues)

export const initialValues = getDefaultsOld(dataElementFormSchema)

export type DataElementFormValues = typeof initialValues

export const validate = createFormValidate(dataElementFormSchema)
