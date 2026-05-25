import { FetchError, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientDateTime } from '../../components/date'
import {
    DetailItem,
    DetailsList,
    DetailsPanel,
    DetailsPanelContent,
} from '../../components/sectionList/detailsPanel'
import { FilterWrapper } from '../../components/sectionList/filters/FilterWrapper'
import { useModelListView } from '../../components/sectionList/listView'
import { ModelValueRenderer } from '../../components/sectionList/modelValue/ModelValueRenderer'
import { TextValue } from '../../components/sectionList/modelValue/TextValue'
import { SectionList } from '../../components/sectionList/SectionList'
import { SectionListPagination } from '../../components/sectionList/SectionListPagination'
import { DefaultSectionListMessage } from '../../components/sectionList/SectionListWrapper'
import { DefaultToolbar } from '../../components/sectionList/toolbar'
import { SelectedColumn } from '../../components/sectionList/types'
import {
    getIn,
    getSectionPath,
    IDENTIFIABLE_FILTER_KEY,
    SchemaFieldPropertyType,
    SECTIONS_MAP,
    usePaginationQueryParams,
    useSectionListFilter,
} from '../../lib'
import { ModelCollection, PagedResponse, WrapQueryResponse } from '../../types'
import css from './IconList.module.css'
import { IconListActions } from './IconListActions'
import { IconListRow } from './IconListRow'

export type IconModel = {
    key: string
    description: string
    href: string
    custom: boolean
    keywords?: string[]
    lastUpdated?: string
    created?: string
    createdBy?: { displayName: string; id: string }
    sharing?: { public: string }
}

type IconsListResponse = WrapQueryResponse<PagedResponse<IconModel, 'icons'>>

export const Component = () => {
    const { columns: headerColumns } = useModelListView()
    const engine = useDataEngine()
    const navigate = useNavigate()
    const [paginationParams] = usePaginationQueryParams()
    const [identifiableFilter] = useSectionListFilter(IDENTIFIABLE_FILTER_KEY)

    const query = {
        result: {
            resource: 'icons',
            params: {
                type: 'CUSTOM',
                fields: [
                    'key',
                    'description',
                    'href',
                    'custom',
                    'keywords',
                    'lastUpdated',
                    'created',
                    'createdBy[id,displayName]',
                    'sharing',
                ],
                page: paginationParams.page,
                pageSize: paginationParams.pageSize,
                ...(identifiableFilter?.trim()
                    ? { search: identifiableFilter.trim() }
                    : {}),
            },
        },
    }

    const { data, error, refetch } = useQuery({
        queryKey: [query],
        queryFn: ({ queryKey: [query], signal }) =>
            engine.query(query, { signal }) as Promise<IconsListResponse>,
    })

    const iconList = data?.result?.icons
    const pager = data?.result?.pager

    const [detailsIcon, setDetailsIcon] = useState<IconModel | undefined>()

    const handleDetailsClick = useCallback((icon: IconModel) => {
        setDetailsIcon((prev) => (prev?.key === icon.key ? undefined : icon))
    }, [])

    const handleRowClick = useCallback(
        (icon: IconModel) => {
            navigate(`/${getSectionPath(SECTIONS_MAP.icon)}/${icon.key}`)
        },
        [navigate]
    )

    const renderColumnValue = useCallback(
        ({ path }: SelectedColumn, icon: IconModel) => {
            if (path === 'href') {
                return icon.href ? (
                    <img
                        src={icon.href}
                        alt={icon.key}
                        className={css.iconThumbnail}
                    />
                ) : null
            }

            const value = getIn(icon, path)

            if (path === 'keywords' && Array.isArray(value)) {
                return <TextValue value={(value as string[]).join(', ')} />
            }

            if (value === undefined || value === null) {
                return null
            }

            const propertyType: SchemaFieldPropertyType =
                path === 'lastUpdated' || path === 'created'
                    ? SchemaFieldPropertyType.DATE
                    : SchemaFieldPropertyType.TEXT

            return (
                <ModelValueRenderer
                    path={path}
                    value={value}
                    propertyType={propertyType}
                />
            )
        },
        []
    )

    return (
        <div>
            <FilterWrapper />
            <div className={css.listDetailsWrapper}>
                <DefaultToolbar
                    selectedModels={new Set()}
                    onDeselectAll={() => {}}
                    downloadable={false}
                />
                <SectionList headerColumns={headerColumns}>
                    <DefaultSectionListMessage
                        error={error as FetchError | undefined}
                        data={iconList as unknown as ModelCollection}
                    />
                    {iconList?.map((icon) => (
                        <IconListRow
                            key={icon.key}
                            modelData={icon}
                            selectedColumns={headerColumns}
                            onClick={handleRowClick}
                            active={icon.key === detailsIcon?.key}
                            renderColumnValue={renderColumnValue}
                            renderActions={() => (
                                <IconListActions
                                    model={icon}
                                    onShowDetailsClick={handleDetailsClick}
                                    onDeleteSuccess={() => {
                                        if (detailsIcon?.key === icon.key) {
                                            setDetailsIcon(undefined)
                                        }
                                        refetch()
                                    }}
                                />
                            )}
                        />
                    ))}
                    <SectionListPagination pager={pager} />
                </SectionList>
                {detailsIcon && (
                    <DetailsPanel
                        onClose={() => setDetailsIcon(undefined)}
                        key={detailsIcon.key}
                    >
                        <DetailsPanelContent displayName={detailsIcon.key}>
                            {detailsIcon.href && (
                                <img
                                    src={detailsIcon.href}
                                    alt={detailsIcon.key}
                                    className={css.iconDetailsThumbnail}
                                />
                            )}
                            <DetailsList>
                                {detailsIcon.description && (
                                    <DetailItem label={i18n.t('Description')}>
                                        {detailsIcon.description}
                                    </DetailItem>
                                )}
                                {!!detailsIcon.keywords?.length && (
                                    <DetailItem label={i18n.t('Keywords')}>
                                        {detailsIcon.keywords.join(', ')}
                                    </DetailItem>
                                )}
                                {detailsIcon.lastUpdated && (
                                    <DetailItem label={i18n.t('Last updated')}>
                                        <ClientDateTime
                                            value={detailsIcon.lastUpdated}
                                        />
                                    </DetailItem>
                                )}
                                {detailsIcon.created && (
                                    <DetailItem label={i18n.t('Created')}>
                                        <ClientDateTime
                                            value={detailsIcon.created}
                                        />
                                    </DetailItem>
                                )}
                                {detailsIcon.createdBy && (
                                    <DetailItem label={i18n.t('Created by')}>
                                        {detailsIcon.createdBy.displayName}
                                    </DetailItem>
                                )}
                            </DetailsList>
                        </DetailsPanelContent>
                    </DetailsPanel>
                )}
            </div>
        </div>
    )
}
