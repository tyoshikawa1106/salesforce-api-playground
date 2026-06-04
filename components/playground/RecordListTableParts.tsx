"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { UtilityButtonIcon } from "./Navigation";

export function RecordTableActions<Record>({
    record,
    recordLabel,
    open,
    onToggle,
    onClose,
    onEdit,
    onDelete
}: {
    record: Record;
    recordLabel: string;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
    onEdit: (record: Record) => void;
    onDelete: (record: Record) => void;
}) {
    const menuId = useId();
    const menuLabel = `${recordLabel} の操作`;

    function runMenuAction(action: (record: Record) => void) {
        onClose();
        action(record);
    }

    return (
        <div className={`slds-dropdown-trigger slds-dropdown-trigger_click${open ? " slds-is-open" : ""}`}>
            <button
                className="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small"
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={menuId}
                title={menuLabel}
                onClick={onToggle}
            >
                <UtilityButtonIcon name="down" label="" />
                <span className="slds-assistive-text">{menuLabel}</span>
            </button>
            <div className="slds-dropdown slds-dropdown_right" id={menuId}>
                <ul className="slds-dropdown__list" role="menu" aria-label={menuLabel}>
                    <li className="slds-dropdown__item" role="presentation">
                        <a
                            href="#"
                            role="menuitem"
                            tabIndex={open ? 0 : -1}
                            onClick={(event) => {
                                event.preventDefault();
                                runMenuAction(onEdit);
                            }}
                        >
                            <span title="編集">編集</span>
                        </a>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                        <a
                            href="#"
                            role="menuitem"
                            tabIndex={-1}
                            onClick={(event) => {
                                event.preventDefault();
                                runMenuAction(onDelete);
                            }}
                        >
                            <span title="削除">削除</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export function DataTableColumnHeader({ label }: { label: string }) {
    return (
        <th className="slds-is-resizable slds-cell_action-mode" scope="col">
            <DataTableHeader label={label} />
        </th>
    );
}

export function DataTableHeader({ label, assistive = false }: { label: string; assistive?: boolean }) {
    return (
        <div className="slds-th__action">
            <span className={assistive ? "slds-assistive-text" : "slds-truncate"} title={label}>
                {label}
            </span>
        </div>
    );
}

export function SelectionCheckbox({
    ariaLabel,
    checked,
    mixed,
    onChange
}: {
    ariaLabel: string;
    checked: boolean;
    mixed: boolean;
    onChange: () => void;
}) {
    const checkboxRef = useRef<HTMLInputElement>(null);
    const checkboxId = useId();

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = mixed;
        }
    }, [mixed]);

    return (
        <div className="slds-checkbox">
            <input
                id={checkboxId}
                ref={checkboxRef}
                type="checkbox"
                aria-checked={mixed ? "mixed" : checked}
                aria-label={ariaLabel}
                checked={checked}
                onChange={onChange}
            />
            <label className="slds-checkbox__label" htmlFor={checkboxId} aria-hidden="true">
                <span className="slds-checkbox_faux" />
                <span className="slds-form-element__label slds-assistive-text">{ariaLabel}</span>
            </label>
        </div>
    );
}

export function TableCell({ label, value }: { label: string; value?: ReactNode }) {
    const displayValue = value || "-";
    const title = typeof displayValue === "string" ? displayValue : undefined;

    return (
        <td className="slds-cell_action-mode" data-label={label} role="gridcell">
            <div className="slds-truncate" title={title}>
                {displayValue}
            </div>
        </td>
    );
}
