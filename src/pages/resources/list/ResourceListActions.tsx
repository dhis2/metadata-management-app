import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    FlyoutMenu,
    IconEdit16,
    IconInfo16,
    IconLaunch16,
    IconShare16,
    MenuItem,
    Popover,
} from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import { useHref, useLinkClickHandler } from 'react-router-dom'
import {
    ActionShowDetails,
    ListActions,
} from '../../../components/sectionList/listActions'
import { DefaultListActionProps } from '../../../components/sectionList/listActions/DefaultListActions'
import { DeleteAction } from '../../../components/sectionList/listActions/DeleteAction'
import { TooltipWrapper } from '../../../components/tooltip'
import {
    BaseListModel,
    TOOLTIPS,
    canDeleteModel,
    canEditModel,
    useLocationSearchState,
    useSchemaFromHandle,
} from '../../../lib'

type ResourceListModel = BaseListModel & {
    external?: boolean
}

const useOpenResource = () => {
    const { baseUrl } = useConfig()
    return (id: string) => {
        const url = `${baseUrl}/api/documents/${id}/data`
        window.open(url, '_blank', 'noopener,noreferrer')
    }
}

export const ResourceListActions = ({
    model,
    onShowDetailsClick,
    onOpenSharingClick,
    onDeleteSuccess,
}: DefaultListActionProps) => {
    const schema = useSchemaFromHandle()
    const resource = model as ResourceListModel
    const deletable = canDeleteModel(model)
    const editable = canEditModel(model)
    const shareable = schema.shareable
    // Only URL (external) resources can be edited - uploaded files are not editable.
    const showEdit = editable && !!resource.external

    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const openResource = useOpenResource()
    const editHref = useHref(model.id, { relative: 'path' })
    const preservedSearchState = useLocationSearchState()
    const handleEditClick = useLinkClickHandler(
        { pathname: model.id },
        { state: preservedSearchState }
    )

    return (
        <ListActions>
            <ActionShowDetails onClick={() => onShowDetailsClick(model)} />
            <div ref={ref}>
                <Button
                    small
                    secondary
                    onClick={() => setOpen(!open)}
                    dataTest="row-actions-menu-button"
                    icon={
                        <svg
                            width="22"
                            height="24"
                            viewBox="0 0 22 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6 11C6.55228 11 7 11.4477 7 12C7 12.5523 6.55228 13 6 13C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11ZM11 11C11.5523 11 12 11.4477 12 12C12 12.5523 11.5523 13 11 13C10.4477 13 10 12.5523 10 12C10 11.4477 10.4477 11 11 11ZM16 11C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13C15.4477 13 15 12.5523 15 12C15 11.4477 15.4477 11 16 11Z"
                                fill="#6C7787"
                            />
                        </svg>
                    }
                />
                {open && (
                    <Popover
                        arrow={false}
                        placement="bottom-end"
                        reference={ref}
                        onClickOutside={() => setOpen(false)}
                        dataTest="row-actions-menu"
                    >
                        <FlyoutMenu>
                            <MenuItem
                                dense
                                label={i18n.t('View resource')}
                                icon={<IconLaunch16 />}
                                onClick={() => {
                                    openResource(model.id)
                                    setOpen(false)
                                }}
                                dataTest="row-actions-view-resource"
                            />
                            {showEdit && (
                                <MenuItem
                                    dense
                                    label={i18n.t('Edit')}
                                    icon={<IconEdit16 />}
                                    href={editHref}
                                    onClick={(_, e) => {
                                        handleEditClick(e)
                                        setOpen(false)
                                    }}
                                    dataTest="row-actions-edit"
                                />
                            )}
                            <MenuItem
                                dense
                                label={i18n.t('Show details')}
                                icon={<IconInfo16 />}
                                onClick={() => {
                                    onShowDetailsClick(model)
                                    setOpen(false)
                                }}
                            />
                            {shareable && (
                                <TooltipWrapper
                                    condition={!editable}
                                    content={TOOLTIPS.noEditAccess}
                                >
                                    <MenuItem
                                        dense
                                        disabled={!editable}
                                        label={i18n.t('Sharing settings')}
                                        icon={<IconShare16 />}
                                        onClick={() => {
                                            onOpenSharingClick(model.id)
                                            setOpen(false)
                                        }}
                                    />
                                </TooltipWrapper>
                            )}
                            <TooltipWrapper
                                condition={!deletable}
                                content={TOOLTIPS.noDeleteAccess}
                            >
                                <DeleteAction
                                    modelId={model.id}
                                    modelDisplayName={model.displayName}
                                    disabled={!deletable}
                                    onDeleteSuccess={() => {
                                        onDeleteSuccess(model)
                                        setOpen(false)
                                    }}
                                    onCancel={() => setOpen(false)}
                                />
                            </TooltipWrapper>
                        </FlyoutMenu>
                    </Popover>
                )}
            </div>
        </ListActions>
    )
}
