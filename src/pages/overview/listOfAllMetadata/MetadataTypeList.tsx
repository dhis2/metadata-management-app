import i18n from '@dhis2/d2-i18n'
import {
    Button,
    DataTableCell,
    DataTableRow,
    IconChevronDown16,
    IconChevronRight16,
} from '@dhis2/ui'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ActionShowDetails,
    ListActions,
} from '../../../components/sectionList/listActions'
import { DateValue } from '../../../components/sectionList/modelValue/DateValue'
import { PublicAccessValue } from '../../../components/sectionList/modelValue/PublicAccess'
import { SectionListLoader } from '../../../components/sectionList/SectionListLoader'
import {
    SectionListEmpty,
    SectionListError,
} from '../../../components/sectionList/SectionListMessages'
import {
    canEditModel,
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
    to,
    activeId,
    engine,
    filter,
    sortOrder,
    onShowDetails,
    onOpenSharing,
    onDeleteSuccess,
}: {
    schema: Schema
    to: string
    activeId: string | undefined
    engine: DataEngine
    filter: string | undefined
    sortOrder: [string, 'asc' | 'desc'] | undefined
    onShowDetails: (model: ListItem, schema: Schema) => void
    onOpenSharing: (model: ListItem, schema: Schema) => void
    onDeleteSuccess: (model: ListItem) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const navigate = useNavigate()

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
    const isEmpty = total === 0

    /* the chevron deliberately has no onClick of its own - its native click
     * bubbles to the row handler, so mouse and keyboard both go through one
     * path and the row cannot double-toggle */
    const toggleExpanded = () => setIsExpanded((prev) => !prev)

    const handleItemClick = (item: ListItem) => {
        if (!canEditModel(item)) {
            return
        }
        navigate(`/${to}/${item.id}`)
    }

    return (
        <>
            <DataTableRow
                className={cx(css.schemaRow, {
                    [css.schemaRowEmpty]: isEmpty,
                    [css.schemaRowClickable]: !isEmpty,
                })}
            >
                <DataTableCell
                    width="32px"
                    className={css.expandCell}
                    onClick={isEmpty ? undefined : toggleExpanded}
                >
                    {/* no chevron at all when there is nothing to expand - a
                     * disabled button would imply the row does something */}
                    {!isEmpty && (
                        <Button
                            className={css.expandButton}
                            secondary
                            small
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={i18n.t('Show {{schema}}', {
                                schema: schema.displayName,
                            })}
                            icon={
                                isExpanded ? (
                                    <IconChevronDown16 />
                                ) : (
                                    <IconChevronRight16 />
                                )
                            }
                        />
                    )}
                </DataTableCell>
                <DataTableCell
                    colSpan="4"
                    className={css.schemaNameCell}
                    onClick={isEmpty ? undefined : toggleExpanded}
                >
                    {schema.displayName}
                    {total !== undefined && (
                        <span
                            className={cx(css.count, {
                                [css.countBadge]: total > 0,
                                [css.countZero]: total === 0,
                            })}
                        >
                            {total}
                        </span>
                    )}
                </DataTableCell>
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
                        <DataTableRow
                            className={cx(css.listRow, {
                                [css.active]: activeId === item.id,
                                [css.clickable]: canEditModel(item),
                            })}
                        >
                            <DataTableCell width="32px" />
                            <DataTableCell
                                className={css.itemNameCell}
                                onClick={() => handleItemClick(item)}
                            >
                                <span className={css.listRowText}>
                                    {item.displayName}
                                </span>
                            </DataTableCell>
                            <DataTableCell
                                onClick={() => handleItemClick(item)}
                            >
                                <DateValue value={item.lastUpdated} />
                            </DataTableCell>
                            <DataTableCell
                                onClick={() => handleItemClick(item)}
                            >
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
                            <DataTableRow className={css.loadMoreRow}>
                                <DataTableCell
                                    width="32px"
                                    onClick={() => fetchNextPage()}
                                />
                                <DataTableCell
                                    colSpan="4"
                                    className={css.loadMoreCell}
                                    onClick={() => fetchNextPage()}
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
