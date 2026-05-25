import { DataTableCell, DataTableRow } from '@dhis2/ui'
import cx from 'classnames'
import React from 'react'
import css from '../../components/sectionList/SectionList.module.css'
import {
    SelectedColumn,
    SelectedColumns,
} from '../../components/sectionList/types'
import { IconModel } from './List'

export type IconListRowProps = {
    modelData: IconModel
    selectedColumns: SelectedColumns
    renderActions: (model: IconModel) => React.ReactNode
    renderColumnValue: (
        column: SelectedColumn,
        modelData: IconModel
    ) => React.ReactNode
    onClick?: (modelData: IconModel) => void
    active?: boolean
}

export const IconListRow = React.memo(function IconListRow({
    active,
    selectedColumns,
    modelData,
    onClick,
    renderActions,
    renderColumnValue,
}: IconListRowProps) {
    return (
        <DataTableRow
            className={cx(css.listRow, { [css.active]: active })}
            dataTest="section-list-row"
        >
            <DataTableCell width="48px" />
            {selectedColumns.map((selectedColumn) => (
                <DataTableCell
                    key={selectedColumn.path}
                    onClick={() => onClick?.(modelData)}
                >
                    {renderColumnValue(selectedColumn, modelData)}
                </DataTableCell>
            ))}
            <DataTableCell>{renderActions(modelData)}</DataTableCell>
        </DataTableRow>
    )
})
