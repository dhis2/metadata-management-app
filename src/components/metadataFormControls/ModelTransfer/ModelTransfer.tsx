import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, Checkbox } from '@dhis2/ui'
import { useInfiniteQuery } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { useHref } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import { getSectionNewPath } from '../../../lib'
import { useBoundResourceQueryFn } from '../../../lib/query/useBoundQueryFn'
import type { SectionFormValues } from '../../../pages/dataSets/form/dataEntryForm/sectionForm'
import { PlainResourceQuery } from '../../../types'
import { PagedResponse } from '../../../types/generated'
import { DisplayableModel } from '../../../types/models'
import { ModelSection } from '../../../types/section'
import {
    AddNewDrawerFormFooter,
    DrawerFormFooter,
    DrawerHeader,
    DrawerPortal,
    DrawerRoot,
} from '../../drawer'
import { LinkButton } from '../../LinkButton'
import { BaseModelTransfer, BaseModelTransferProps } from './BaseModelTransfer'
import css from './ModelTransfer.module.css'

type Response<Model> = PagedResponse<Model, string>

const defaultQuery = {
    params: {
        order: 'displayName:asc',
        fields: ['id', 'displayName'],
    },
}

export type NewItemFormComponent = React.ComponentType<{
    onSubmitted?: () => void
    footer?: React.ReactNode
    redirectOnSubmitted?: boolean
}>

export type ModelTranferProps<
    TModel extends DisplayableModel,
    TModelData
> = Omit<BaseModelTransferProps<TModel>, 'available' | 'filterable'> & {
    query: Omit<PlainResourceQuery, 'id'>
    transform?: (value: TModelData[]) => TModel[]
    filterUnassignedTo?: string
    NewItemForm?: NewItemFormComponent
    newItemFormHeader?: string
    newItemFormFooterInfo?: string
}

export type ModelTransferPropsFor<
    TModel extends DisplayableModel,
    TModelData
> = Omit<
    ModelTranferProps<TModel, TModelData>,
    | 'leftHeader'
    | 'rightHeader'
    | 'filterPlaceholder'
    | 'filterPlaceholderPicked'
    | 'newItemFormHeader'
    | 'NewItemForm'
> & {
    transferSection: ModelSection
}

export const ModelTransferFrom = <
    TModel extends DisplayableModel,
    TModelData extends DisplayableModel = TModel
>({
    transferSection,
    ...rest
}: ModelTransferPropsFor<TModel, TModelData>) => {
    const [NewItemForm, setNewItemForm] = useState<
        NewItemFormComponent | undefined
    >()

    useEffect(() => {
        import(`../../../pages/${transferSection.namePlural}/New`)
            .then((m: { Component: NewItemFormComponent }) =>
                setNewItemForm(() => m.Component)
            )
            .catch(() => setNewItemForm(undefined))
    }, [transferSection.namePlural])

    return (
        <ModelTransfer
            leftHeader={i18n.t('Available {{name}}', {
                name: transferSection.titlePlural,
            })}
            rightHeader={i18n.t('Selected {{name}}', {
                name: transferSection.titlePlural,
            })}
            filterPlaceholder={i18n.t('Filter available {{name}}', {
                name: transferSection.titlePlural,
            })}
            filterPlaceholderPicked={i18n.t('Filter selected {{name}}', {
                name: transferSection.titlePlural,
            })}
            newItemFormHeader={i18n.t('Add new {{name}}', {
                name: transferSection.title,
            })}
            newItemFormFooterInfo={i18n.t(
                "Saving this {{name}} won't apply unsaved changes in the form below.",
                { name: transferSection.title.toLowerCase() }
            )}
            NewItemForm={NewItemForm}
            {...rest}
        />
    )
}

export const ModelTransfer = <
    TModel extends DisplayableModel,
    TModelData extends DisplayableModel = TModel
