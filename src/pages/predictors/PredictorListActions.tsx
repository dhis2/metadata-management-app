import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CalendarInput,
    CalendarInputProps,
    colors,
    FlyoutMenu,
    IconDuplicate16,
    IconEdit16,
    IconLaunch16,
    IconMore16,
    IconMore24,
    IconShare16,
    IconTranslate16,
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
import { DeleteAction } from '../../components/sectionList/listActions/DeleteAction'
import css from '../../components/sectionList/listActions/SectionListActions.module.css'
import { TooltipWrapper } from '../../components/tooltip'
import {
    BaseListModel,
    TOOLTIPS,
    useLocationSearchState,
    useModelSectionHandleOrThrow,
    useSchemaFromHandle,
    selectedLocale,
    useSystemSetting,
    parseErrorResponse,
} from '../../lib'
import { canEditModel, canDeleteModel } from '../../lib/models/access'

type PredictorListActionsProps = {
    model: BaseListModel
    onShowDetailsClick: (model: BaseListModel) => void
    onOpenSharingClick: (id: string) => void
    onOpenTranslationClick: (model: BaseListModel) => void
    onDeleteSuccess: (model: BaseListModel) => void
}

const RunNowModal = ({
    schemaPlural,
    predictorId,
    onClose,
}: {
    schemaPlural: string
    predictorId: string
    onClose: () => void
}) => {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const engine = useDataEngine()
    const calendar = useSystemSetting('keyCalendar')
    const locale = selectedLocale

    const alert = useAlert(
        ({ message }) => message,
        (options) => options
    )

    const handleRunNow = async () => {
        if (!startDate || !endDate) {
            return
        }

        setIsLoading(true)
        try {
            const response = await engine.mutate({
                resource: `${schemaPlural}/${predictorId}/run`,
                type: 'create',
                data: {},
                params: {
                    startDate,
                    endDate,
                },
            })

            alert.show({
                message:
                    (response as { message?: string })?.message ||
                    i18n.t('Predictor run started successfully'),
                options: { success: true },
            })
            onClose()
        } catch (error) {
            alert.show({
                message: parseErrorResponse(error).message,
                error: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const isRunNowDisabled = !startDate || !endDate || isLoading

    return (
        <Modal dataTest="run-now-modal">
            <ModalTitle>{i18n.t('Run predictor')}</ModalTitle>
            <ModalContent>
                <div style={{ marginBottom: '16px' }}>
                    <CalendarInput
                        label={i18n.t('Start date')}
                        date={startDate}
                        onDateSelect={(payload) => {
                            setStartDate(payload?.calendarDateString || '')
                        }}
                        format="YYYY-MM-DD"
                        calendar={calendar as CalendarInputProps['calendar']}
                        locale={locale}
                        clearable
                    />
                </div>
                <div>
                    <CalendarInput
                        label={i18n.t('End date')}
                        date={endDate}
                        onDateSelect={(payload) => {
                            setEndDate(payload?.calendarDateString || '')
                        }}
                        format="YYYY-MM-DD"
                        calendar={calendar as CalendarInputProps['calendar']}
                        locale={locale}
                        clearable
                    />
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onClose} dataTest="cancel-button">
                        {i18n.t('Cancel')}
                    </Button>
                    <Button
                        primary
                        disabled={isRunNowDisabled}
                        loading={isLoading}
                        onClick={handleRunNow}
                        dataTest="run-now-button"
                    >
                        {i18n.t('Run now')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export const PredictorListActions = ({
    model,
    onShowDetailsClick,
    onOpenSharingClick,
    onOpenTranslationClick,
    onDeleteSuccess,
}: PredictorListActionsProps) => {
    const schema = useSchemaFromHandle()
    const section = useModelSectionHandleOrThrow()
    const [open, setOpen] = useState(false)
    const [showRunNowModal, setShowRunNowModal] = useState(false)
    const ref = useRef(null)
    const href = useHref(model.id, { relative: 'path' })
    const preservedSearchState = useLocationSearchState()

    const editable = canEditModel(model)
    const deletable = canDeleteModel(model)
    const shareable = schema.shareable

    const handleEditClick = useLinkClickHandler(
        {
            pathname: model.id,
        },
        {
            state: preservedSearchState,
        }
    )
    const handleCloneClick = useLinkClickHandler({
        pathname: 'clone',
        search: `?clonedId=${model.id}`,
    })

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
                                {section.clonable && (
                                    <TooltipWrapper
                                        condition={!editable}
                                        content={TOOLTIPS.noCloneAccess}
                                    >
                                        <MenuItem
                                            dense
                                            disabled={!editable}
                                            label={i18n.t('Clone')}
                                            icon={<IconDuplicate16 />}
                                            onClick={(_, e) => {
                                                handleCloneClick(e)
                                                setOpen(false)
                                            }}
                                            target="_blank"
                                            href={href}
                                        />
                                    </TooltipWrapper>
                                )}
                                <MenuItem
                                    dense
                                    label={i18n.t('Show details')}
                                    icon={<IconMore16 />}
                                    onClick={() => {
                                        onShowDetailsClick(model)
                                        setOpen(false)
                                    }}
                                />
                                <MenuItem
                                    dense
                                    label={i18n.t('Run now')}
                                    icon={<IconLaunch16 />}
                                    onClick={() => {
                                        setShowRunNowModal(true)
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
            {showRunNowModal && (
                <RunNowModal
                    predictorId={model.id}
                    onClose={() => setShowRunNowModal(false)}
                    schemaPlural={schema.plural}
                />
            )}
        </>
    )
}
