import i18n from '@dhis2/d2-i18n'
import {
    InputField,
    OrganisationUnitEventPayload,
    OrganisationUnitTree,
    OrganisationUnitTreeProps,
} from '@dhis2/ui'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Field } from 'react-final-form'
import { useSystemOrgUnits, useDebouncedState } from '../../../../lib'
import { useBoundResourceQueryFn } from '../../../../lib/query/useBoundQueryFn'
import { uniqueBy } from '../../../../lib/utils'
import { Optional, PagedResponse, PlainResourceQuery } from '../../../../types'
import { OrganisationUnit } from '../../../../types/generated'
import { FieldWrapper } from '../../helpers'
import { OrganisationUnitSelectedList } from './OrganisationUnitSelectedList'
import css from './OrganisationUnitTreeWithToolbar.module.css'
import {
    OrgUnitLevelGroupSelect,
    OrgUnitLevelGroupSelectProps,
} from './OrgUnitLevelGroupSelect'

export type SearchOrganisationUnitResponse = PagedResponse<
    Pick<OrganisationUnit, 'path'>,
    'organisationUnits'
>

export type OrganisationUnitValue = {
    id?: string
    path: string
    displayName: string
}

export type OrganisationUnitFieldProps = Optional<
    Omit<OrganisationUnitTreeProps, 'onChange' | 'selected'>,
    'roots'
> & {
    onChange: (value: OrganisationUnitValue[]) => void
    selected: OrganisationUnitValue[] | undefined
}

export const OrganisationUnitTreeWithToolbar = ({
    selected,
    onChange,
    ...treeProps
}: OrganisationUnitFieldProps) => {
    const [search, setSearch] = useState('')
    const queryClient = useQueryClient()
    const boundQueryFn = useBoundResourceQueryFn()
    const roots = useSystemOrgUnits()
    const minRootLevel = roots[0]?.level ?? 1

    const isFiltered = search !== ''
    const matchingSearchUnits = useQuery({
        queryFn: boundQueryFn<SearchOrganisationUnitResponse>,
        enabled: isFiltered,
        queryKey: [
            {
                resource: 'organisationUnits',
                params: {
                    filter: `identifiable:token:${search}`,
                    fields: ['path'],
                    pageSize: 150,
                },
            } satisfies PlainResourceQuery,
        ],
        keepPreviousData: true,
    })
    const searchUnitPaths = useMemo(() => {
        // the filter-prop in OrganisationUnitTree expect the paths to start with the rootIds.
        // however, when the assigned roots are not the hierarchy root - the paths will not start with the rootIds,
        // because paths always include the whole hierarchy regardless of assigned units.
        // thus we need to "trim" the paths to start at the same level as the rootIds.
        return (
            matchingSearchUnits.data?.organisationUnits.map((ou) => {
                const splitPath = ou.path.split('/')
                const leftTrimmedPath = `/${splitPath
                    .slice(minRootLevel)
                    .join('/')}`
                return leftTrimmedPath
            }) ?? []
        )
    }, [matchingSearchUnits.data?.organisationUnits, minRootLevel])
    const rootIds = roots.map((ou) => ou.id)

    const selectedPaths = selected?.map((ou) => ou.path) || []
    const handleChange = ({
        selected: newSelectedPaths,
        displayName,
        id,
        path,
    }: OrganisationUnitEventPayload) => {
        const prevSelectedMap = selected
            ? new Map(selected?.map((ou) => [ou.path, ou]))
            : new Map()

        const newSelected = newSelectedPaths.map((selectedPath) => {
            const prev = prevSelectedMap.get(selectedPath)
            return prev ?? { id, path, displayName }
        })

        onChange(newSelected)
    }

    const handleLevelSelectChange = async (
        level: Parameters<OrgUnitLevelGroupSelectProps['onLevelSelect']>[0],
        mode: 'select' | 'deselect'
    ) => {
        const orgUnits = await queryClient.fetchQuery({
            queryFn: boundQueryFn<{
                organisationUnits: OrganisationUnitValue[]
            }>,
            queryKey: [
                {
                    resource: 'organisationUnits',
                    params: {
                        fields: ['id', 'path', 'displayName'],
                        filter: [`level:eq:${level.level}`],
                        paging: false,
                    },
                },
            ],
        })
        applyOrgUnitSelectionChange(orgUnits.organisationUnits, mode)
    }

    const handleGroupSelectChange = async (
        group: Parameters<OrgUnitLevelGroupSelectProps['onGroupSelect']>[0],
        mode: 'select' | 'deselect'
    ) => {
        const orgUnits = await queryClient.fetchQuery({
            queryFn: boundQueryFn<{
                organisationUnits: OrganisationUnitValue[]
            }>,
            queryKey: [
                {
                    resource: 'organisationUnits',
                    params: {
                        fields: ['id', 'path', 'displayName'],
                        filter: [`organisationUnitGroups.id:eq:${group.id}`],
                        paging: false,
                    },
                },
            ],
        })
        applyOrgUnitSelectionChange(orgUnits.organisationUnits, mode)
    }

    const applyOrgUnitSelectionChange = (
        orgUnits: OrganisationUnitValue[],
        mode: 'select' | 'deselect'
    ) => {
        const current = selected ?? []
        if (mode === 'select') {
            onChange(uniqueBy(current.concat(orgUnits), (o) => o.path))
        } else {
            const pathsToRemove = new Set(orgUnits.map((ou) => ou.path))
            onChange(current.filter((ou) => !pathsToRemove.has(ou.path)))
        }
    }

    return (
        <div className={css.wrapper}>
            <OrganisationUnitTreeToolbar
                onSearchChange={setSearch}
                onLevelSelect={(l) => handleLevelSelectChange(l, 'select')}
                onGroupSelect={(g) => handleGroupSelectChange(g, 'select')}
                onLevelDeselect={(l) => handleLevelSelectChange(l, 'deselect')}
                onGroupDeselect={(g) => handleGroupSelectChange(g, 'deselect')}
                onDeselectAll={() => onChange([])}
                minRootLevel={minRootLevel}
            />
            <div className={css.treeMessage}>
                {matchingSearchUnits.data?.pager.total === 0 && (
                    <p>{i18n.t('No organisation units match your search.')}</p>
                )}
                {matchingSearchUnits.data?.pager.nextPage && (
                    <p>
                        {i18n.t(`There are too many results to display. Please narrow
                        down the search.`)}
                    </p>
                )}
            </div>
            <div className={css.treeWrapper}>
                {matchingSearchUnits.data?.pager.total !== 0 && (
                    <OrganisationUnitTree
                        roots={rootIds}
                        initiallyExpanded={rootIds.map((id) => `/${id}`)}
                        filter={isFiltered ? searchUnitPaths : []}
                        selected={selectedPaths}
                        onChange={handleChange}
                        {...treeProps}
                    />
                )}
            </div>
        </div>
    )
}