>({
    selected,
    query,
    leftHeader,
    rightHeader,
    leftFooter,
    filterPlaceholder,
    filterPlaceholderPicked,
    transform,
    filterUnassignedTo,
    NewItemForm,
    newItemFormHeader,
    newItemFormFooterInfo,
    height = '360px',
    optionsWidth = '480px',
    selectedWidth = '480px',
    ...baseModelTransferProps
}: ModelTranferProps<TModel, TModelData>) => {
    const queryFn = useBoundResourceQueryFn()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterUnassigned, setFilterUnassigned] = useState(false)
    const searchFilter = searchTerm
        ? `identifiable:token:${searchTerm}`
        : undefined
    const unassignedFilter = filterUnassigned
        ? `${filterUnassignedTo}:eq:0`
        : undefined
    const filter: string[] = [searchFilter, unassignedFilter].filter(
        Boolean
    ) as []

    const params = query.params

    const queryObject = {
        ...query,
        params: {
            ...defaultQuery.params,
            ...params,
            filter: filter.concat(params?.filter || []),
        },
    }
    const modelName = query.resource
    const newLink = useHref(`/${getSectionNewPath(modelName)}`)

    const queryResult = useInfiniteQuery({
        queryKey: [queryObject] as const,
        queryFn: queryFn<Response<TModel>>,
        keepPreviousData: true,
        getNextPageParam: (lastPage) =>
            lastPage.pager.nextPage ? lastPage.pager.page + 1 : undefined,
        getPreviousPageParam: (firstPage) =>
            firstPage.pager.prevPage ? firstPage.pager.page - 1 : undefined,
    })
    const allDataMap = useMemo(
        () => queryResult.data?.pages.flatMap((page) => page[modelName]) ?? [],
        [queryResult.data, modelName]
    )

    const transformedData = useMemo(
        () =>
            transform
                ? transform(allDataMap as unknown as TModelData[])
                : allDataMap,
        [allDataMap, transform]
    )

    const handleFilterChange = useDebouncedCallback(({ value }) => {
        if (value != undefined) {
            setSearchTerm(value)
        }
    }, 250)

    return (
        <BaseModelTransfer
            height={height}
            optionsWidth={optionsWidth}
            selectedWidth={selectedWidth}
            enableOrderChange
            filterable
            filterablePicked
            onEndReached={queryResult.fetchNextPage}
            available={transformedData}
            selected={selected}
            onFilterChange={handleFilterChange}
            filterPlaceholder={
                filterPlaceholder || i18n.t('Filter available items')
            }
            filterPlaceholderPicked={
                filterPlaceholderPicked || i18n.t('Filter selected items')
            }
            leftHeader={
                <div className={css.modelTransferHeaderWithUnassignedFilter}>
                    {leftHeader}
                    {filterUnassignedTo && (
                        <Checkbox
                            label={i18n.t('Show only unassigned items')}
                            onChange={() => {
                                setFilterUnassigned((prevState) => !prevState)
                            }}
                            checked={filterUnassigned}
                        />
                    )}
                </div>
            }
            rightHeader={<TransferHeader>{rightHeader}</TransferHeader>}
            leftFooter={
                leftFooter ?? (
                    <DefaultTransferLeftFooter
                        onRefreshClick={queryResult.refetch}
                        newLink={newLink}
                        NewItemForm={NewItemForm}
                        newItemFormHeader={newItemFormHeader}
                        newItemFormFooterInfo={newItemFormFooterInfo}
                    />
                )
            }
            {...baseModelTransferProps}
        />
    )
}

export const TransferHeader = ({ children }: { children: React.ReactNode }) => {
    if (typeof children === 'string') {
        return <div className={css.modelTransferHeader}>{children}</div>
    }
    return <>{children}</>
}

export const DefaultTransferLeftFooter = ({
    onRefreshClick,
    newLink,
    NewItemForm,
    newItemFormHeader,
    newItemFormFooterInfo,
}: {
    onRefreshClick: () => void
    newLink: string
    NewItemForm?: NewItemFormComponent
    newItemFormHeader?: string
    newItemFormFooterInfo?: string
}) => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    return (
        <>
            <DrawerRoot />
            <ButtonStrip className={css.modelTransferFooter}>
                <Button small onClick={onRefreshClick}>
                    {i18n.t('Refresh list')}
                </Button>

                {NewItemForm ? (
                    <Button small onClick={() => setDrawerOpen(true)}>
                        {i18n.t('Add new')}
                    </Button>
                ) : (
                    <LinkButton small href={newLink} target="_blank">
                        {i18n.t('Add new')}
                    </LinkButton>
                )}
            </ButtonStrip>
            {NewItemForm && (
                <DrawerPortal
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    header={
                        <DrawerHeader onClose={() => setDrawerOpen(false)}>
                            {newItemFormHeader ?? i18n.t('Add new')}
                        </DrawerHeader>
                    }
                    disableFocusTrap
                >
                    <NewItemForm
                        onSubmitted={() => {
                            onRefreshClick()
                            setDrawerOpen(false)
                        }}
                        redirectOnSubmitted={false}
                        footer={
                            <AddNewDrawerFormFooter
                                onCancel={() => setDrawerOpen(false)}
                                newItemFormFooterInfo={newItemFormFooterInfo}
                            />
                        }
                    />
                </DrawerPortal>
            )}
        </>
    )
}
