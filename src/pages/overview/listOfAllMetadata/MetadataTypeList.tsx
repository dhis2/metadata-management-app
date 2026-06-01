import i18n from '@dhis2/d2-i18n'
import {
    Button,
    DataTableCell,
    DataTableRow,
    IconChevronDown16,
    IconChevronRight16,
} from '@dhis2/ui'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import {
    ActionShowDetails,
    ListActions,
} from '../../../components/sectionList/listActions'
import { PublicAccessValue } from '../../../components/sectionList/modelValue/PublicAccess'
import { SectionListLoader } from '../../../components/sectionList/SectionListLoader'
import {
    SectionListEmpty,
    SectionListError,
} from '../../../components/sectionList/SectionListMessages'
import {
    modelListViewsConfig,
    Schema,
    shouldFilterOutDefaultForSection,
} from '../../../lib'
import { DataEngine } from '../../../types'
import { Pager } from '../../../types/generated'
import { ListItem } from './ListOfAll'
import css from './ListOfAll.module.css'
import { ListOfAllActionsMore } from './ListOfAllActionsMore'

type SchemaQueryResult = {
    result: { pager: Pager } & Record<string, ListItem[]>
}

const PAGE_SIZE = 5

export const MetadataTypeList = ({
    schema,
    engine,
    filter,
    sortOrder,
    onShowDetails,
    onOpenSharing,
    onDeleteSuccess,
}: {
    schema: Schema
    engine: DataEngine
    filter: string | undefined
    sortOrder: [string, 'asc' | 'desc'] | undefined
    onShowDetails: (model: ListItem, schema: Schema) => void
    onOpenSharing: (model: ListItem, schema: Schema) => void
    onDeleteSuccess: (model: ListItem) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const appliedFilter = filter ? [`identifiable:token:${filter}`] : []
    const defaultFilters = shouldFilterOutDefaultForSection(
        schema.name as keyof typeof modelListViewsConfig
    )
        ? ['name:ne:default']
        : []

    const { data, hasNextPage, fetchNextPage, isFetching, isError, refetch } =
        useInfiniteQuery({
            queryKey: [
                'listOfAll',
                schema.plural,
                filter ?? '',
                sortOrder ? `${sortOrder[0]}:${sortOrder[1]}` : '',
            ],
            staleTime: Infinity,
            queryFn: ({ pageParam = 1, signal }) =>
                engine.query(
                    {
                        result: {
                            resource: schema.plural,
                            params: {
                                fields: 'id,displayName,access,sharing[public],lastUpdated',
                                pageSize: PAGE_SIZE,
                                page: pageParam,
                                filter: [...appliedFilter, ...defaultFilters],
                                ...(sortOrder
                                    ? {
                                          order: `${sortOrder[0]}:${sortOrder[1]}`,
                                      }
                                    : {}),
                            },
                        },
                    },
                    { signal }
                ) as Promise<SchemaQueryResult>,
            getNextPageParam: (lastPage) => {
                const { pager } = (lastPage as SchemaQueryResult).result
                return pager.page < pager.pageCount ? pager.page + 1 : undefined
            },
        })

    const total = data?.pages[0]
        ? (data.pages[0] as SchemaQueryResult).result.pager.total
        : undefined

    const items =
        data?.pages.flatMap(
            (p) => (p as SchemaQueryResult).result[schema.plural] ?? []
        ) ?? []
    const hasNoItems = items.length === 0

    // auto-collapse when results come back empty
    useEffect(() => {
        if (total === 0) {
            setIsExpanded(false)
        }
    }, [total])
    const queryClient = useQueryClient()

    return (
        <>
            <DataTableRow className={css.schemaRow}>
                <DataTableCell width="32px" className={css.expandCell}>
                    <Button
                        className={css.expandButton}
                        secondary
                        small
                        type="button"
                        icon={
                            isExpanded ? (
                                <IconChevronDown16 />
                            ) : (
                                <IconChevronRight16 />
                            )
                        }
                        onClick={() => setIsExpanded((prev) => !prev)}
                    />
                </DataTableCell>
                <DataTableCell colSpan="3" className={css.schemaNameCell}>
                    {schema.displayName}
                    {total !== undefined && (
                        <span className={css.schemaCount}> ({total})</span>
                    )}
                </DataTableCell>
                <DataTableCell />
            </DataTableRow>

            {isExpanded && isFetching && hasNoItems ? (
                <SectionListLoader />
            ) : null}
            {isExpanded && !isError && !isFetching && hasNoItems ? (
                <SectionListEmpty />
            ) : null}

            {isExpanded &&
                items.map((item, idx) => (
                    <React.Fragment key={item.id}>
                        <DataTableRow>
                            <DataTableCell width="32px" />
                            <DataTableCell>{item.displayName}</DataTableCell>
                            <DataTableCell>
                                {item.lastUpdated ?? ''}
                            </DataTableCell>
                            <DataTableCell>
                                {item.sharing?.public && (
                                    <PublicAccessValue
                                        value={item.sharing.public}
                                    />
                                )}
                            </DataTableCell>
                            <DataTableCell>
                                <ListActions>
                                    <ActionShowDetails
                                        onClick={() =>
                                            onShowDetails(item, schema)
                                        }
                                    />
                                    <ListOfAllActionsMore
                                        model={item}
                                        schema={schema}
                                        onShowDetails={() =>
                                            onShowDetails(item, schema)
                                        }
                                        onOpenSharing={() =>
                                            onOpenSharing(item, schema)
                                        }
                                        onDeleteSuccess={() => {
                                            queryClient.invalidateQueries({
                                                queryKey: [schema.plural],
                                            })
                                            refetch()
                                            onDeleteSuccess(item)
                                        }}
                                    />
                                </ListActions>
                            </DataTableCell>
                        </DataTableRow>
                        {idx === items.length - 1 && isFetching ? (
                            <SectionListLoader />
                        ) : null}
                        {idx === items.length - 1 && isError ? (
                            <SectionListError />
                        ) : null}
                        {idx === items.length - 1 &&
                        !isFetching &&
                        hasNextPage ? (
                            <DataTableRow>
                                <DataTableCell
                                    colSpan="100"
                                    className={css.loadMoreCell}
                                    onClick={() => fetchNextPage()}
                                    align={'center'}
                                >
                                    {i18n.t('Load more for {{schema}}', {
                                        schema: schema.displayName,
                                    })}
                                </DataTableCell>
                            </DataTableRow>
                        ) : null}
                    </React.Fragment>
                ))}
            {isExpanded && isError && hasNoItems ? <SectionListError /> : null}
        </>
    )
}
