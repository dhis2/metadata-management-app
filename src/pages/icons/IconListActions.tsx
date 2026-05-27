import i18n from '@dhis2/d2-i18n'
import {
    Button,
    colors,
    FlyoutMenu,
    IconEdit16,
    IconInfo16,
    IconMore24,
    MenuItem,
    Popover,
} from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListActions } from '../../components/sectionList/listActions'
import { DeleteAction } from '../../components/sectionList/listActions/DeleteAction'
import css from '../../components/sectionList/listActions/SectionListActions.module.css'
import { getSectionPath, SECTIONS_MAP } from '../../lib'
import { IconModel } from './List'

type IconListActionsProps = {
    model: IconModel
    onShowDetailsClick: (model: IconModel) => void
    onDeleteSuccess: (model: IconModel) => void
}

export const IconListActions = ({
    model,
    onShowDetailsClick,
    onDeleteSuccess,
}: IconListActionsProps) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const navigate = useNavigate()

    return (
        <ListActions>
            <div ref={ref}>
                <Button
                    small
                    secondary
                    onClick={() => setOpen(!open)}
                    dataTest="row-actions-menu-button"
                    icon={<IconMore24 color={colors.grey600} />}
                />
                {open && (
                    <Popover
                        className={css.actionMorePopover}
                        arrow={false}
                        placement="bottom-end"
                        reference={ref}
                        onClickOutside={() => setOpen(false)}
                        dataTest="row-actions-menu"
                    >
                        <FlyoutMenu>
                            <MenuItem
                                dense
                                label={i18n.t('Show details')}
                                icon={<IconInfo16 />}
                                onClick={() => {
                                    onShowDetailsClick(model)
                                    setOpen(false)
                                }}
                            />
                            <MenuItem
                                dense
                                label={i18n.t('Edit')}
                                icon={<IconEdit16 />}
                                onClick={() => {
                                    navigate(
                                        `/${getSectionPath(
                                            SECTIONS_MAP.icon
                                        )}/${model.key}`
                                    )
                                    setOpen(false)
                                }}
                            />
                            <DeleteAction
                                disabled={false}
                                modelId={model.key}
                                modelDisplayName={model.key}
                                onDeleteSuccess={() => {
                                    onDeleteSuccess(model)
                                    setOpen(false)
                                }}
                                onCancel={() => setOpen(false)}
                            />
                        </FlyoutMenu>
                    </Popover>
                )}
            </div>
        </ListActions>
    )
}
