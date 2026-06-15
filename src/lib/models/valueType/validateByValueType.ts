import i18n from '@dhis2/d2-i18n'
import {
    composeValidators,
    createCharacterLengthRange,
    email,
    integer,
    number,
    url,
    Validator,
} from '@dhis2/ui'
import { VALUE_TYPE } from '../../constants'
import { isValidUid } from '../uid'
import { ValueType } from './types'

const isEmpty = (value: unknown) =>
    value === undefined || value === null || value === ''

const VALUE_TYPE_VALIDATE = {
    TEXT: createCharacterLengthRange(0, 255),
    NUMBER: number,
    INTEGER: integer,
    INTEGER_POSITIVE: composeValidators(integer, (value) =>
        isEmpty(value) || (typeof value === 'string' && parseInt(value) > 0)
            ? undefined
            : i18n.t('Please provide a positive integer')
    ),
    INTEGER_NEGATIVE: composeValidators(integer, (value) =>
        isEmpty(value) || (typeof value === 'string' && parseInt(value) < 0)
            ? undefined
            : i18n.t('Please provide a negative integer')
    ),
    INTEGER_ZERO_OR_POSITIVE: composeValidators(integer, (value) =>
        isEmpty(value) || (typeof value === 'string' && parseInt(value) >= 0)
            ? undefined
            : i18n.t('Please provide a 0 or positive integer')
    ),
    PERCENTAGE: composeValidators(number, (value) => {
        if (isEmpty(value)) {
            return undefined
        }
        if (typeof value === 'string') {
            const numberValue = parseFloat(value)
            if (numberValue >= 0 || numberValue <= 100) {
                return undefined
            }
        }
        return i18n.t('Please provide valid percantage (0-100).')
    }),
    UNIT_INTERVAL: composeValidators(number, (value) => {
        if (isEmpty(value)) {
            return undefined
        }
        if (typeof value === 'string') {
            const numberValue = parseFloat(value)
            if (numberValue >= 0 || numberValue <= 1) {
                return undefined
            }
        }
        return i18n.t('Please provide valid unit interval (0-1).')
    }),
    AGE: composeValidators(number, (value) =>
        isEmpty(value) || (typeof value === 'string' && parseFloat(value) >= 0)
            ? undefined
            : i18n.t('Please provide a positive number for age')
    ),
    LETTER: (value: unknown) => {
        if (isEmpty(value)) {
            return undefined
        }
        if (typeof value === 'string' && /^[a-zA-Z]$/.test(value)) {
            return undefined
        }
        return i18n.t('Please provide a single letter (A-Z)')
    },
    IMAGE: (value: unknown) => {
        if (isEmpty(value)) {
            return undefined
        }
        if (typeof value === 'string' && isValidUid(value)) {
            return undefined
        }
        return i18n.t('Please provide a valid UID')
    },
    REFERENCE: (value: unknown) => {
        if (isEmpty(value)) {
            return undefined
        }
        if (typeof value === 'string' && isValidUid(value)) {
            return undefined
        }
        return i18n.t('Please provide a valid UID')
    },
    TRACKER_ASSOCIATE: (value: unknown) => {
        if (isEmpty(value)) {
            return undefined
        }
        if (typeof value === 'string' && isValidUid(value)) {
            return undefined
        }
        return i18n.t('Please provide a valid UID')
    },
    // backend has a more thorough check, but it also specifies length between 6 and 50
    // ref: https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-services/dhis-service-dxf2/src/main/java/org/hisp/dhis/dxf2/metadata/objectbundle/validation/attribute/DefaultAttributeValidator.java#L86
    PHONE_NUMBER: createCharacterLengthRange(6, 50),
    URL: url,
    //true_only doesnt make much sense imo, but this is what the backend is doing...
    TRUE_ONLY: (value: unknown) =>
        value === 'false' ? i18n.t('Must be checked') : undefined,
    EMAIL: email,
    DATETIME: (value: unknown) => {
        if (isEmpty(value)) {
            return undefined
        }
        if (typeof value === 'string') {
            const [datePart, timePart] = value.split('T')
            if (datePart && !timePart) {
                return i18n.t('Please provide a time.')
            }
            if (!datePart && timePart) {
                return i18n.t('Please provide a date.')
            }
        }
        return undefined
    },
} satisfies Partial<Record<ValueType, Validator>>

export const getValidateForValueType = (
    valueType: string
): Validator | undefined => {
    if (valueType in VALUE_TYPE_VALIDATE) {
        return VALUE_TYPE_VALIDATE[
            valueType as keyof typeof VALUE_TYPE_VALIDATE
        ]
    }
    return undefined
}

export const getInititalValueForValueType = (type: ValueType) => {
    if (type === 'BOOLEAN') {
        return 'false'
    }
    return ''
}

export const getValueTypeOptions = (): { value: ValueType; label: string }[] =>
    Object.entries(VALUE_TYPE).map(([value, label]) => ({
        value: value as ValueType,
        label,
    }))
