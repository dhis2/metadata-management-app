import { FetchError, useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { SectionListWrapper } from '../components'
import { DefaultListActionProps } from '../components/sectionList/listActions/DefaultListActions'
import { useModelListView } from '../components/sectionList/listView'
import { DefaultToolbarProps } from '../components/sectionList/toolbar/DefaultToolbar'
import {
    useSchemaFromHandle,
    useParamsForDataQuery,
    BaseListModel,
    DEFAULT_FIELD_FILTERS,
    useModelSectionHandleOrThrow,
    shouldFilterOutDefaultForSection,
    modelListViewsConfig,
} from '../lib'
import { getFieldFilter } from '../lib/models/path'
import { WrapQueryResponse } from '../types'
import { PagedResponse } from '../types/models'

type ModelListResponse = WrapQueryResponse<PagedResponse<BaseListModel, string>>

export type DefaultSectionListProps = {
    filters?: string[]
    order?: string
    ActionsComponent?: React.ComponentType<DefaultListActionProps>
    ToolbarComponent?: React.ComponentType<DefaultToolbarProps>
}
export const DefaultSectionList = ({
    filters,
    order,
    ActionsComponent,
    ToolbarComponent,
}: DefaultSectionListProps) => {
    const section = useModelSectionHandleOrThrow()
    const { columns } = useModelListView()
    const schema = useSchemaFromHandle()
    const engine = useDataEngine()
    const modelListName = schema.plural
    const shouldFilterOutDefault = shouldFilterOutDefaultForSection(
        section.name as keyof typeof modelListViewsConfig
    )

    const initialParams = useParamsForDataQuery()

    const query = {
        result: {
            resource: modelListName,
            params: {
                ...initialParams,
                filter: initialParams.filter
                    .concat(filters ?? [])
                    .concat(shouldFilterOutDefault ? ['name:ne:default'] : []),
                order: initialParams.order ?? order,
                fields: columns
                    .map((column) => getFieldFilter(schema, column.path))
                    .concat(DEFAULT_FIELD_FILTERS),
            },
        },
    }

    const { error, data, refetch } = useQuery({
        queryKey: [query],
        queryFn: ({ queryKey: [query], signal }) => {
            return engine.query(query, { signal }) as Promise<ModelListResponse>
        },
    })
    const modelList = data?.result[modelListName]

    return (
        <div>
            <SectionListWrapper
                error={error as FetchError | undefined}
                data={modelList}
                pager={data?.result.pager}
                refetch={refetch}
                ActionsComponent={ActionsComponent}
                ToolbarComponent={ToolbarComponent}
            />
        </div>
    )
}
