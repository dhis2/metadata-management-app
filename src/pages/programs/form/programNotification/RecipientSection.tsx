import i18n from '@dhis2/d2-i18n'
import {
    CheckboxFieldFF,
    SingleSelectFieldFF,
    TextAreaFieldFF,
} from '@dhis2/ui'
import React, { useEffect, useMemo } from 'react'
import {
    useField,
    Field as FieldRFF,
    useForm,
    useFormState,
} from 'react-final-form'
import { StandardFormField } from '../../../../components'
import { ModelSingleSelectFormField } from '../../../../components/metadataFormControls/ModelSingleSelect'
import { getConstantTranslation } from '../../../../lib'
import { DeliveryChannelsField } from '../../../dataSetNotificationTemplates/form/DeliveryChannelsField'

const programRecipientOptions = [
    {
        label: i18n.t('Tracked entity'),
        value: 'TRACKED_ENTITY_INSTANCE',
    },
    {
        label: getConstantTranslation('ORGANISATION_UNIT_CONTACT'),
        value: 'ORGANISATION_UNIT_CONTACT',
    },
    {
        label: getConstantTranslation('USERS_AT_ORGANISATION_UNIT'),
        value: 'USERS_AT_ORGANISATION_UNIT',
    },
    { label: getConstantTranslation('USER_GROUP'), value: 'USER_GROUP' },
    {
        label: getConstantTranslation('PROGRAM_ATTRIBUTE'),
        value: 'PROGRAM_ATTRIBUTE',
    },
    { label: getConstantTranslation('WEB_HOOK'), value: 'WEB_HOOK' },
]

const programStageRecipientOptions = [
    ...programRecipientOptions,
    { label: getConstantTranslation('DATA_ELEMENT'), value: 'DATA_ELEMENT' },
]

type ProgramTrackedEntityAttribute = {
    id: string
    trackedEntityAttribute: {
        id: string
        displayName: string
        valueType: string
    }
}

type ProgramWithTEAs = {
    id: string
    displayName: string
    programTrackedEntityAttributes?: ProgramTrackedEntityAttribute[]
}

type ProgramStageWithDEs = {
    programStageDataElements?: {
        dataElement: { id: string; valueType: string; displayName: string }
    }[]
}

