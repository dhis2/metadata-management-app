import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LinkButton } from '../../../components/LinkButton'
import { LoadingSpinner } from '../../../components/loading/LoadingSpinner'
import { ModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect'
import {
    PROGRAMS_SELECT_QUERY,
    useProgramsWithMappingsList,
    useClearMappingsMutation,
    transformProgramsForSelect,
    useProgramDeleteModal,
} from './ProgramListHooks'
import classes from './ProgramsList.module.css'

export const ProgramsList = () => {
    const navigate = useNavigate()
    const { data, isLoading, isError, refetch } = useProgramsWithMappingsList()
    const { mutateAsync: clearMappings } = useClearMappingsMutation()
    const alert = useAlert(
        ({ message }) => message,
        (options) => options
    )

    const {
        programToDelete,
        open: openDeleteModal,
        close: closeDeleteModal,
        isOpen: isDeleteModalOpen,
    } = useProgramDeleteModal()

    const programsWithMappings = data?.programs?.programs

    const handleSelectChange = useCallback(
        (selected: { id: string } | undefined) => {
            if (selected?.id) {
                navigate(`${selected.id}`)
            }
        },
        [navigate]
    )

    const handleConfirmDelete = async () => {
        if (!programToDelete) {
            return
        }

        try {
            await clearMappings(programToDelete.id)
            refetch()
        } catch {
            alert.show({
                message: i18n.t('Could not delete program mappings'),
                error: true,
            })
        } finally {
            closeDeleteModal()
        }
    }

    return (
        <div className={classes.programsList}>
            <ModelSingleSelect
                query={PROGRAMS_SELECT_QUERY}
                onChange={handleSelectChange}
                transform={transformProgramsForSelect}
                placeholder={i18n.t('Select a Program')}
            />

            <h3>{i18n.t('Programs with existing mappings')}</h3>

            {isLoading && <LoadingSpinner />}

            {isError && (
                <NoticeBox title={i18n.t('Error')} error>
                    {i18n.t('Could not load programs.')} <br />
                    <Button
                        small
                        onClick={() => refetch()}
                        className={classes.errorNoticeButton}
                    >
                        {i18n.t('Retry')}
                    </Button>
                </NoticeBox>
            )}

            {programsWithMappings && programsWithMappings.length > 0 ? (
                <div>
                    {programsWithMappings.map((program) => (
                        <div
                            key={program.id}
                            className={classes.programsListItem}
                            data-test="program-with-mapping"
                        >
                            <span>{program.name}</span>
                            <div className={classes.programsListItemActions}>
                                <LinkButton
                                    data-test="edit-program"
                                    small
                                    secondary
                                    to={`${program.id}`}
                                >
                                    {i18n.t('Edit')}
                                </LinkButton>
                                <Button
                                    small
                                    destructive
                                    secondary
                                    onClick={() => openDeleteModal(program)}
                                >
                                    {i18n.t('Delete')}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoading &&
                !isError && (
                    <p data-test="no-programs-with-mappings">
                        {i18n.t('No programs with existing mappings found.')}
                    </p>
                )
            )}

            {isDeleteModalOpen && programToDelete && (
                <Modal
                    onClose={closeDeleteModal}
                    position="middle"
                    dataTest="delete-confirmation-modal"
                >
                    <ModalTitle>{i18n.t('Delete Mapping')}</ModalTitle>
                    <ModalContent>
                        <h4>{i18n.t('This action cannot be undone.')}</h4>
                        <p>
                            {i18n.t(
                                'All mappings ({{count}}) will be removed.',
                                {
                                    count: programToDelete.categoryMappings
                                        .length,
                                }
                            )}
                        </p>
                        <p>
                            {i18n.t(
                                'Are you sure you want to delete {{- displayName}} mapping configuration?',
                                { displayName: programToDelete.displayName }
                            )}
                        </p>
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip>
                            <Button onClick={closeDeleteModal}>
                                {i18n.t('Cancel')}
                            </Button>
                            <Button destructive onClick={handleConfirmDelete}>
                                {i18n.t('Delete')}
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </div>
    )
}
