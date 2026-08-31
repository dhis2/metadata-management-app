import i18n from '@dhis2/d2-i18n'
import { SingleSelectFieldFF } from '@dhis2/ui'
import React, { useMemo } from 'react'
import { Field as FieldRFF, useFormState } from 'react-final-form'
import type { ProgramStage, DataElement } from '../../../../../types/generated'

export function NextScheduleDateField() {
    const { values } = useFormState({ subscription: { values: true } })
    const stage = values as Partial<ProgramStage>

    const options = useMemo(() => {
        const dataElements =
            stage?.programStageDataElements
                ?.map((psde) => psde.dataElement)
                .filter(
                    (de): de is DataElement => !!de && de.valueType === 'DATE'
                ) || []

        return [
            { label: i18n.t('None'), value: '' },
            ...dataElements.map((de) => ({
                value: de.id,
                label: de.displayName,
            })),
        ]
    }, [stage?.programStageDataElements])

    return (
        <FieldRFF
            name="nextScheduleDate"
            format={(value) => (value?.id ? value.id : '')}
            parse={(value) =>
                value && value !== '' ? { id: value } : undefined
            }
            render={({ input, meta }) => (
                <SingleSelectFieldFF
                    input={input}
                    meta={meta}
                    label={i18n.t('Default next scheduled date')}
                    helpText={i18n.t(
                        'If set, this date sets the next scheduled date. Standard interval days is used if the date is empty.'
                    )}
                    dataTest="formfields-nextScheduleDate"
                    inputWidth="400px"
                    options={options}
                />
            )}
        />
    )
}
