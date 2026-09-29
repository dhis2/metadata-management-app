import { z } from 'zod'
import {
    getDefaultsOld,
    createFormValidate,
    modelFormSchemas,
} from '../../../lib'

/*  Note that this describes what we send to the server,
    and not what is stored in the form. */
const { identifiable, withDefaultListColumns, withAttributeValues } =
    modelFormSchemas

const organisationUnitGroupBaseSchema = z.object({
    code: z.string().trim().optional(),
})

export const organisationUnitGroupFormSchema = identifiable
    .merge(withAttributeValues)
    .merge(organisationUnitGroupBaseSchema)
    .extend({
        shortName: z.string().trim(),
        description: z.string().trim().optional(),
        color: z.string().optional(),
        symbol: z.string().optional(),
        organisationUnits: z.array(z.object({ id: z.string() })),
    })

export const organisationUnitGroupListSchema = withDefaultListColumns
    .merge(organisationUnitGroupBaseSchema)
    .extend({
        displayShortName: z.string(),
    })

export const initialValues = getDefaultsOld(organisationUnitGroupFormSchema)

export const validate = createFormValidate(organisationUnitGroupFormSchema)
