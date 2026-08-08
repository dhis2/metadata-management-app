import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    colors,
    FlyoutMenu,
    IconDuplicate16,
    IconEdit16,
    IconMore16,
    IconMore24,
    IconShare16,
    IconTranslate16,
    InputField,
    MenuItem,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Popover,
} from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import { useHref, useLinkClickHandler } from 'react-router-dom'
import {
    ActionShowDetails,
    ListActions,
} from '../../components/sectionList/listActions'
import { DefaultListActionProps } from '../../components/sectionList/listActions/DefaultListActions'
import { DeleteAction } from '../../components/sectionList/listActions/DeleteAction'
import css from '../../components/sectionList/listActions/SectionListActions.module.css'
import { TooltipWrapper } from '../../components/tooltip'
import {
    TOOLTIPS,
    useLocationSearchState,
    useSchemaFromHandle,
    useCurrentUserAuthorities,
    hasAuthority,
    parseErrorResponse,
} from '../../lib'
import { canEditModel, canDeleteModel } from '../../lib/models/access'

// https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/metadata.html#copy-program
const PROGRAM_PUBLIC_ADD_AUTHORITY = 'F_PROGRAM_PUBLIC_ADD'
const PROGRAM_INDICATOR_PUBLIC_ADD_AUTHORITY = 'F_PROGRAM_INDICATOR_PUBLIC_ADD'

const CloneProgramModal = ({
    programId,
    programName,
    onClose,
}: {
    programId: string
    programName: string
    onClose: () => void
}) => {
    const [prefix, setPrefix] = useState(i18n.t('Copy of'))
    const [isCloning, setIsCloning] = useState(false)
    const engine = useDataEngine()

    const successAlert = useAlert(
        ({ message }: { message: string }) => message,
        { success: true }
    )
    const errorAlert = useAlert(({ message }: { message: string }) => message, {
        critical: true,
    })

    const handleClone = async () => {
        setIsCloning(true)
        try {
            const response = (await engine.mutate({
                resource: `programs/${programId}/copy`,
                type: 'create',
                data: {},
                params: { prefix },
            })) as { message?: string }

            successAlert.show({
                message:
                    response?.message ||
                    i18n.t('Successfully cloned program "{{- name}}"', {
                        name: programName,
                    }),
            })
            onClose()
        } catch (error) {
            errorAlert.show({
                message: i18n.t(
                    'Failed to clone program "{{- name}}": {{- error}}',
                    {
                        name: programName,
                        error: parseErrorResponse(error).message,
                        nsSeparator: '~:~',
                    }
                ),
            })
            onClose()
        } finally {
            setIsCloning(false)
        }
    }

    return (
        <Modal dataTest="clone-program-modal">
            <ModalTitle>{i18n.t('Clone program')}</ModalTitle>
            <ModalContent>
                <p>
                    {i18n.t(
                        'Create a complete copy of {{- name}} and its configuration, including stages, assigned data and attributes, and rule variables. Program rules that refer to the original program are not copied. Sharing and access settings will match the original program.',
                        { name: programName }
                    )}
                </p>
                <div style={{ marginTop: '16px' }}>
                    <InputField
                        dense
                        label={i18n.t('Prefix to apply to all copied objects')}
                        value={prefix}
                        onChange={({ value }) => setPrefix(value ?? '')}
                        disabled={isCloning}
                        dataTest="clone-program-prefix-input"
                    />
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button
                        onClick={onClose}
                        disabled={isCloning}
                        dataTest="clone-program-cancel-button"
                    >
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        loading={isCloning}
                        disabled={isCloning}
                        onClick={handleClone}
                        dataTest="clone-program-confirm-button"
                    >
                        {i18n.t('Clone program')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export const ProgramListActions = ({
    model,
    onShowDetailsClick,
    onOpenSharingClick,
    onOpenTranslationClick,
    onDeleteSuccess,
}: DefaultListActionProps) => {
    const schema = useSchemaFromHandle()
    const userAuthorities = useCurrentUserAuthorities()
    const [open, setOpen] = useState(false)
    const [showCloneModal, setShowCloneModal] = useState(false)
    const ref = useRef(null)
    const href = useHref(model.id, { relative: 'path' })
    const preservedSearchState = useLocationSearchState()

    const editable = canEditModel(model)
    const deletable = canDeleteModel(model)
    const shareable = schema.shareable

    const hasCloneAuthorities =
        hasAuthority(userAuthorities, PROGRAM_PUBLIC_ADD_AUTHORITY) &&
        hasAuthority(userAuthorities, PROGRAM_INDICATOR_PUBLIC_ADD_AUTHORITY)
    // access requirement (public rw, or user/group sharing rw) is captured by
    // the program's own computed `access.write`, same as edit/delete access
    const cloneable = editable && hasCloneAuthorities

    const handleEditClick = useLinkClickHandler(
        {
            pathname: model.id,
        },
        {
            state: preservedSearchState,
        }
    )

    return (
        <>
            <ListActions>
                <ActionShowDetails onClick={() => onShowDetailsClick(model)} />
                <div ref={ref}>
                    <Button
                        small
                        secondary
                        onClick={() => setOpen(!open)}
                        icon={<IconMore24 color={colors.grey600} />}
                        dataTest="row-actions-menu-button"
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
                                <TooltipWrapper
                                    condition={!editable}
                                    content={TOOLTIPS.noEditAccess}
                                >
                                    <MenuItem
                                        dense
                                        disabled={!editable}
                                        label={i18n.t('Edit')}
                                        icon={<IconEdit16 />}
                                        onClick={(_, e) => {
                                            handleEditClick(e)
                                            setOpen(false)
                                        }}
                                        target="_blank"
                                        href={href}
                                    />
                                </TooltipWrapper>
                                <TooltipWrapper
                                    condition={!cloneable}
                                    content={TOOLTIPS.noCloneAccess}
                                >
                                    <MenuItem
                                        dense
                                        disabled={!cloneable}
                                        label={i18n.t('Clone')}
                                        icon={<IconDuplicate16 />}
                                        onClick={() => {
                                            setShowCloneModal(true)
                                            setOpen(false)
                                        }}
                                        dataTest="row-actions-clone"
                                    />
                                </TooltipWrapper>
                                <MenuItem
                                    dense
                                    label={i18n.t('Show details')}
                                    icon={<IconMore16 />}
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
                                {schema.translatable && (
                                    <MenuItem
                                        dense
                                        label={i18n.t('Translate')}
                                        icon={<IconTranslate16 />}
                                        onClick={() => {
                                            onOpenTranslationClick(model)
                                            setOpen(false)
                                        }}
                                    />
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
            {showCloneModal && (
                <CloneProgramModal
                    programId={model.id}
                    programName={model.displayName}
                    onClose={() => setShowCloneModal(false)}
                />
            )}
        </>
    )
}
