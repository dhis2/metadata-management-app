import {
    ColumnDef,
    ExpandedState,
    ExpandedStateList,
    getCoreRowModel,
    getExpandedRowModel,
    Updater,
    useReactTable,
} from '@tanstack/react-table'
import { difference } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IdentifiableFilter, SectionList } from '../../../components'
import {
    DefaultDetailsPanelContent,
    DetailsPanel,
} from '../../../components/sectionList/detailsPanel'
import { useModelListView } from '../../../components/sectionList/listView'
import { ModelValue } from '../../../components/sectionList/modelValue/ModelValue'
import { DefaultToolbar } from '../../../components/sectionList/toolbar'
import { TranslationDialog } from '../../../components/sectionList/translation'
import {
    BaseListModel,
    SchemaName,
    useSchema,
    useSectionListFilter,
} from '../../../lib'
import { getFieldFilter } from '../../../lib/models/path'
import { useCurrentUserRootOrgUnits } from '../../../lib/user/currentUserStore'
import css from './OrganisationUnitList.module.css'
import { OrganisationUnitListMessage } from './OrganisationUnitListMessage'
import { OrganisationUnitRow } from './OrganisationUnitRow'
import {
    OrganisationUnitResponse,
    PartialOrganisationUnit,
    useFilteredOrgUnits,
    usePaginatedChildrenOrgUnitsController,
} from './useOrganisationUnits'

export type OrganisationUnitListItem = Omit<
    PartialOrganisationUnit,
    'ancestors'
> & {
    subrows?: OrganisationUnitListItem[]
}

const useColumns = () => {
    const { columns: selectedColumns } = useModelListView()
    const schema = useSchema(SchemaName.organisationUnit)

    const columnDefinitions = useMemo(
        () =>
            selectedColumns.map((descriptor) => {
                return {
                    accessorKey: descriptor.path,
                    header: descriptor.label,
                    cell: ({ row }) => {
                        return (
                            <ModelValue
                                path={
                                    descriptor.path === 'name'
                                        ? 'displayName'
                                        : descriptor.path
                                }
                                schema={schema}
                                sectionModel={row.original}
                            />
                        )
                    },
                    meta: {
                        fieldFilter: getFieldFilter(schema, descriptor.path),
                    },
                } satisfies ColumnDef<OrganisationUnitListItem>
            }),
        [selectedColumns, schema]
    )

    return columnDefinitions
}

const transformToOrgUnitListItems = (
    organisationUnits: OrganisationUnitResponse['organisationUnits'],
    rootUnits: string[] = []
) => {
    const allOrgUnitsMap = new Map<string, OrganisationUnitListItem>()
    // add ancestors to all orgUnits
    organisationUnits.forEach((ou) => {
        allOrgUnitsMap.set(ou.id, ou)
        ou.ancestors.forEach((ancestor) => {
            // some field-filters does not work for ancestors (eg. href)
            // we therefore only add them if we dont have them already
            // even though you could theoretically just call .set() again
            if (!allOrgUnitsMap.has(ancestor.id)) {
                allOrgUnitsMap.set(ancestor.id, ancestor)
            }
        })
    })
    // gather subrows
    // note that nested subrows are not updated. So we need to acccess subrows through the returned map.
    // eg. subrows[0].subrows[0] does not work
    for (const ou of allOrgUnitsMap.values()) {
        if (!ou.parent) {
            continue
        }
        const parent = allOrgUnitsMap.get(ou.parent.id)
        if (parent) {
            const subrows = parent.subrows?.concat(ou) ?? [ou]
            const parentWithSubrows = {
                ...parent,
                subrows: subrows.sort((a, b) =>
                    a.displayName
                        .toLowerCase()
                        .localeCompare(b.displayName.toLowerCase())
                ),
            }
            allOrgUnitsMap.set(parent.id, parentWithSubrows)
        }
    }
    const rootOrgUnits = rootUnits
        .map((id) => allOrgUnitsMap.get(id))
        .filter((u) => !!u)

    return {
        orgUnitMap: allOrgUnitsMap,
        rootOrgUnits,
    }
}

/**
 * A collapsible tree-like list of organisation units.
 *
 * This component is somewhat complex - but it handles a lot of different scenarios.
 *
 * The data-loading logic may seem differen than other orgunit components. Mostly
 * because we are *not* using "children" property to load nested children.
 *  We are instead using "parent" filter. This is mainly because it's not possible to
 * paginate nested collections - and by using "parent"-filter, the children become the "root" result.
 * We use ancestors and parent properties to build the tree structure.
 * This also simplies the logic - the tree can be rendered from a single request.
 *
 * The data-structure and logic when filtering and not filtering is somewhat different.
 *   When not filtering, we use "parent" filter to load children of the root units.
 *      usePaginatedChildrenOrgUnitsController takes a list of parentIds to load children for.
 *    When filtering we gather ancestors of the units, so we can build the tree "bottom-up".
 *     Eg. we get matches, but since we want to display them in a nested tree, we also need their ancestors.
 *     We get ancestors through field-filters - and these are added to the flat list of units.
 *     We can thus build the tree from a single request with the matches.
 *
 * The results of the two methods are merged into a single list of OrganisationUnitListItem.
 *  This means that when expanding a unit when filtering, the data for that unit will be loaded.
 *  However, normally (when not expanding more than matches of filter) only data from one of the two lists will be used.
 */
