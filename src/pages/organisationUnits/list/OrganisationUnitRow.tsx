import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Checkbox,
    DataTableCell,
    DataTableRow,
    IconChevronDown16,
    IconChevronRight16,
} from '@dhis2/ui'
import { flexRender, Row } from '@tanstack/react-table'
import cx from 'classnames'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BaseListModel, useLocationSearchState } from '../../../lib'
import { canEditModel } from '../../../lib/models/access'
import type { OrganisationUnitListItem } from './OrganisationUnitList'
import css from './OrganisationUnitList.module.css'
import { OrganisationUnitListActions } from './OrganisationUnitListActions'

export const OrganisationUnitRow = ({
    row,
    isFiltering,
    fetchNextPage,
    onShowDetailsClick,
    hasErrored,
    onOpenTranslationClick,
}: {
    row: Row<OrganisationUnitListItem>
    isFiltering: boolean
    fetchNextPage: (id: string) => void
    onShowDetailsClick: (model: BaseListModel) => void
    hasErrored: boolean
    onOpenTranslationClick: (model: BaseListModel) => void
}) => {
    const parentRow = row.getParentRow()
    const navigate = useNavigate()
    const preservedSearchState = useLocationSearchState()
    const editAccess = canEditModel(row.original)

    const handleRowClick = useCallback(
        (model: BaseListModel) => {
            if (!canEditModel(model)) {
                return
            }
            navigate(model.id, {
                relative: 'path',
                state: preservedSearchState,
            })
        },
        [navigate, preservedSearchState]
    )

    return (
        <>
            <DataTableRow
                className={cx(css.orgUnitRow, {
                    [css.clickable]: editAccess,
                })}
                key={row.id}
            >
                <DataTableCell className={css.selectionCell}>
                    <span
                        style={{
                            paddingInlineStart: `${row.depth * 1}rem`,
                            display: 'flex',
                        }}
                    >
                        {row.getCanExpand() ? (
                            <>
                                <Button
                                    className={css.expandButton}
                                    secondary
                                    small
                                    type="button"
                                    dataTest="row-expand-icon"
                                    loading={
                                        row.getIsExpanded() &&
                                        row.subRows.length < 1 &&
                                        !hasErrored
                                    }
                                    icon={
                                        row.getIsExpanded() ? (
                                            <IconChevronDown16 />
                                        ) : (
                                            <IconChevronRight16 />
                                        )
                                    }
                                    onClick={row.getToggleExpandedHandler()}
                                ></Button>
                            </>
                        ) : (
                            <span style={{ width: 26 }} />
                        )}
                        <Checkbox
                            dense
                            checked={row.getIsSelected()}
                            onChange={({ checked }) =>
                                row.toggleSelected(checked)
                            }
                        />
                    </span>
                </DataTableCell>
                {row.getVisibleCells().map((cell) => {
                    return (
                        <DataTableCell
                            key={cell.id}
                            onClick={() => handleRowClick(row.original)}
                        >
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                        </DataTableCell>
                    )
                })}
                <DataTableCell>
                    <OrganisationUnitListActions
                        model={row.original}
                        onShowDetailsClick={onShowDetailsClick}
                        onOpenTranslationClick={onOpenTranslationClick}
                    />
                </DataTableCell>
            </DataTableRow>
            {!isFiltering &&
                parentRow &&
                parentRow.getIsExpanded() &&
                parentRow.subRows.length < parentRow?.original.childCount &&
                row === parentRow.subRows[parentRow.subRows.length - 1] && (
                    <DataTableRow>
                        <DataTableCell
                            colSpan="100"
                            style={{ textAlign: 'center' }}
                            onClick={() => fetchNextPage(parentRow.original.id)}
                        >
                            {i18n.t('Load more for {{orgUnitName}}', {
                                orgUnitName: parentRow.original.displayName,
                            })}
                        </DataTableCell>
                    </DataTableRow>
                )}
        </>
    )
}