export const RecipientSection = ({
    isStageNotification,
    isTrackerProgram,
}: {
    isStageNotification: boolean
    isTrackerProgram: boolean
}) => {
    const { input: recipientInput, meta: recipientMeta } = useField(
        'notificationRecipient',
        {
            subscription: { value: true },
        }
    )
    const { initialValues, values } = useFormState({
        subscription: { initialValues: true, values: true },
    })
    const form = useForm()

    const shouldIncludeDeliveryChannel =
        recipientInput.value === 'ORGANISATION_UNIT_CONTACT' ||
        recipientInput.value === 'TRACKED_ENTITY_INSTANCE'

    useEffect(() => {
        if (!shouldIncludeDeliveryChannel) {
            form.change('deliveryChannels', undefined)
        }
        if (recipientInput.value !== 'USER_GROUP') {
            form.change('notifyUsersInHierarchyOnly', undefined)
        }
        if (recipientInput.value !== 'USER_GROUP') {
            form.change('recipientUserGroup', undefined)
        }
        if (recipientInput.value !== 'PROGRAM_ATTRIBUTE') {
            form.change('recipientProgramAttribute', undefined)
        }
    }, [recipientInput.value, form, shouldIncludeDeliveryChannel])

    useEffect(() => {
        if (!isStageNotification && recipientInput.value === 'DATA_ELEMENT') {
            form.change('notificationRecipient', undefined)
        }
        if (
            !isTrackerProgram &&
            recipientInput.value === 'TRACKED_ENTITY_INSTANCE'
        ) {
            form.change('notificationRecipient', undefined)
        }
    }, [isStageNotification, isTrackerProgram, recipientInput, form])

    const recipientOptions = useMemo(() => {
        const baseOptions =
            isStageNotification || recipientInput.value === 'DATA_ELEMENT'
                ? programStageRecipientOptions
                : programRecipientOptions

        return baseOptions.filter((opt) =>
            isTrackerProgram
                ? true
                : opt.value !== 'PROGRAM_ATTRIBUTE' &&
                  opt.value !== 'TRACKED_ENTITY_INSTANCE'
        )
    }, [isStageNotification, recipientInput.value, isTrackerProgram])

    return (
        <div>
            <StandardFormField>
                <SingleSelectFieldFF
                    inputWidth="400px"
                    name="notificationRecipient"
                    dataTest="formfields-notification-recipient"
                    label={i18n.t('Recipient type')}
                    options={recipientOptions}
                    input={recipientInput}
                    meta={recipientMeta}
                    required
                />
            </StandardFormField>

            {recipientInput.value === 'PROGRAM_ATTRIBUTE' && (
                <StandardFormField>
                    <div style={{ width: '400px' }}>
                        <ModelSingleSelectFormField
                            name="recipientProgramAttribute"
                            dataTest="formfields-recipientProgramAttribute"
                            label={i18n.t('Program attribute recipient')}
                            query={{
                                resource: 'programs',
                                params: {
                                    fields: [
                                        'id,displayName,programTrackedEntityAttributes[trackedEntityAttribute[id,displayName,valueType]',
                                    ],
                                    filter: [
                                        `id:eq:${initialValues?.program.id}`,
                                    ],
                                },
                            }}
                            clearable={true}
                            transform={(programTEAs) => {
                                const program = programTEAs[0] as
                                    | ProgramWithTEAs
                                    | undefined

                                return (
                                    program?.programTrackedEntityAttributes
                                        ?.filter((x) =>
                                            ['PHONE_NUMBER', 'EMAIL'].includes(
                                                x.trackedEntityAttribute
                                                    .valueType
                                            )
                                        )
                                        .map((x) => x.trackedEntityAttribute) ||
                                    []
                                )
                            }}
                            noMatchWithoutFilterText={i18n.t(
                                'No program attributes of type email or phone number found.'
                            )}
                        />
                    </div>
                </StandardFormField>
            )}

            {recipientInput.value === 'DATA_ELEMENT' &&
                values?.programStage?.id && (
                    <StandardFormField>
                        <div style={{ width: '400px' }}>
                            <ModelSingleSelectFormField
                                name="recipientDataElement"
                                dataTest="formfields-recipientDataElement"
                                label={i18n.t('Data element recipient')}
                                query={{
                                    resource: 'programStages',
                                    params: {
                                        fields: [
                                            'programStageDataElements[valueType,dataElement[id,displayName,valueType]',
                                        ],
                                        filter: [
                                            `id:eq:${values?.programStage.id}`,
                                        ],
                                    },
                                }}
                                clearable={true}
                                transform={(programStageDEs) => {
                                    const stage = programStageDEs[0] as
                                        | ProgramStageWithDEs
                                        | undefined

                                    return (
                                        stage?.programStageDataElements
                                            ?.filter((x) =>
                                                [
                                                    'PHONE_NUMBER',
                                                    'EMAIL',
                                                ].includes(
                                                    x.dataElement.valueType
                                                )
                                            )
                                            .map((x) => x.dataElement) || []
                                    )
                                }}
                                noMatchWithoutFilterText={i18n.t(
                                    'No data elements of type email or phone number found.'
                                )}
                            />
                        </div>
                    </StandardFormField>
                )}
            {recipientInput.value === 'USER_GROUP' && (
                <>
                    <StandardFormField>
                        <div style={{ width: '400px' }}>
                            <ModelSingleSelectFormField
                                name="recipientUserGroup"
                                dataTest="formfields-recipientUserGroup"
                                label={i18n.t('User Group Recipient')}
                                query={{
                                    resource: 'userGroups',
                                    params: {
                                        fields: ['id', 'displayName'],
                                        order: 'displayName:asc',
                                    },
                                }}
                                clearable={true}
                            />
                        </div>
                    </StandardFormField>
                    <StandardFormField>
                        <FieldRFF
                            component={CheckboxFieldFF}
                            name="notifyUsersInHierarchyOnly"
                            label={i18n.t('Notify users in hierarchy only')}
                            type="checkbox"
                            dataTest="formfields-notifyUsersInHierarchyOnly"
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <FieldRFF
                            component={CheckboxFieldFF}
                            name="notifyParentOrganisationUnitOnly"
                            label={i18n.t(
                                'Notify parent organisation unit only'
                            )}
                            type="checkbox"
                            dataTest="formfields-notifyParentOrganisationUnitOnly"
                        />
                    </StandardFormField>
                </>
            )}

            {recipientInput.value === 'WEB_HOOK' && (
                <FieldRFF
                    component={TextAreaFieldFF}
                    required
                    dataTest="formfields-messageTemplate"
                    inputWidth="400px"
                    name="messageTemplate"
                    label={i18n.t('Web hook message URL')}
                />
            )}

            {shouldIncludeDeliveryChannel && (
                <StandardFormField>
                    <DeliveryChannelsField />
                </StandardFormField>
            )}
        </div>
    )
}