export const OrganisationUnitList = () => {
    const columnDefinitions = useColumns()
    const [identifiableFilter] = useSectionListFilter('identifiable')
    const userRootOrgUnits = useCurrentUserRootOrgUnits()

    const initialExpandedState = useMemo(() => {
        return Object.fromEntries(userRootOrgUnits.map((ou) => [ou.id, true]))
    }, [userRootOrgUnits])

    const [parentIdsToLoad, setParentIdsToLoad] = useState<ExpandedStateList>(
        () => initialExpandedState
    )
    // the expanded organisationUnit Ids
    const [expanded, setExpanded] = useState<ExpandedState>(
        () => initialExpandedState
    )

    const [detailsId, setDetailsId] = useState<string | undefined>()
    const [translationDialogModel, setTranslationDialogModel] = useState<
        BaseListModel | undefined
    >(undefined)
    const isFiltering = !!identifiableFilter

    const handleDetailsClick = useCallback(
        ({ id }: BaseListModel) => {
            setDetailsId((prevDetailsId) =>
                prevDetailsId === id ? undefined : id
            )
        },
        [setDetailsId]
    )

    const fieldFilters = columnDefinitions.map(
        (column) => column.meta.fieldFilter
    )

    const { allData, queries, fetchNextPage } =
        usePaginatedChildrenOrgUnitsController({
            parentIds: parentIdsToLoad,
            fieldFilters,
        })

    const hasErrored = queries.some((query) => query.isError)

    const orgUnitFiltered = useFilteredOrgUnits({
        searchQuery: identifiableFilter,
        fieldFilters,
        enabled: isFiltering,
    })

    // expand ancestors when filtering, so that matches are visible
    useEffect(() => {
        if (!isFiltering) {
            // reset expanded state when not filtering
            setExpanded(initialExpandedState)
            setParentIdsToLoad(initialExpandedState)
            return
        }
        const ancestorIds = orgUnitFiltered.data?.organisationUnits.flatMap(
            (ou) => ou.ancestors.map((a) => [a.id, true])
        )
        if (ancestorIds) {
            setExpanded(Object.fromEntries(ancestorIds))
        }
        // hide data from usePaginatedChildrenOrgUnitsController
        setParentIdsToLoad({})
    }, [isFiltering, initialExpandedState, orgUnitFiltered.data])

    const { rootOrgUnits, orgUnitMap } = useMemo(() => {
        const flatData = allData
            .concat(orgUnitFiltered.data ?? [])
            .flatMap((ou) => (ou ? ou.organisationUnits : []))
        return transformToOrgUnitListItems(
            flatData,
            userRootOrgUnits.map((ou) => ou.id)
        )
    }, [allData, orgUnitFiltered.data, userRootOrgUnits])

    const handleExpand = useCallback(
        (valueOrUpdater: Updater<ExpandedState>) => {
            const getAllExpanded = () =>
                Object.fromEntries(
                    Array.from(orgUnitMap).map(([ouId]) => [ouId, true])
                )

            const newValue =
                typeof valueOrUpdater === 'function'
                    ? valueOrUpdater(expanded)
                    : valueOrUpdater

            setExpanded(newValue)
            if (newValue === true) {
                setParentIdsToLoad(getAllExpanded())
                return
            }
            // find which id was toggled
            const toggledRow = difference(
                Object.keys(newValue),
                Object.keys(expanded)
            )[0]
            if (toggledRow) {
                // load children of toggled row
                // note that we dont really have to differentiate between removing (collapsing) and adding (expanding)
                // because we dont have to remove the children from the loaded data when collapsing.
                setParentIdsToLoad((old) => ({
                    ...old,
                    [toggledRow]: true,
                }))
            }
        },
        [setExpanded, orgUnitMap, expanded]
    )

    const table = useReactTable({
        columns: columnDefinitions,
        // note data must change for table to re-compute
        // thus we have to compute the root whenever data changes (since subrows is not part of the data)
        data: rootOrgUnits,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel<OrganisationUnitListItem>(),
        getRowCanExpand: (row) => row.original.childCount > 0,
        getSubRows: (row) => {
            return orgUnitMap.get(row.id)?.subrows //flatOrgUnits.filter((d) => d.parent?.id === row.id)
        },
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: handleExpand,
        state: {
            expanded,
        },
        initialState: {
            expanded: initialExpandedState,
        },
        enableSubRowSelection: false,
    })

    return (
        <div>
            <IdentifiableFilter />
            <div className={css.listDetailsWrapper}>
                <DefaultToolbar
                    selectedModels={
                        new Set(
                            table
                                .getSelectedRowModel()
                                .flatRows.map((r) => r.id)
                        )
                    }
                    onDeselectAll={() => {
                        table.resetRowSelection(true)
                    }}
                />
                <SectionList
                    headerColumns={table
                        .getHeaderGroups()[0]
                        .headers.map((h) => ({
                            label: h.column.columnDef.header as string,
                            path: h.column.id,
                        }))}
                >
                    <OrganisationUnitListMessage
                        isFiltering={isFiltering}
                        queries={queries.concat(orgUnitFiltered)}
                        orgUnitCount={table.getRowCount()}
                    />
                    {table.getRowModel().rows.map((row) => (
                        <OrganisationUnitRow
                            key={row.id}
                            row={row}
                            onShowDetailsClick={handleDetailsClick}
                            isFiltering={isFiltering}
                            hasErrored={hasErrored}
                            fetchNextPage={fetchNextPage}
                            onOpenTranslationClick={setTranslationDialogModel}
                        />
                    ))}
                </SectionList>
                {detailsId && (
                    <DetailsPanel
                        onClose={() => setDetailsId(undefined)}
                        // reset component state when modelId changes
                        key={detailsId}
                    >
                        <DefaultDetailsPanelContent modelId={detailsId} />
                    </DetailsPanel>
                )}
                {translationDialogModel && (
                    <TranslationDialog
                        model={translationDialogModel}
                        onClose={() => setTranslationDialogModel(undefined)}
                    />
                )}
            </div>
        </div>
    )
}