type OrganisationUnitTreeToolbarProps = {
    onSearchChange: (search: string) => void
    onGroupSelect: OrgUnitLevelGroupSelectProps['onGroupSelect']
    onLevelSelect: OrgUnitLevelGroupSelectProps['onLevelSelect']
    onGroupDeselect: OrgUnitLevelGroupSelectProps['onGroupDeselect']
    onLevelDeselect: OrgUnitLevelGroupSelectProps['onLevelDeselect']
    onDeselectAll: OrgUnitLevelGroupSelectProps['onDeselectAll']
    minRootLevel?: number
}
const OrganisationUnitTreeToolbar = ({
    onSearchChange,
    onDeselectAll,
    onGroupSelect,
    onLevelSelect,
    onGroupDeselect,
    onLevelDeselect,
    minRootLevel,
}: OrganisationUnitTreeToolbarProps) => {
    const { liveValue: search, setValue: setSearchValue } = useDebouncedState({
        onSetDebouncedValue: onSearchChange,
        initialValue: '',
        delay: 250,
    })
    return (
        <div className={css.toolbarWrapper}>
            <InputField
                className={css.searchField}
                placeholder={i18n.t('Search for organisation units')}
                value={search}
                onChange={(payload) => {
                    setSearchValue(payload.value ?? '')
                }}
                clearable
                dense
            />
            <OrgUnitLevelGroupSelect
                onGroupSelect={onGroupSelect}
                onLevelSelect={onLevelSelect}
                onGroupDeselect={onGroupDeselect}
                onLevelDeselect={onLevelDeselect}
                onDeselectAll={onDeselectAll}
                minlevel={minRootLevel}
            />
        </div>
    )
}

const OrganisationUnitTreeWithSelectedList = (
    props: OrganisationUnitFieldProps
) => {
    return (
        <div className={css.treeSelectedListWrapper}>
            <OrganisationUnitTreeWithToolbar {...props} />
            <OrganisationUnitSelectedList selected={props.selected} />
        </div>
    )
}

export const OrganisationUnitTreeWithToolbarFormField = ({
    name,
    label,
    ...treeProps
}: Omit<OrganisationUnitFieldProps, 'onChange' | 'selected'> & {
    name?: string
    label?: string
}) => {
    const resolvedName = name ?? 'organisationUnits'
    return (
        <Field<OrganisationUnitValue[]>
            name={resolvedName}
            render={(renderProps) => (
                <FieldWrapper
                    name={resolvedName}
                    meta={renderProps.meta}
                    label={label}
                >
                    <OrganisationUnitTreeWithSelectedList
                        {...treeProps}
                        onChange={(val) => {
                            renderProps.input.onChange(val)
                            renderProps.input.onBlur()
                        }}
                        selected={renderProps.input.value}
                    />
                </FieldWrapper>
            )}
            format={(p) => p ?? []}
        />
    )
}
