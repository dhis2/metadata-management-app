import i18n from '@dhis2/d2-i18n'
import { RadioFieldFF, SingleSelectFieldFF } from '@dhis2/ui'
import React, { useEffect } from 'react'
import { Field, useField, useForm } from 'react-final-form'
import { HorizontalFieldGroup, StandardFormField } from '../../../components'
import { getConstantTranslation, SECTIONS_MAP, useSchema } from '../../../lib'
import { AnalyticsTablePhase } from '../../../types/generated'

const validateResourceTableType = (
    value: string | undefined,
    { phase }: { phase?: string }
) => {
    if (phase === AnalyticsTablePhase.RESOURCE_TABLE_POPULATED && !value) {
        return i18n.t('Required')
    }
}

const validateAnalyticsTableType = (
    value: string | undefined,
    { phase }: { phase?: string }
) => {
    if (phase === AnalyticsTablePhase.ANALYTICS_TABLE_POPULATED && !value) {
        return i18n.t('Required')
    }
}

const section = SECTIONS_MAP.analyticsTableHook

export function PhaseField() {
    const form = useForm()
    const schema = useSchema(section.name)
    const { input: phaseInput, meta: phaseMeta } = useField<string | undefined>(
        'phase',
        {
            subscription: { value: true, dirty: true },
        }
    )
    const selectedPhase = phaseInput.value

    const { input: analyticsTableInput, meta: analyticsTableMeta } = useField(
        'analyticsTableType',
        { subscription: { value: true, dirty: true, touched: true } }
    )
    const { input: resourceTableInput, meta: resourceTableMeta } = useField(
        'resourceTableType',
        { subscription: { value: true, dirty: true, touched: true } }
    )

    useEffect(() => {
        if (!phaseMeta.dirty) {
            return
        }
        if (selectedPhase === AnalyticsTablePhase.RESOURCE_TABLE_POPULATED) {
            form.change('analyticsTableType', undefined)
        } else if (
            selectedPhase === AnalyticsTablePhase.ANALYTICS_TABLE_POPULATED
        ) {
            form.change('resourceTableType', undefined)
        }
    }, [selectedPhase, phaseMeta.dirty, form])

    useEffect(() => {
        if (!analyticsTableMeta.dirty && !analyticsTableMeta.touched) {
            return
        }
        form.blur('analyticsTableType')
    }, [
        analyticsTableInput.value,
        analyticsTableMeta.dirty,
        analyticsTableMeta.touched,
        form,
    ])

    useEffect(() => {
        if (!resourceTableMeta.dirty && !resourceTableMeta.touched) {
            return
        }
        form.blur('resourceTableType')
    }, [
        resourceTableInput.value,
        resourceTableMeta.dirty,
        resourceTableMeta.touched,
        form,
    ])

    const phaseOptions =
        schema?.properties.phase?.constants?.map((constant) => ({
            value: constant,
            label: getConstantTranslation(constant),
        })) ?? []

    const resourceTableOptions =
        schema?.properties.resourceTableType?.constants?.map((constant) => ({
            value: constant,
            label: getConstantTranslation(constant),
        })) ?? []

    const analyticsTableOptions =
        schema?.properties.analyticsTableType?.constants?.map((constant) => ({
            value: constant,
            label: getConstantTranslation(constant),
        })) ?? []

    const showResourceTableField =
        selectedPhase === AnalyticsTablePhase.RESOURCE_TABLE_POPULATED
    const showAnalyticsTableField =
        selectedPhase === AnalyticsTablePhase.ANALYTICS_TABLE_POPULATED

    return (
        <>
            <StandardFormField>
                <HorizontalFieldGroup
                    label={i18n.t('Phase')}
                    required
                    dataTest="formfields-phase"
                >
                    {phaseOptions.map((option) => (
                        <Field<string | undefined>
                            key={option.value}
                            name="phase"
                            component={RadioFieldFF}
                            label={option.label}
                            type="radio"
                            value={option.value}
                        />
                    ))}
                </HorizontalFieldGroup>
            </StandardFormField>

            {showResourceTableField ? (
                <StandardFormField>
                    <Field
                        component={SingleSelectFieldFF}
                        name="resourceTableType"
                        label={i18n.t('Which resource table')}
                        options={resourceTableOptions}
                        validate={validateResourceTableType}
                        required
                        clearable
                        inputWidth="400px"
                        dataTest="formfields-resourceTableType"
                    />
                </StandardFormField>
            ) : null}

            {showAnalyticsTableField ? (
                <StandardFormField>
                    <Field
                        component={SingleSelectFieldFF}
                        name="analyticsTableType"
                        label={i18n.t('Which analytics table')}
                        options={analyticsTableOptions}
                        validate={validateAnalyticsTableType}
                        required
                        clearable
                        inputWidth="400px"
                        dataTest="formfields-analyticsTableType"
                    />
                </StandardFormField>
            ) : null}
        </>
    )
}
