import i18n from '@dhis2/d2-i18n'
import { Field } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useField, useForm, useFormState } from 'react-final-form'
import { useHref } from 'react-router'
import { getSectionNewPath } from '../../../lib'
import {
    DisplayableModel,
    PartialLoadedDisplayableModel,
} from '../../../types/models'
import { ModelSection } from '../../../types/section'
import {
    DrawerFormFooter,
    DrawerHeader,
    DrawerPortal,
    DrawerRoot,
} from '../../drawer'
import { EditableInputWrapper } from '../../EditableInputWrapper'
import { NewItemFormComponent } from '../ModelTransfer/ModelTransfer'
import {
    ModelSingleSelectFF,
    ModelSingleSelectFieldProps,
    RelevantRenderProps,
    RelevantUseFieldProps,
} from './ModelSingleSelectField'
import { useRefreshModelSingleSelect } from './useRefreshSingleSelect'

export function ModelSingleSelectDrawerField<
    TModel extends PartialLoadedDisplayableModel
>({
    label,
    helpText,
    required,
    input,
    meta,
    dataTest,
    section,
    ...modelSingleSelectProps
}: ModelSingleSelectFieldProps<TModel> &
    RelevantRenderProps<TModel> & { section: ModelSection }) {
    const newLink = useHref(`/${getSectionNewPath(section)}`)
    const refresh = useRefreshModelSingleSelect({
        resource: section.namePlural,
    })
    const [NewItemForm, setNewItemForm] = useState<
        NewItemFormComponent | undefined
    >()
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        import(`../../../pages/${section.namePlural}/New`)
            .then((m: { Component: NewItemFormComponent }) =>
                setNewItemForm(() => m.Component)
            )
            .catch(() => setNewItemForm(undefined))
    }, [section.namePlural])

    const handleAddNew = () => {
        if (NewItemForm) {
            setDrawerOpen(true)
        } else {
            window.open(newLink, '_blank')
        }
    }

    return (
        <Field
            dataTest={dataTest ?? `formfields-modelsingleselect-${input.name}`}
            error={meta.invalid}
            validationText={(meta.touched && meta.error?.toString()) || ''}
            name={input.name}
            label={label}
            helpText={helpText}
            required={required}
        >
            <DrawerRoot />
            <EditableInputWrapper
                onRefresh={() => refresh()}
                onAddNew={handleAddNew}
            >
                <ModelSingleSelectFF
                    {...modelSingleSelectProps}
                    input={input}
                    meta={meta}
                />
            </EditableInputWrapper>
            {NewItemForm && (
                <DrawerPortal
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    header={
                        <DrawerHeader onClose={() => setDrawerOpen(false)}>
                            {i18n.t('Add new {{name}}', {
                                name: section.title,
                            })}
                        </DrawerHeader>
                    }
                    disableFocusTrap
                >
                    <NewItemForm
                        onSubmitted={() => {
                            refresh()
                            setDrawerOpen(false)
                        }}
                        redirectOnSubmitted={false}
                        footer={
                            <AddNewDrawerFormFooter
                                onCancel={() => setDrawerOpen(false)}
                            />
                        }
                    />
                </DrawerPortal>
            )}
        </Field>
    )
}

const AddNewDrawerFormFooter = ({ onCancel }: { onCancel: () => void }) => {
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
                marginTop: 'var(--spacers-dp16)',
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

export function ModelSingleSelectDrawerFormField<
    TModel extends DisplayableModel
>({
    name,
    validateFields,
    validate,
    initialValue,
    format,
    parse,
    data,
    section,
    ...modelSingleSelectProps
}: ModelSingleSelectFieldProps<TModel> &
    RelevantUseFieldProps<TModel> & {
        section: ModelSection
    }) {
    const { input, meta } = useField<TModel | undefined>(name, {
        validateFields: validateFields ?? [],
        validate,
        initialValue,
        format,
        parse,
        data,
    })

    return (
        <ModelSingleSelectDrawerField
            input={input}
            meta={meta}
            section={section}
            {...modelSingleSelectProps}
        />
    )
}
