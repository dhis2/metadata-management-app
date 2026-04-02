import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    DataTableToolbar,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Radio,
} from '@dhis2/ui'
import { IconAdd24 } from '@dhis2/ui-icons'
import cx from 'classnames'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ToolbarSelected } from '../../components'
import { DownloadDialog } from '../../components/sectionList/download'
import { ManageListViewDialog } from '../../components/sectionList/listView'
import { DefaultToolbarProps } from '../../components/sectionList/toolbar/DefaultToolbar'
import {
    routePaths,
    useCanCreateModelInSection,
    useModelSectionHandleOrThrow,
} from '../../lib'
import { DefaultSectionList } from '../DefaultSectionList'
import css from './List.module.css'

const EventIcon = () => (
    <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M13 28C15.7614 28 18 30.2386 18 33C18 35.7614 15.7614 38 13 38C10.2386 38 8 35.7614 8 33C8 30.2386 10.2386 28 13 28ZM28 28C30.7614 28 33 30.2386 33 33C33 35.7614 30.7614 38 28 38C25.2386 38 23 35.7614 23 33C23 30.2386 25.2386 28 28 28ZM28 30C26.3431 30 25 31.3431 25 33C25 34.6569 26.3431 36 28 36C29.6569 36 31 34.6569 31 33C31 31.3431 29.6569 30 28 30ZM13 30C11.3431 30 10 31.3431 10 33C10 34.6569 11.3431 36 13 36C14.6569 36 16 34.6569 16 33C16 31.3431 14.6569 30 13 30ZM6 15C8.76142 15 11 17.2386 11 20C11 22.7614 8.76142 25 6 25C3.23858 25 1 22.7614 1 20C1 17.2386 3.23858 15 6 15ZM20 15C22.7614 15 25 17.2386 25 20C25 22.7614 22.7614 25 20 25C17.2386 25 15 22.7614 15 20C15 17.2386 17.2386 15 20 15ZM34 15C36.7614 15 39 17.2386 39 20C39 22.7614 36.7614 25 34 25C31.2386 25 29 22.7614 29 20C29 17.2386 31.2386 15 34 15ZM6 17C4.34315 17 3 18.3431 3 20C3 21.6569 4.34315 23 6 23C7.65685 23 9 21.6569 9 20C9 18.3431 7.65685 17 6 17ZM20 17C18.3431 17 17 18.3431 17 20C17 21.6569 18.3431 23 20 23C21.6569 23 23 21.6569 23 20C23 18.3431 21.6569 17 20 17ZM34 17C32.3431 17 31 18.3431 31 20C31 21.6569 32.3431 23 34 23C35.6569 23 37 21.6569 37 20C37 18.3431 35.6569 17 34 17ZM13 2C15.7614 2 18 4.23858 18 7C18 9.76142 15.7614 12 13 12C10.2386 12 8 9.76142 8 7C8 4.23858 10.2386 2 13 2ZM28 2C30.7614 2 33 4.23858 33 7C33 9.76142 30.7614 12 28 12C25.2386 12 23 9.76142 23 7C23 4.23858 25.2386 2 28 2ZM13 4C11.3431 4 10 5.34315 10 7C10 8.65685 11.3431 10 13 10C14.6569 10 16 8.65685 16 7C16 5.34315 14.6569 4 13 4ZM28 4C26.3431 4 25 5.34315 25 7C25 8.65685 26.3431 10 28 10C29.6569 10 31 8.65685 31 7C31 5.34315 29.6569 4 28 4Z" />
    </svg>
)

const TrackerIcon = () => (
    <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M32 12H21V19H33C34.6569 19 36 20.3431 36 22V28.0996C38.2823 28.5628 40 30.581 40 33C40 35.7614 37.7614 38 35 38C32.2386 38 30 35.7614 30 33C30 30.581 31.7177 28.5628 34 28.0996V22C34 21.4477 33.5523 21 33 21H21V28.0996C23.2823 28.5628 25 30.581 25 33C25 35.7614 22.7614 38 20 38C17.2386 38 15 35.7614 15 33C15 30.581 16.7177 28.5628 19 28.0996V21H7C6.44772 21 6 21.4477 6 22V28.0996C8.28228 28.5628 10 30.581 10 33C10 35.7614 7.76142 38 5 38C2.23858 38 0 35.7614 0 33C0 30.581 1.71772 28.5628 4 28.0996V22C4 20.3431 5.34315 19 7 19H19V12H8V2H32V12ZM5 30C3.34315 30 2 31.3431 2 33C2 34.6569 3.34315 36 5 36C6.65685 36 8 34.6569 8 33C8 31.3431 6.65685 30 5 30ZM20 30C18.3431 30 17 31.3431 17 33C17 34.6569 18.3431 36 20 36C21.6569 36 23 34.6569 23 33C23 31.3431 21.6569 30 20 30ZM35 30C33.3431 30 32 31.3431 32 33C32 34.6569 33.3431 36 35 36C36.6569 36 38 34.6569 38 33C38 31.3431 36.6569 30 35 30ZM10 10H30V4H10V10Z" />
    </svg>
)

