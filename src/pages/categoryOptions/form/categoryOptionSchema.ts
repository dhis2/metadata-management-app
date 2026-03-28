import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { getDefaultsOld, modelFormSchemas } from '../../../lib'
import { createFormValidate } from '../../../lib/form/validate'
import { CategoryOptionFormValues } from '../Edit'

const {
    withAttributeValues,
    identifiable,
    referenceCollection,
    withDefaultListColumns,
} = modelFormSchemas

export const categoryOptionFormSchema = identifiable
    .merge(withAttributeValues)
    .extend({
        code: z.string().trim().optional(),
        shortName: z.string().trim(),
        formName: z
            .string()
            .trim()
            .max(230, {
                message: i18n.t('Form name should not exceed 230 characters'),
            })
            .optional(),
        description: z.string().trim().optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        organisationUnits: referenceCollection.optional(),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return data.startDate <= data.endDate
            }
            return true
        },
        {
            message: i18n.t('End date should be after start date'),
            path: ['endDate'],
        }
    )

export const categoryOptionListSchema = withDefaultListColumns.extend({
    displayShortName: z.string(),
})

export const initialValues = getDefaultsOld(
    categoryOptionFormSchema
) as Partial<CategoryOptionFormValues>

export const validate = createFormValidate(categoryOptionFormSchema)

export const transformFormValues = <
    TValues extends Partial<CategoryOptionFormValues>
>(
    values: TValues
) => {
    return {
        ...values,
        sharing: {
            public: 'rwrw----',
        },
    }
}
