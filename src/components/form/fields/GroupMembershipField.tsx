import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelTransferField } from '../../metadataFormControls'

type GroupMembershipFieldProps = Readonly<{
    resource: string
    hideAddNew?: boolean
}>

export function GroupMembershipField({
    resource,
    hideAddNew,
}: GroupMembershipFieldProps) {
    return (
        <ModelTransferField
            dataTest={`formfields-${resource}`}
            name={resource}
            query={{
                resource,
                params: {
                    fields: ['id', 'displayName'],
                },
            }}
            leftHeader={i18n.t('Available groups')}
            rightHeader={i18n.t('Selected groups')}
            filterPlaceholder={i18n.t('Filter available groups')}
            filterPlaceholderPicked={i18n.t('Filter selected groups')}
            hideAddNew={hideAddNew}
        />
    )
}