const ProgramTypeCard = ({
    Icon,
    label,
    description,
}: {
    Icon: React.ComponentType
    label: string
    description: string
}) => {
    return (
        <div className={css.programTypeCardContent}>
            {<Icon />}
            <div className={css.programTypeTitle}>
                <h3>{label}</h3>
                <p>{description}</p>
            </div>
        </div>
    )
}

const NewProgramDialog = ({ onClose }: { onClose: () => void }) => {
    const [programType, setProgramType] = useState<
        'WITHOUT_REGISTRATION' | 'WITH_REGISTRATION' | undefined
    >(undefined)

    return (
        <Modal fluid onClose={onClose}>
            <ModalTitle>{i18n.t('Choose program type')}</ModalTitle>
            <ModalContent>
                <p className={css.programTypeDescription}>
                    {i18n.t(
                        'Choose how this program collects data. This cannot be changed later.'
                    )}
                </p>
                <div className={css.programTypeCards}>
                    <Radio
                        className={cx(css.programTypeCard, {
                            [css.programTypeCardHighlighted]:
                                programType === 'WITHOUT_REGISTRATION',
                        })}
                        dense
                        label={
                            <ProgramTypeCard
                                label={i18n.t('Single event')}
                                description={i18n.t(
                                    'Collect standalone events with no person or entity attached.'
                                )}
                                Icon={EventIcon}
                            />
                        }
                        onChange={({ checked }) => {
                            if (checked) {
                                setProgramType('WITHOUT_REGISTRATION')
                            }
                        }}
                        value="WITHOUT_REGISTRATION"
                        checked={programType === 'WITHOUT_REGISTRATION'}
                    />
                    <Radio
                        dense
                        className={cx(css.programTypeCard, {
                            [css.programTypeCardHighlighted]:
                                programType === 'WITH_REGISTRATION',
                        })}
                        label={
                            <ProgramTypeCard
                                label={i18n.t('Tracker')}
                                description={i18n.t(
                                    'Collect events for a person or other entity over time.'
                                )}
                                Icon={TrackerIcon}
                            />
                        }
                        onChange={({ checked }) => {
                            if (checked) {
                                setProgramType('WITH_REGISTRATION')
                            }
                        }}
                        value="WITH_REGISTRATION"
                        checked={programType === 'WITH_REGISTRATION'}
                    />
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onClose} secondary>
                        {i18n.t('Cancel')}
                    </Button>
                    <Link
                        to={`${routePaths.sectionNew}?programType=${programType}`}
                    >
                        <Button primary>{i18n.t('Continue')}</Button>
                    </Link>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
const ProgramToolbar = ({
    selectedModels,
    onDeselectAll,
    downloadable = true,
}: DefaultToolbarProps) => {
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)

    const isAnySelected = selectedModels.size > 0

    const DownloadButtonElement = downloadable ? (
        <Button small onClick={() => setDownloadDialogOpen(true)}>
            {i18n.t('Download')}
        </Button>
    ) : null

    const [manageColumnsOpen, setManageColumnsOpen] = React.useState(false)
    const [newProgramOpen, setNewProgramOpen] = React.useState(false)
    const section = useModelSectionHandleOrThrow()
    const canCreateModel = useCanCreateModelInSection(section)

    const handleClose = () => setManageColumnsOpen(false)

    return (
        <>
            {isAnySelected ? (
                <ToolbarSelected
                    selectedModels={selectedModels}
                    onDeselectAll={onDeselectAll}
                    downloadButtonElement={DownloadButtonElement}
                />
            ) : (
                <DataTableToolbar className={css.listHeaderNormal}>
                    {canCreateModel && (
                        <Button
                            small
                            icon={<IconAdd24 />}
                            onClick={() => setNewProgramOpen(true)}
                        >
                            {i18n.t('New')}
                        </Button>
                    )}
                    {DownloadButtonElement}
                    <Button
                        small
                        dataTest="manage-view-button"
                        onClick={() => setManageColumnsOpen((prev) => !prev)}
                    >
                        {i18n.t('Manage View')}
                    </Button>
                    {manageColumnsOpen && (
                        <ManageListViewDialog onClose={handleClose} />
                    )}
                </DataTableToolbar>
            )}
            {downloadDialogOpen && (
                <DownloadDialog
                    onClose={() => setDownloadDialogOpen(false)}
                    selectedModels={selectedModels}
                />
            )}
            {newProgramOpen && (
                <NewProgramDialog onClose={() => setNewProgramOpen(false)} />
            )}
        </>
    )
}

export const Component = () => (
    <DefaultSectionList ToolbarComponent={ProgramToolbar} />
)
