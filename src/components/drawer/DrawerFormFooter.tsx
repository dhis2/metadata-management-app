import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import { IconInfo16 } from '@dhis2/ui-icons'
import React from 'react'
import { useForm, useFormState } from 'react-final-form'
import css from './Drawer.module.css'

export type DrawerFormFooterProps = {
    submitLabel?: string
    saveLabel?: string
    cancelLabel?: string
    submitting: boolean
    onSubmitClick: () => void
    onSaveClick?: () => void
    onCancelClick: () => void
    infoMessage?: string
}

export const DrawerFormFooter: React.FC<DrawerFormFooterProps> = ({
    submitLabel = i18n.t('Submit'),
    saveLabel = i18n.t('Save'),
    cancelLabel = i18n.t('Cancel'),
    submitting,
    onSubmitClick,
    onSaveClick,
    onCancelClick,
    infoMessage,
}) => (
    <div className={css.drawerFooter}>
        <div className={css.drawerFooterActions}>
            <ButtonStrip>
                <Button
                    primary
                    small
                    disabled={submitting}
                    loading={submitting}
                    type="button"
                    onClick={onSubmitClick}
                    dataTest="form-submit-button"
                >
                    {submitLabel}
                </Button>
                {onSaveClick && (
                    <Button
                        secondary
                        small
                        disabled={submitting}
                        loading={submitting}
                        type="button"
                        onClick={onSaveClick}
                        dataTest="form-save-button"
                    >
                        {saveLabel}
                    </Button>
                )}
                <Button
                    secondary
                    small
                    disabled={submitting}
                    onClick={onCancelClick}
                    dataTest="form-cancel-link"
                >
                    {cancelLabel}
                </Button>
            </ButtonStrip>
        </div>
        {infoMessage && (
            <div className={css.drawerFooterInfo}>
                <IconInfo16 />
                <span>{infoMessage}</span>
            </div>
        )}
    </div>
)

export const AddNewDrawerFormFooter = ({
    onCancel,
}: {
    onCancel: () => void
}) => {
    const { submitting } = useFormState({
        subscription: { submitting: true },
    })
    const form = useForm()

    return (
        <div
            style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
            }}
        >
            <DrawerFormFooter
                submitLabel={i18n.t('Save and close')}
                cancelLabel={i18n.t('Cancel')}
                submitting={submitting ?? false}
                onSubmitClick={() => form.submit()}
                onCancelClick={onCancel}
            />
        </div>
    )
}
