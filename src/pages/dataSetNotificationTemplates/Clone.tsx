import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import {
    getSectionPath,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitNew,
} from '../../lib'
import { DataSetNotificationResult } from './Edit'
import { DataSetNotificationsFormFields } from './form/DataSetNotificationsFormFields'
import {
    transformFormValues,
    validate,
} from './form/dataSetNotificationTemplateSchema'
import { formDescriptor } from './form/formDescriptor'

const fieldFilters = [
    'name',
    'code',
    'subjectTemplate',
    'messageTemplate',
    'notificationRecipient',
    'dataSetNotificationTrigger',
    'relativeScheduledDays',
    'sendStrategy',
    'recipientUserGroup[id,displayName]',
    'deliveryChannels',
    'dataSets[id,name,displayName]',
    'notifyUsersInHierarchyOnly',
] as const

export const Component = () => {
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const queryFn = useBoundResourceQueryFn()
    const section = SECTIONS_MAP.dataSetNotificationTemplate
    const { data: template } = useQuery({
        queryKey: [
            {
                resource: 'dataSetNotificationTemplates',
                id: clonedModelId,
                params: {
                    fields: fieldFilters.join(','),
                },
            },
        ],
        queryFn: queryFn<DataSetNotificationResult>,
        enabled: !!clonedModelId,
    })

    const initialValues: Partial<DataSetNotificationResult> | undefined =
        template ? omit(template, 'id') : undefined

    return (
        <FormBase
            onSubmit={useOnSubmitNew({
                section: SECTIONS_MAP.dataSetNotificationTemplate,
            })}
            initialValues={initialValues}
            validate={validate}
            valueFormatter={transformFormValues}
            includeAttributes={false}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider formDescriptor={formDescriptor}>
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <h2>
                            `Cloning ${template?.name} (id: ${clonedModelId})`
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <DataSetNotificationsFormFields />
                            <SectionedFormErrorNotice />
                        </form>
                        <DefaultFormFooter
                            cancelTo={`/${getSectionPath(section)}`}
                        />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
