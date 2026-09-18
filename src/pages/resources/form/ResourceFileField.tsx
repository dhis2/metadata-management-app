import i18n from '@dhis2/d2-i18n'
import {
    Field as UIField,
    FileInput,
    FileInputChangeHandler,
    FileList,
    FileListItem,
} from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'

export function ResourceFileField() {
    const { input, meta } = useField<File | null | undefined>('file')

    const handleChange: FileInputChangeHandler = ({ files }) => {
        const file = files[0]
        if (!(file instanceof File)) {
            return
        }
        input.onChange(file)
        input.onBlur()
    }

    const handleRemove = () => {
        input.onChange(null)
        input.onBlur()
    }

    const hasError = meta.touched && meta.invalid

    return (
        <UIField
            dataTest="formfields-file"
            label={i18n.t('File')}
            name="file"
            required
            error={hasError}
            validationText={hasError ? meta.error : undefined}
        >
            <FileInput
                accept=""
                buttonLabel={
                    input.value instanceof File
                        ? i18n.t('Change file')
                        : i18n.t('Upload file')
                }
                multiple={false}
                name="resourceFile"
                onChange={handleChange}
                error={hasError}
            />
            <FileList>
                {input.value instanceof File && (
                    <FileListItem
                        label={input.value.name}
                        onRemove={handleRemove}
                        removeText={i18n.t('Remove')}
                    />
                )}
            </FileList>
        </UIField>
    )
}
