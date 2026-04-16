import i18n from '@dhis2/d2-i18n'
import { Button, IconAdd16, NoticeBox } from '@dhis2/ui'
import React from 'react'
import { useFieldArray } from 'react-final-form-arrays'
import { useParams } from 'react-router-dom'
import {
    DrawerHeader,
    DrawerPortal,
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { ListInFormItem } from '../../../../components/formCreators/SectionFormList'
import { SchemaName } from '../../../../types'
import { Access, DisplayableModel } from '../../../../types/models'
import {
    EditOrNewStageForm,
    SubmittedStageFormValues,
} from '../programStage/StageForm'
import css from './ProgramStagesForm.module.css'

export type StageNotificationTemplate = {
    id: string
    name: string
    displayName: string
    deleted?: boolean
}

export type ProgramStageListItem = {
    id: string
    displayName: string
    description?: string
    deleted?: boolean
    access?: Access
    program?: { id: string }
    notificationTemplates?: StageNotificationTemplate[]
}

export const ProgramStagesFormContents = React.memo(
    function ProgramStagesContent({ name }: { name: string }) {
        return (
            <SectionedFormSection name={name}>
                <StandardFormSectionTitle>
                    {i18n.t('Program Stages')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Set up stages in this program.')}
                </StandardFormSectionDescription>
                <ProgramStageListNewOrEdit />
            </SectionedFormSection>
        )
    }
)

const ProgramStageListNewOrEdit = () => {
    const modelId = useParams().id as string
    const stagesFieldArray =
        useFieldArray<ProgramStageListItem>('programStages').fields
    const [stageFormOpen, setStageFormOpen] = React.useState<
        DisplayableModel | null | undefined
    >()
    const isStageFormOpen = !!stageFormOpen || stageFormOpen === null

    const handleDeletedStage = (index: number) => {
        stagesFieldArray.update(index, {
            ...stagesFieldArray.value[index],
            deleted: true,
        })
    }

    const handleCancelDeletedStage = (index: number) => {
        stagesFieldArray.update(index, {
            ...stagesFieldArray.value[index],
            deleted: false,
        })
    }

    const handleSubmittedStage = (
        values: SubmittedStageFormValues,
        closeOnSubmit: boolean = true
    ) => {
        const isEditStage = stageFormOpen && stageFormOpen.id

        if (closeOnSubmit) {
            setStageFormOpen(undefined)
        } else if (!isEditStage) {
            setStageFormOpen({
                id: values.id,
                displayName: values.displayName,
            })
        }
        if (isEditStage) {
            const index = stagesFieldArray.value.findIndex(
                (s) => s.id === stageFormOpen.id
            )
            if (index !== -1) {
                stagesFieldArray.update(index, values)
            }
        } else {
            stagesFieldArray.push(values)
        }
    }

    const onCloseStageForm = () => {
        setStageFormOpen(undefined)
    }

    // program stages cannot be added until program is saved
    if (!modelId) {
        return (
            <NoticeBox className={css.formTypeInfo}>
                {i18n.t('Program must be saved before stages can be added')}
            </NoticeBox>
        )
    }

    return (
        <>
            <DrawerPortal
                isOpen={isStageFormOpen}
                onClose={onCloseStageForm}
                header={
                    <DrawerHeader onClose={onCloseStageForm}>
                        {stageFormOpen === null
                            ? i18n.t('New stage')
                            : i18n.t('Edit stage')}
                    </DrawerHeader>
                }
                disableFocusTrap={true}
            >
                {stageFormOpen !== undefined && (
                    <EditOrNewStageForm
                        stage={stageFormOpen}
                        onCancel={onCloseStageForm}
                        onSubmitted={handleSubmittedStage}
                    />
                )}
            </DrawerPortal>

            <div className={css.listWrapper}>
                {stagesFieldArray.value.length === 0 && (
                    <NoticeBox className={css.formTypeInfo}>
                        {i18n.t('No program stages have been added yet')}
                    </NoticeBox>
                )}

                <div className={css.sectionItems}>
                    {stagesFieldArray.value.map((stage, index) => {
                        if (stage.deleted) {
                            return (
                                <div
                                    className={css.stageCardDeleted}
                                    key={stage.id}
                                >
                                    <div className={css.deletedStageText}>
                                        {i18n.t(
                                            'Stage {{stageName}} will be removed on save',
                                            { stageName: stage.displayName }
                                        )}
                                    </div>

                                    <Button
                                        small
                                        onClick={() =>
                                            handleCancelDeletedStage(index)
                                        }
                                    >
                                        {i18n.t('Restore stage')}
                                    </Button>
                                </div>
                            )
                        }

                        return (
                            <ListInFormItem
                                key={stage.id}
                                item={stage}
                                schemaName={SchemaName.programStage}
                                onClick={() => setStageFormOpen(stage)}
                                onDelete={() => handleDeletedStage(index)}
                            />
                        )
                    })}
                </div>

                <div>
                    <Button
                        secondary
                        small
                        icon={<IconAdd16 />}
                        onClick={() => {
                            setStageFormOpen(null)
                        }}
                    >
                        {i18n.t('Add a program stage')}
                    </Button>
                </div>
            </div>
        </>
    )
}
