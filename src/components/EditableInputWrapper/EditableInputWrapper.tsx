import i18n from '@dhis2/d2-i18n'
import { Box, Button, IconAdd16, IconSync16, Tooltip } from '@dhis2/ui'
import React from 'react'
import classes from './EditableInputWrapper.module.css'

export function EditableInputWrapper({
    children,
    onRefresh,
    onAddNew,
    inputWidth = '400px',
}: Readonly<{
    children: React.ReactNode
    onRefresh: () => void
    onAddNew: () => void
    inputWidth?: string
}>) {
    return (
        <div className={classes.wrapper}>
            <Box width={inputWidth} minWidth="100px">
                {children}
            </Box>
            <div className={classes.actions}>
                <Tooltip content={i18n.t('Refresh')}>
                    <Button
                        secondary
                        icon={<IconSync16 />}
                        onClick={onRefresh}
                    ></Button>
                </Tooltip>
                <Tooltip content={i18n.t('Add new')}>
                    <Button
                        secondary
                        icon={<IconAdd16 />}
                        onClick={onAddNew}
                    ></Button>
                </Tooltip>
            </div>
        </div>
    )
}
