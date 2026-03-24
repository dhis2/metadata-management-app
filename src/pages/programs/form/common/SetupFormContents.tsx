import { useTimeZoneConversion } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, Field, IconAdd16, Input, InputFieldFF } from '@dhis2/ui'
import React, { useCallback, useEffect } from 'react'
import {
    Field as FieldRFF,
    useField,
    useForm,
    useFormState,
} from 'react-final-form'
import { useHref } from 'react-router'
import {
    CodeField,
    ColorAndIconField,
    DescriptionField,
    EditableInputWrapper,
    FeatureTypeField,
    NameField,
    SectionedFormSection,
    ShortNameField,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import {
    ModelSingleSelectFormField,
    useRefreshModelSingleSelect,
} from '../../../../components/metadataFormControls/ModelSingleSelect'
import {
    DEFAULT_CATEGORYCOMBO_SELECT_OPTION,
    selectedLocale,
    useSchemaSectionHandleOrThrow,
} from '../../../../lib'
import { DisplayableModel } from '../../../../types/models'
import {
    CompleteEventsExpiryDaysField,
    DisplayFrontPageListField,
    ExpiryDaysWithPeriodTypeField,
    OpenDaysAfterCoEndDateField,
} from '../fields'
import setupClasses from './SetupFormContents.module.css'

const CATEGORY_COMBOS_QUERY = {
    resource: 'categoryCombos',
    params: {
        filter: ['dataDimensionType:eq:ATTRIBUTE'],
        fields: ['id', 'displayName', 'name'],
    },
}

const addDefaultCategoryComboTransform = <TCatCombo extends DisplayableModel>(
    catCombos: TCatCombo[]
) => [DEFAULT_CATEGORYCOMBO_SELECT_OPTION, ...catCombos]

export const SetupFormContents = React.memo(function SetupFormContents({
    name,
    isTrackerProgram = true,
}: {
    name: string
    isTrackerProgram?: boolean
}) {
    const { input: versionInput, meta: versionMeta } = useField('version')
    const version = Number(versionInput.value) || 0

    const { values } = useFormState({ subscription: { values: true } })
    const form = useForm()

    const refreshCategoryCombos = useRefreshModelSingleSelect({
        resource: 'categoryCombos',
    })
    const newCategoryComboLink = useHref('/categoryCombos/new')
    const { fromServerDate } = useTimeZoneConversion()
    const schemaSection = useSchemaSectionHandleOrThrow()

    useEffect(() => {
        if (
            values.categoryCombo?.id === DEFAULT_CATEGORYCOMBO_SELECT_OPTION.id
        ) {
            form.change('openDaysAfterCoEndDate', 0)
        }
    }, [values.categoryCombo, form])

    const categoryComboInputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                onRefresh={() => refreshCategoryCombos()}
                onAddNew={() => window.open(newCategoryComboLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refreshCategoryCombos, newCategoryComboLink]
    )

    return (
        <SectionedFormSection name={name}>
            <StandardFormSectionTitle>
                {i18n.t('Program Details')}
            </StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {i18n.t('Set up the basic information for this program.')}
            </StandardFormSectionDescription>
            <StandardFormField>
                <NameField schemaSection={schemaSection} />
            </StandardFormField>

            <StandardFormField>
                <ShortNameField schemaSection={schemaSection} />
            </StandardFormField>

            <StandardFormField>
                <CodeField schemaSection={schemaSection} />
            </StandardFormField>
            <StandardFormField>
                <DescriptionField />
            </StandardFormField>
            <StandardFormField>
                <ColorAndIconField />
            </StandardFormField>
            <StandardFormField>
                <Field
                    label={i18n.t('Version')}
                    helpText={
                        values.lastUpdated
                            ? i18n.t(
                                  'Updated to version {{version}} on {{date}}',
                                  {
                                      version: versionMeta.initial ?? version,
                                      date: new Intl.DateTimeFormat(
                                          selectedLocale,
                                          { dateStyle: 'medium' }
                                      ).format(
                                          fromServerDate(values.lastUpdated)
                                      ),
                                  }
                              )
                            : undefined
                    }
                >
                    <div className={setupClasses.versionFieldRow}>
                        <Input
                            value={String(version)}
                            readOnly
                            dense
                            width="80px"
                            dataTest="formfields-version"
                        />
                        <Button
                            small
                            secondary
                            icon={<IconAdd16 />}
                            onClick={() => versionInput.onChange(version + 1)}
                            dataTest="formfields-version-increment"
                            title={i18n.t('New version')}
                        >
                            {i18n.t('New version')}
                        </Button>
                        {versionMeta.dirty && (
                            <Button
                                small
                                secondary
                                onClick={() =>
                                    versionInput.onChange(versionMeta.initial)
                                }
                                dataTest="formfields-version-reset"
                                title={i18n.t('Reset version')}
                            >
                                {i18n.t('Reset version')}
                            </Button>
                        )}
                    </div>
                </Field>
            </StandardFormField>
            {!isTrackerProgram && (
                <StandardFormField>
                    <FeatureTypeField />
                </StandardFormField>
            )}
            <StandardFormField>
                <ModelSingleSelectFormField
                    inputWidth={'400px'}
                    name="categoryCombo"
                    dataTest="formfields-categorycombo"
                    label={i18n.t('Event category combination')}
                    query={CATEGORY_COMBOS_QUERY}
                    transform={addDefaultCategoryComboTransform}
                    inputWrapper={categoryComboInputWrapper}
                />
            </StandardFormField>

            <StandardFormField>
                <ExpiryDaysWithPeriodTypeField />
            </StandardFormField>
            <StandardFormField>
                <CompleteEventsExpiryDaysField />
            </StandardFormField>
            {values.categoryCombo?.id !==
                DEFAULT_CATEGORYCOMBO_SELECT_OPTION.id && (
                <StandardFormField>
                    <OpenDaysAfterCoEndDateField
                        categoryCombinationDisplayName={
                            values.categoryCombo?.displayName ?? ''
                        }
                    />
                </StandardFormField>
            )}
            {isTrackerProgram && (
                <StandardFormField>
                    <FieldRFF
                        name="minAttributesRequiredToSearch"
                        component={InputFieldFF}
                        type="number"
                        min="0"
                        inputWidth="200px"
                        label={i18n.t(
                            'Minimum number of attributes required to search'
                        )}
                        dataTest="formfields-minattributesrequiredtosearch"
                        format={(value: unknown) => {
                            if (value === undefined || value === null) {
                                return ''
                            }
                            if (
                                typeof value === 'number' ||
                                typeof value === 'string'
                            ) {
                                return String(value)
                            }
                            return ''
                        }}
                        parse={(value: unknown) => {
                            if (value === undefined || value === '') {
                                return 0
                            }
                            return Number.parseInt(value as string, 10)
                        }}
                    />
                </StandardFormField>
            )}
            {isTrackerProgram && (
                <StandardFormField>
                    <FieldRFF
                        name="maxTeiCountToReturn"
                        component={InputFieldFF}
                        type="number"
                        min="0"
                        inputWidth="200px"
                        label={i18n.t(
                            'Maximum number of search results to display'
                        )}
                        helpText={i18n.t('Entering 0 shows all search results')}
                        dataTest="formfields-maxteicounttoreturn"
                        format={(value: unknown) => {
                            if (value === undefined || value === null) {
                                return ''
                            }
                            if (
                                typeof value === 'number' ||
                                typeof value === 'string'
                            ) {
                                return String(value)
                            }
                            return ''
                        }}
                        parse={(value: unknown) => {
                            if (value === undefined || value === '') {
                                return 0
                            }
                            return Number.parseInt(value as string, 10)
                        }}
                    />
                </StandardFormField>
            )}
            {isTrackerProgram && (
                <StandardFormField>
                    <DisplayFrontPageListField />
                </StandardFormField>
            )}
        </SectionedFormSection>
    )
})
