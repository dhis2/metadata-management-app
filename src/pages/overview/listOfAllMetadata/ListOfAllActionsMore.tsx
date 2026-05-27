import i18n from '@dhis2/d2-i18n'
import {
    Button,
    FlyoutMenu,
    IconDuplicate16,
    IconEdit16,
    IconInfo16,
    IconShare16,
    MenuItem,
    Popover,
} from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteAction } from '../../../components/sectionList/listActions/DeleteAction'
import { TooltipWrapper } from '../../../components/tooltip'
import {
    canDeleteModel,
    canEditModel,
    getSectionPath,
    Schema,
    SCHEMA_SECTIONS,
    SchemaName,
    TOOLTIPS,
} from '../../../lib'
import { ModelSection } from '../../../types'
import { ListItem } from './ListOfAll'

const SCHEMA_NAME_TO_SECTION = Object.fromEntries(
    Object.values(SCHEMA_SECTIONS).map((s) => [s.name, s])
) as Record<string, (typeof SCHEMA_SECTIONS)[keyof typeof SCHEMA_SECTIONS]>

const getSectionPathForSchema = (schemaName: SchemaName): string => {
    const section = SCHEMA_NAME_TO_SECTION[schemaName]
    return section ? getSectionPath(section) : schemaName
}

const doesSectionSupportDeletes = (schema: Schema) => {
    return schema.name !== 'categoryOptionCombo'
}

export const ListOfAllActionsMore = ({
    model,
    schema,
    onShowDetails,
    onOpenSharing,
    onDeleteSuccess,
}: {
    model: ListItem
    schema: Schema
    onShowDetails: () => void
    onOpenSharing: () => void
    onDeleteSuccess: () => void
}) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const sectionPath = getSectionPathForSchema(schema.singular)
    const editable = canEditModel(model)
    const section = SCHEMA_NAME_TO_SECTION[schema.singular] as ModelSection
    const clonable = section.clonable
    const deletable = canDeleteModel(model)
    return (
        <div ref={ref}>
            <Button
                small
                secondary
                onClick={() => setOpen((o) => !o)}
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
                        <TooltipWrapper
                            condition={!editable}
                            content={TOOLTIPS.noEditAccess}
                        >
                            <MenuItem
                                dense
                                disabled={!editable}
                                label={i18n.t('Edit')}
                                icon={<IconEdit16 />}
                                onClick={() => {
                                    navigate(`/${sectionPath}/${model.id}`)
                                    setOpen(false)
                                }}
                            />
                        </TooltipWrapper>
                        {clonable && (
                            <TooltipWrapper
                                condition={!editable}
                                content={TOOLTIPS.noCloneAccess}
                            >
                                <MenuItem
                                    dense
                                    disabled={!editable}
                                    label={i18n.t('Clone')}
                                    icon={<IconDuplicate16 />}
                                    onClick={() => {
                                        navigate(
                                            `/${sectionPath}/clone?clonedId=${model.id}`
                                        )
                                        setOpen(false)
                                    }}
                                />
                            </TooltipWrapper>
                        )}
                        <MenuItem
                            dense
                            label={i18n.t('Show details')}
                            icon={<IconInfo16 />}
                            onClick={() => {
                                onShowDetails()
                                setOpen(false)
                            }}
                        />
                        {schema.shareable && (
                            <TooltipWrapper
                                condition={!editable}
                                content={TOOLTIPS.noCloneAccess}
                            >
                                <MenuItem
                                    dense
                                    disabled={!editable}
                                    label={i18n.t('Sharing settings')}
                                    icon={<IconShare16 />}
                                    onClick={() => {
                                        onOpenSharing()
                                        setOpen(false)
                                    }}
                                />
                            </TooltipWrapper>
                        )}
                        {doesSectionSupportDeletes(schema) && (
                            <DeleteAction
                                modelId={model.id}
                                modelDisplayName={model.displayName}
                                disabled={!deletable}
                                onDeleteSuccess={() => {
                                    onDeleteSuccess()
                                    setOpen(false)
                                }}
                                onCancel={() => setOpen(false)}
                                section={section}
                            />
                        )}
                    </FlyoutMenu>
                </Popover>
            )}
        </div>
    )
}
