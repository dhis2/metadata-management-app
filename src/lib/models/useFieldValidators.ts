import { Validator } from '@dhis2/ui'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { SchemaSection } from '../../types'
import { composeAsyncValidators, required } from '../form'
import { useSchema } from '../schemas'
import {
    checkMaxLengthFromProperty,
    checkMaxValueFromProperty,
    checkMinLengthFromProperty,
    checkMinValueFromProperty,
    useIsFieldValueUnique,
} from './validators'

export function useValidator({
    schemaSection,
    property,
    modelId,
    caseSensitive = false,
    customValidator,
}: {
    schemaSection: SchemaSection
    property: string
    modelId?: string
    caseSensitive?: boolean
    customValidator?: Validator
}) {
    const schema = useSchema(schemaSection.name)
    const propertyDetails = schema.properties[property]
    const params = useParams()
    const resolvedModelId = modelId ?? params.id
    const checkIsValueTaken = useIsFieldValueUnique({
        model: schemaSection.namePlural,
        field: property,
        id: resolvedModelId,
        caseSensitive,
    }) as Validator

    const validators = useMemo(() => {
        const validatorsList: Validator[] = []
        if (propertyDetails.propertyType !== 'INTEGER') {
            if (propertyDetails.max !== undefined) {
                validatorsList.push(checkMaxLengthFromProperty(propertyDetails))
            }
            if (propertyDetails.min !== undefined) {
                validatorsList.push(checkMinLengthFromProperty(propertyDetails))
            }
        }

        if (propertyDetails.propertyType === 'INTEGER') {
            if (propertyDetails.max !== undefined) {
                validatorsList.push(checkMaxValueFromProperty(propertyDetails))
            }
            if (propertyDetails.min !== undefined) {
                validatorsList.push(checkMinValueFromProperty(propertyDetails))
            }
        }
        if (propertyDetails.unique) {
            validatorsList.push(checkIsValueTaken)
        }
        if (propertyDetails.required) {
            validatorsList.push(required)
        }
        if (customValidator) {
            validatorsList.push(customValidator)
        }

        return validatorsList
    }, [propertyDetails, checkIsValueTaken, customValidator])

    return useMemo(
        () => composeAsyncValidators<string>(validators),
        [validators]
    )
}
