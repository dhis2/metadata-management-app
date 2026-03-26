import i18n from '@dhis2/d2-i18n'
import { Button, NoticeBox } from '@dhis2/ui'
import { IconAdd16 } from '@dhis2/ui-icons'
import React, { useMemo } from 'react'
import { useFormState } from 'react-final-form'
import { useFieldArray } from 'react-final-form-arrays'
import { useParams } from 'react-router-dom'
import {
    DrawerPortal,
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { ListInFormItem } from '../../../../components/formCreators/SectionFormList'
import { SchemaName } from '../../../../types'
import { getProgramRuleActionListLabel } from './getProgramRuleActionListLabel'
import { EditOrNewProgramRuleActionForm } from './ProgramRuleActionForm'
import styles from './ProgramRuleActionForm.module.css'
import {
    buildTemplateNameById,
    type FormValuesWithProgramTemplates,
} from './transformers'
import type { ProgramRuleActionListItem } from './types'

export const ProgramRuleActionsFormContents = React.memo(
    function ProgramRuleActionsFormContents({ name }: { name: string }) {
        return (
            <SectionedFormSection name={name}>
                <StandardFormSectionTitle>
                    {i18n.t('Actions')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the actions that happen when the program rule runs.'
                    )}
                </StandardFormSectionDescription>
                <ProgramRuleActionListNewOrEdit />
            </SectionedFormSection>
        )
    }
)

const ProgramRuleActionListNewOrEdit = () => {
    const modelId = useParams().id
    const { values: formValues } = useFormState<FormValuesWithProgramTemplates>(
        { subscription: { values: true } }
    )
    const program = formValues.program
    const programId = program?.id
    const programType = program?.programType
    const actionsFieldArray =
        useFieldArray<ProgramRuleActionListItem>('programRuleActions').fields

    const templateNameById = useMemo(
        () => buildTemplateNameById(program),
        [program]
    )
    const [actionFormOpen, setActionFormOpen] = React.useState<
        ProgramRuleActionListItem | null | undefined
    >()
    const isActionFormOpen = !!actionFormOpen || actionFormOpen === null

    const handleSubmitted = (values: ProgramRuleActionListItem) => {
        const isEdit = actionFormOpen?.id

        if (isEdit) {
            const index = actionsFieldArray.value.findIndex(
                (a) => a.id === actionFormOpen?.id
            )
            if (index !== -1) {
                actionsFieldArray.update(index, values)
            }
        } else {
            actionsFieldArray.push(values)
        }
        setActionFormOpen(undefined)
    }

    const onCloseActionForm = () => {
        setActionFormOpen(undefined)
    }

    const handleDelete = (index: number) => {
        const current = actionsFieldArray.value[index]
        if (current) {
            actionsFieldArray.update(index, { ...current, deleted: true })
        }
    }

    const handleRestore = (index: number) => {
        const current = actionsFieldArray.value[index]
        if (current) {
            actionsFieldArray.update(index, { ...current, deleted: false })
        }
    }

    if (modelId) {
        const actions: ProgramRuleActionListItem[] =
            actionsFieldArray.value ?? []
        const sortedActionsBy = actions.sort((a, b) => {
            return (
                (a.programRuleActionType ?? '').localeCompare(
                    b.programRuleActionType ?? ''
                ) &&
                getProgramRuleActionListLabel(a).localeCompare(
                    getProgramRuleActionListLabel(b)
                )
            )
        })

        return (
            <>
                <DrawerPortal
                    isOpen={isActionFormOpen}
                    onClose={onCloseActionForm}
                >
                    {actionFormOpen !== undefined && (
                        <EditOrNewProgramRuleActionForm
                            programId={programId}
                            programType={programType}
                            programRuleId={modelId}
                            action={actionFormOpen}
                            onCancel={onCloseActionForm}
                            onSubmitted={handleSubmitted}
                        />
                    )}
                </DrawerPortal>

                <div>
                    <div>
                        {sortedActionsBy.map((action, index) => {
                            const actionKey = action.id ?? `new-${index}`
                            if (action.deleted) {
                                return (
                                    <div
                                        key={actionKey}
                                        className={styles.deletedActionBox}
                                    >
                                        <div
                                            className={styles.deletedActionText}
                                        >
                                            {i18n.t(
                                                'Action will be deleted when the program rule is saved.'
                                            )}
                                        </div>
                                        <Button
                                            small
                                            onClick={() => handleRestore(index)}
                                        >
                                            {i18n.t('Undo delete')}
                                        </Button>
                                    </div>
                                )
                            }

                            const displayItem = {
                                id: actionKey,
                                displayName: getProgramRuleActionListLabel(
                                    action,
                                    templateNameById
                                ),
                                access: action.access,
                                description: action.priority
                                    ? i18n.t('Priority: {{priority}}', {
                                          priority: action.priority,
                                          nsSeparator: '~-~',
                                      })
                                    : undefined,
                            }

                            return (
                                <ListInFormItem
                                    key={actionKey}
                                    item={displayItem}
                                    schemaName={SchemaName.programRuleAction}
                                    onClick={() => setActionFormOpen(action)}
                                    onDelete={() => handleDelete(index)}
                                    translatable={false}
                                />
                            )
                        })}
                    </div>

                    <div className={styles.addActionButton}>
                        <Button
                            secondary
                            small
                            icon={<IconAdd16 />}
                            onClick={() => setActionFormOpen(null)}
                        >
                            {i18n.t('Add action')}
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <NoticeBox>
            {i18n.t('Program rule must be saved before actions can be added')}
        </NoticeBox>
    )
}
