import { useDataEngine, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Box,
    Button,
    DataTable,
    DataTableColumnHeader,
    DataTableRow,
    DataTableSortDirection,
    MultiSelect,
    MultiSelectOption,
    SharingDialog,
    TableBody,
    TableHead,
} from '@dhis2/ui'
import React, { useMemo, useRef, useState } from 'react'
import { useSidebarLinks } from '../../../app/sidebar/SidebarLinks'
import { IdentifiableFilter } from '../../../components'
import { Loader } from '../../../components/loading'
import {
    DetailsContent,
    DetailsResponse,
} from '../../../components/sectionList/detailsPanel'
import { DetailsPanel } from '../../../components/sectionList/detailsPanel/DetailsPanel'
import type { Schema } from '../../../lib'
import { SchemaName, useSchemas, useSectionListFilter } from '../../../lib'
import type { Access } from '../../../types/generated'
import css from './ListOfAll.module.css'
import { MetadataTypeList } from './MetadataTypeList'

export type ListItem = {
    id: string
    displayName: string
    lastUpdated?: string
    sharing?: { public?: string }
    access: Access
}

type ActiveModel = { model: ListItem; schema: Schema }

const detailFields = [
    'id',
    'displayName',
    'displayShortName',
    'code',
    'created',
    'lastUpdated',
    'lastUpdatedBy',
    'createdBy',
    'href',
    'access',
] as const
const ListOfAllDetailsPanelContent = ({
    modelId,
    schema,
}: {
    modelId: string
    schema: Schema
}) => {
    const queryRef = useRef({
        result: {
            resource: schema.plural,
            id: modelId,
            params: {
                fields: detailFields
                    .filter((f) => !!schema.properties[f])
                    .concat('id'),
            },
        },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryResponse = useDataQuery<any>(queryRef.current)

    return (
        <Loader queryResponse={queryResponse}>
            <DetailsContent
                data={
                    queryResponse.data?.result as NonNullable<DetailsResponse>
                }
                withEditButton={false}
            />
        </Loader>
    )
}

const excludedMetadataTypes = [
    'locale',
    'icon',
    'organisationUnit',
    'organisationUnitLevel',
]

export const ListOfAll = () => {
    const engine = useDataEngine()
    const schemas = useSchemas()
    const sidebarLinks = useSidebarLinks()
    const [filter, setFilter] = useSectionListFilter('identifiable')

    const [detailsModel, setDetailsModel] = useState<ActiveModel | null>(null)
    const [sharingModel, setSharingModel] = useState<ActiveModel | null>(null)
    const [selectedSchemas, setSelectedSchemas] = useState<string[]>([])
    const [sortOrder, setSortOrder] = useState<
        [string, 'asc' | 'desc'] | undefined
    >(['lastUpdated', 'desc'])

    const allSchemaList = useMemo(
        () =>
            sidebarLinks
                .flatMap(({ links }) => links)
                .filter(({ to }) => !to.startsWith('overview/'))
                .filter(
                    ({ section }) =>
                        !excludedMetadataTypes.includes(section.name)
                )
                .map(({ section }) => schemas[section.name as SchemaName])
                .filter((s): s is Schema => !!s),
        [sidebarLinks, schemas]
    )

    const schemaList = useMemo(
        () =>
            selectedSchemas.length === 0
                ? allSchemaList
                : allSchemaList.filter((s) =>
                      selectedSchemas.includes(s.singular)
                  ),
        [allSchemaList, selectedSchemas]
    )

    const handleSortChange = ({
        name,
        direction,
    }: {
        name?: string
        direction: DataTableSortDirection
    }) => {
        if (!name || direction === 'default') {
            setSortOrder(undefined)
        } else {
            setSortOrder([name, direction as 'asc' | 'desc'])
        }
    }

    const getSortDirection = (path: string): DataTableSortDirection => {
        if (!sortOrder || sortOrder[0] !== path) {
            return 'default'
        }
        return sortOrder[1]
    }

    return (
        <div>
            <div className={css.filterRow}>
                <IdentifiableFilter />
                <Box width={'500px'} minWidth={'500px'}>
                    <MultiSelect
                        dense
                        filterable
                        filterPlaceholder={i18n.t('Search metadata types')}
                        placeholder={i18n.t('All metadata types')}
                        selected={selectedSchemas}
                        onChange={({ selected }: { selected: string[] }) =>
                            setSelectedSchemas(selected)
                        }
                    >
                        {allSchemaList.map((s) => (
                            <MultiSelectOption
                                key={s.singular}
                                label={s.displayName}
                                value={s.singular}
                            />
                        ))}
                    </MultiSelect>
                </Box>
                {(!!filter || selectedSchemas.length > 0) && (
                    <Button
                        small
                        onClick={() => {
                            setFilter(undefined)
                            setSelectedSchemas([])
                        }}
                        dataTest="clear-all-filters-button"
                    >
                        {i18n.t('Clear all filters')}
                    </Button>
                )}
            </div>

            <div className={css.listDetailsWrapper}>
                <DataTable className={css.table}>
                    <TableHead>
                        <DataTableRow>
                            <DataTableColumnHeader width="32px" />
                            <DataTableColumnHeader
                                sortDirection={getSortDirection('displayName')}
                                onSortIconClick={handleSortChange}
                                name="displayName"
                            >
                                {i18n.t('Name')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader
                                sortDirection={getSortDirection('lastUpdated')}
                                onSortIconClick={handleSortChange}
                                name="lastUpdated"
                            >
                                {i18n.t('Last updated')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Public access')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Actions')}
                            </DataTableColumnHeader>
                        </DataTableRow>
                    </TableHead>
                    <TableBody>
                        {schemaList.map((schema) => (
                            <MetadataTypeList
                                key={schema.singular}
                                schema={schema}
                                engine={engine}
                                filter={filter}
                                sortOrder={sortOrder}
                                onShowDetails={(model, s) =>
                                    setDetailsModel({ model, schema: s })
                                }
                                onOpenSharing={(model, s) =>
                                    setSharingModel({ model, schema: s })
                                }
                                onDeleteSuccess={() => setDetailsModel(null)}
                            />
                        ))}
                    </TableBody>
                </DataTable>

                {detailsModel && (
                    <DetailsPanel
                        onClose={() => setDetailsModel(null)}
                        key={detailsModel.model.id}
                    >
                        <ListOfAllDetailsPanelContent
                            modelId={detailsModel.model.id}
                            schema={detailsModel.schema}
                        />
                    </DetailsPanel>
                )}
            </div>

            {sharingModel && (
                <SharingDialog
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    type={sharingModel.schema.singular as any}
                    id={sharingModel.model.id}
                    onClose={() => setSharingModel(null)}
                />
            )}
        </div>
    )
}
