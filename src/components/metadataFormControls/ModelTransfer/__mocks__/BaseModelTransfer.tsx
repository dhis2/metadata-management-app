import React from 'react'
import { DisplayableModel } from '../../../../types/models'
import { BaseModelTransferProps } from '../BaseModelTransfer'

/**
 * Fast test double for BaseModelTransfer, opted into via
 * `jest.mock('.../BaseModelTransfer')` in integration-style Form.spec.tsx
 * tests. The real component drives @dhis2/ui's Transfer, which is
 * expensive to interact with through userEvent/act() when repeated across
 * many pages' form tests - and it's already covered in isolation by
 * BaseModelTransfer.spec.tsx against the real @dhis2/ui component.
 *
 * Renders the exact same data-test contract the real Transfer produces
 * (`{dataTest}`, `{dataTest}-leftside`, `{dataTest}-rightside`,
 * `dhis2-uicore-transferoption`), so uiAssertions'
 * expectTransferFieldToExistWithOptions keeps working unchanged against
 * either the mock or the real component.
 */
export const BaseModelTransfer = <TModel extends DisplayableModel>({
    available,
    selected,
    onChange,
    dataTest,
}: BaseModelTransferProps<TModel>) => {
    const selectedIds = new Set(selected.map((model) => model.id))
    const lhs = available.filter((model) => !selectedIds.has(model.id))

    // Double-click mirrors the real Transfer's move gesture (see
    // uiActions.pickOptionInTransfer) so page-level submit assertions that
    // move an option between panes keep working against the mock.
    return (
        <div data-test={dataTest}>
            <div data-test={`${dataTest}-leftside`}>
                {lhs.map((model) => (
                    <div
                        key={model.id}
                        data-test="dhis2-uicore-transferoption"
                        onDoubleClick={() =>
                            onChange({ selected: [...selected, model] })
                        }
                    >
                        {model.displayName}
                    </div>
                ))}
            </div>
            <div data-test={`${dataTest}-rightside`}>
                {selected.map((model) => (
                    <div
                        key={model.id}
                        data-test="dhis2-uicore-transferoption"
                        onDoubleClick={() =>
                            onChange({
                                selected: selected.filter(
                                    (s) => s.id !== model.id
                                ),
                            })
                        }
                    >
                        {model.displayName}
                    </div>
                ))}
            </div>
        </div>
    )
}
