import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useRef } from 'react'
import { canEditModel, Schema, useSchemaFromHandle } from '../../../lib'
import { Query, WrapQueryResponse } from '../../../types'
import { BaseIdentifiableObject } from '../../../types/models'
import { ClientDateTime } from '../../date'
import { Loader } from '../../loading'
import { ApiUrlValue, DetailItem } from './DetailItem'
import {
    DetailsList,
    DetailsPanelButtons,
    DetailsPanelContent,
} from './DetailsPanel'

type DetailsPanelProps = {
    modelId: string
}

const defaultQueryFields = [
    'access',
    'code',
    'created',
    'lastUpdated',
    'lastUpdatedBy',
    'displayName',
    'id',
    'displayShortName',
    'href',
    'createdBy',
] as const

const createDefaultDetailsQuery = (
    resource: string,
    id: string,
    schemaProperties: Schema['properties']
): Query => ({
    result: {
        resource,
        id,
        params: {
            fields: defaultQueryFields
                .filter((field) => !!schemaProperties[field])
                .concat('id'),
        },
    },
})

// fields that are not in BaseIdentifiableObject
type ExtraFields = {
    displayShortName?: string
}

export type DetailsResponse = Pick<
    BaseIdentifiableObject & ExtraFields,
    (typeof defaultQueryFields)[number]
>

export const DefaultDetailsPanelContent = ({ modelId }: DetailsPanelProps) => {
    const schema = useSchemaFromHandle()
    // used to prevent changing query after initial render
    const queryRef = useRef(
        createDefaultDetailsQuery(schema.plural, modelId, schema.properties)
    )

    const detailsQueryResponse = useDataQuery<
        WrapQueryResponse<DetailsResponse, 'result'>
    >(queryRef.current)
    return (
        <Loader queryResponse={detailsQueryResponse}>
            <DetailsContent
                data={
                    detailsQueryResponse.data
                        ?.result as NonNullable<DetailsResponse>
                }
            />
        </Loader>
    )
}

export const DetailsContent = ({
    data,
    withEditButton = true,
}: {
    data: DetailsResponse
    withEditButton?: boolean
}) => {
    const canEdit = canEditModel(data)
    return (
        <DetailsPanelContent displayName={data.displayName}>
            {withEditButton && (
                <DetailsPanelButtons modelId={data.id} editable={canEdit} />
            )}
            <DetailsList>
                {data.displayShortName && (
                    <DetailItem label={i18n.t('Short name')}>
                        {data.displayShortName}
                    </DetailItem>
                )}
                <DetailItem label={i18n.t('Code')}>{data.code}</DetailItem>
                <DetailItem label={i18n.t('Created by')}>
                    {data.createdBy?.displayName}
                </DetailItem>
                <DetailItem label={i18n.t('Created')}>
                    <ClientDateTime value={data?.created} />
                </DetailItem>
                <DetailItem label={i18n.t('Last updated by')}>
                    {data.lastUpdatedBy
                        ? data.lastUpdatedBy?.displayName
                        : data.createdBy?.displayName}
                </DetailItem>
                <DetailItem label={i18n.t('Last updated')}>
                    <ClientDateTime value={data.lastUpdated} />
                </DetailItem>
                <DetailItem label={i18n.t('Id')}>{data.id}</DetailItem>
                <DetailItem label={i18n.t('API URL')}>
                    <ApiUrlValue value={data.href} />
                </DetailItem>
            </DetailsList>
        </DetailsPanelContent>
    )
}
