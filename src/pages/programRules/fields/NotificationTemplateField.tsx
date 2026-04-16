import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelSingleSelectField } from '../../../components/metadataFormControls/ModelSingleSelect'
import { TooltipWrapper } from '../../../components/tooltip'
import { DisplayableModel } from '../../../types/models'

type NotificationQueryData = {
    id: string
    displayName?: string
    notificationTemplates?: DisplayableModel[]
    programStages?: Array<{
        notificationTemplates?: DisplayableModel[]
    }>
}

export function NotificationTemplateField({
    programId,
    disabled,
    required,
}: Readonly<{
    programId: string
    disabled?: boolean
    required?: boolean
}>) {
    const { input, meta } = useField('templateUid', {
        format: (value) => ({ id: value }),
        parse: (value) => value?.id ?? undefined,
    })

    return (
        <TooltipWrapper
            condition={!!disabled}
            content={i18n.t('Message template can not be edited after saving')}
        >
            <ModelSingleSelectField
                label={i18n.t('Message template')}
                required={required}
                disabled={disabled}
                query={{
                    resource: 'programs',
                    params: {
                        fields: [
                            'notificationTemplates[id,displayName]',
                            'programStages[notificationTemplates[id,displayName]]',
                        ],
                        filter: `id:eq:${programId}`,
                        paging: false,
                        order: 'displayName',
                    },
                }}
                transform={(data: NotificationQueryData[]) => {
                    const programData = data[0]
                    const fromProgram = programData?.notificationTemplates ?? []
                    const fromStages =
                        programData?.programStages?.flatMap(
                            (s) => s.notificationTemplates ?? []
                        ) ?? []
                    return [...fromProgram, ...fromStages]
                }}
                input={input}
                meta={meta}
                searchable={false}
            />
        </TooltipWrapper>
    )
}
