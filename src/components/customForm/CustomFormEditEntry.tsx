import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { DrawerHeader, StandardFormSectionTitle, DrawerPortal } from '..'
import css from './CustomFormContents.module.css'
import { CustomFormDataPayload, CustomFormEdit } from './CustomFormEdit'
import { ElementTypes } from './CustomFormElementsSelector'

export const CustomFormEditEntry = ({
    level,
    loading,
    refetch,
    elementTypes,
    updateCustomForm,
    customFormTarget,
    fieldName = 'dataEntryForm',
    disabled = false,
}: {
    level: 'primary' | 'secondary'
    loading: boolean
    refetch: () => void
    elementTypes: ElementTypes
    updateCustomForm: (
        data: CustomFormDataPayload,
        onSuccess: (data: CustomFormDataPayload) => void,
        onError: (e: Error) => void,
        existingFormId: string | undefined
    ) => Promise<unknown>
    customFormTarget: string
    fieldName?: string
    disabled?: boolean
}) => {
    const [customFormEditOpen, setCustomFormEditOpen] =
        React.useState<boolean>(false)

    const { input: formInput } = useField(fieldName)
    const addMode = !formInput?.value?.id // if there is no formId, you need to add a form
    const formDeleted = formInput?.value?.deleted
    const setCustomFormDeletedState = (deleted: boolean) => {
        formInput.onChange({ ...formInput?.value, deleted })
    }

    return (
        <div className={css.customFormEntry}>
            <DrawerPortal
                isOpen={customFormEditOpen}
                onClose={() => setCustomFormEditOpen(false)}
                level={level}
                header={
                    <DrawerHeader onClose={() => setCustomFormEditOpen(false)}>
                        {addMode
                            ? i18n.t('New custom form')
                            : i18n.t('Edit custom form')}
                    </DrawerHeader>
                }
            >
                {customFormEditOpen && (
                    <CustomFormEdit
                        closeCustomFormEdit={() => setCustomFormEditOpen(false)}
                        loading={loading}
                        refetch={refetch}
                        elementTypes={elementTypes}
                        updateCustomForm={updateCustomForm}
                        customFormTarget={customFormTarget}
                        fieldName={fieldName}
                    />
                )}
            </DrawerPortal>
            <div>
                <StandardFormSectionTitle>
                    {i18n.t('Custom form')}
                </StandardFormSectionTitle>
                <div className={css.description}>
                    {addMode
                        ? i18n.t(
                              'No custom form has been added yet. Create a custom form to use it for web data entry.'
                          )
                        : i18n.t(
                              'This data set uses a custom form for web data entry.'
                          )}
                </div>
            </div>
            <div>
                {formDeleted ? (
                    <div className={css.customFormCardDeleted}>
                        <div className={css.deletedCustomFormText}>
                            {i18n.t('Custom form will be removed on save')}
                        </div>

                        <Button
                            small
                            onClick={() => setCustomFormDeletedState(false)}
                        >
                            {i18n.t('Restore custom form')}
                        </Button>
                    </div>
                ) : (
                    <ButtonStrip>
                        <Button
                            secondary
                            small
                            onClick={() => setCustomFormEditOpen(true)}
                            disabled={disabled}
                        >
                            {addMode
                                ? i18n.t('Create custom form')
                                : i18n.t('Edit custom form')}
                        </Button>
                        {!addMode && (
                            <Button
                                secondary
                                small
                                destructive
                                onClick={() => setCustomFormDeletedState(true)}
                                disabled={disabled || !formInput?.value?.id}
                            >
                                {i18n.t('Delete custom form')}
                            </Button>
                        )}
                    </ButtonStrip>
                )}
            </div>
        </div>
    )
}
