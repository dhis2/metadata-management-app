import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    FieldGroup,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    RadioFieldFF,
} from '@dhis2/ui'
import React, { useState } from 'react'
import { useField } from 'react-final-form'
import {
    // Used directly to avoid key collision with PROGRAM_NOTIFICATION_TRIGGER.ENROLLMENT in allConstantTranslations
    ANALYTICS_TYPE,
} from '../../../lib'
import {
    AnalyticsPeriodBoundary,
    AnalyticsPeriodBoundaryType,
} from '../../../types/models'

type AnalyticsType = 'EVENT' | 'ENROLLMENT'

const DEFAULT_BOUNDARY_TARGET: Record<AnalyticsType, string> = {
    EVENT: 'EVENT_DATE',
    ENROLLMENT: 'ENROLLMENT_DATE',
}

const ChangeAnalyticsTypeModal = ({
    onContinue,
    onCancel,
}: Readonly<{ onContinue: () => void; onCancel: () => void }>) => (
    <Modal dataTest="analytics-type-change-modal" onClose={onCancel}>
        <ModalTitle>{i18n.t('Change data source?')}</ModalTitle>
        <ModalContent>
            {i18n.t(
                'Changing the data source will reset the period boundaries and remove any custom period boundaries you have added.'
            )}
        </ModalContent>
        <ModalActions>
            <ButtonStrip>
                <Button
                    dataTest="analytics-type-change-cancel"
                    onClick={onCancel}
                >
                    {i18n.t('Cancel')}
                </Button>
                <Button
                    destructive
                    dataTest="analytics-type-change-continue"
                    onClick={onContinue}
                >
                    {i18n.t('Continue')}
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)

export const AnalyticsTypeField = () => {
    const eventField = useField('analyticsType', {
        type: 'radio',
        value: 'EVENT',
    })
    const enrollmentField = useField('analyticsType', {
        type: 'radio',
        value: 'ENROLLMENT',
    })
    const { input: analyticsPeriodBoundariesInput } = useField<
        Partial<AnalyticsPeriodBoundary>[]
    >('analyticsPeriodBoundaries')
    const { input: analyticsTypeInput } = useField<AnalyticsType | undefined>(
        'analyticsType'
    )
    const [pendingAnalyticsType, setPendingAnalyticsType] =
        useState<AnalyticsType | null>(null)

    const applyAnalyticsType = (analyticsType: AnalyticsType) => {
        analyticsTypeInput.onChange(analyticsType)
        analyticsPeriodBoundariesInput.onChange([
            {
                analyticsPeriodBoundaryType:
                    AnalyticsPeriodBoundaryType.AFTER_START_OF_REPORTING_PERIOD,
                boundaryTarget: DEFAULT_BOUNDARY_TARGET[analyticsType],
            },
            {
                analyticsPeriodBoundaryType:
                    AnalyticsPeriodBoundaryType.BEFORE_START_OF_REPORTING_PERIOD,
                boundaryTarget: DEFAULT_BOUNDARY_TARGET[analyticsType],
            },
        ])
    }

    const requestAnalyticsTypeChange = (analyticsType: AnalyticsType) => {
        if (analyticsTypeInput.value) {
            setPendingAnalyticsType(analyticsType)
        } else {
            applyAnalyticsType(analyticsType)
        }
    }

    return (
        <>
            <FieldGroup
                label={i18n.t('Data source')}
                required
                dataTest="formfields-analyticsType"
            >
                <RadioFieldFF
                    label={`${ANALYTICS_TYPE.EVENT}: ${i18n.t(
                        'Uses data from all events within a program stage'
                    )}`}
                    input={{
                        ...eventField.input,
                        onChange: () => requestAnalyticsTypeChange('EVENT'),
                    }}
                    meta={eventField.meta}
                />
                <RadioFieldFF
                    label={`${ANALYTICS_TYPE.ENROLLMENT}: ${i18n.t(
                        'Uses data combined from the latest events across the enrollment'
                    )}`}
                    input={{
                        ...enrollmentField.input,
                        onChange: () =>
                            requestAnalyticsTypeChange('ENROLLMENT'),
                    }}
                    meta={enrollmentField.meta}
                />
            </FieldGroup>
            {pendingAnalyticsType && (
                <ChangeAnalyticsTypeModal
                    onContinue={() => {
                        applyAnalyticsType(pendingAnalyticsType)
                        setPendingAnalyticsType(null)
                    }}
                    onCancel={() => setPendingAnalyticsType(null)}
                />
            )}
        </>
    )
}
