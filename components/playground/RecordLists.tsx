import type { Account, Contact } from "./types";
import { getAccountBilling, getContactName, formatDate } from "./formatting";
import { UtilityButtonIcon } from "./Navigation";

function ListViewToolbar({
    count,
    loading,
    objectLabel,
    onRefresh
}: {
    count: number;
    loading: boolean;
    objectLabel: string;
    onRefresh: () => void;
}) {
    return (
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-p-horizontal_medium slds-p-vertical_x-small slds-border_bottom slds-theme_default playground-list-toolbar">
            <div className="slds-text-title_bold">
                {count} {count === 1 ? "item" : "items"} - View: My {objectLabel}
            </div>
            <div className="slds-grid slds-grid_vertical-align-center slds-gutters_x-small">
                <div className="slds-form-element">
                    <label className="slds-assistive-text" htmlFor={`${objectLabel.toLowerCase()}-list-search`}>
                        Search this list
                    </label>
                    <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left" aria-hidden="true" />
                        <input
                            id={`${objectLabel.toLowerCase()}-list-search`}
                            className="slds-input playground-list-search"
                            type="search"
                            placeholder="Search this list..."
                        />
                    </div>
                </div>
                <div className="slds-button-group" role="group" aria-label={`${objectLabel} display controls`}>
                    <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="List view controls">
                        <UtilityButtonIcon name="settings" label="" />
                        <span className="slds-assistive-text">List view controls</span>
                    </button>
                    <button className="slds-button slds-button_icon slds-button_icon-border-filled" type="button" title="Display as table">
                        <UtilityButtonIcon name="table" label="" />
                        <span className="slds-assistive-text">Display as table</span>
                    </button>
                    <button
                        className="slds-button slds-button_icon slds-button_icon-border-filled"
                        type="button"
                        title="Refresh list"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <UtilityButtonIcon name="refresh" label="" />
                        <span className="slds-assistive-text">Refresh list</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function AccountPanel({
    accounts,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete,
    onRefresh
}: {
    accounts: Account[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Account) => void;
    onEdit: (record: Account) => void;
    onDelete: (record: Account) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="slds-theme_default">
            <ListViewToolbar count={accounts.length} loading={loading} objectLabel="Accounts" onRefresh={onRefresh} />
            {loading ? <EmptyState message="Loading Accounts..." /> : null}
            {!loading && accounts.length === 0 ? <EmptyState message={connected ? "No Accounts found." : "Connect Salesforce to load Accounts."} /> : null}
            {!loading && accounts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <span className="slds-assistive-text">Row number</span>
                                </th>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <label className="slds-checkbox">
                                        <input type="checkbox" aria-label="Select all Accounts" />
                                        <span className="slds-checkbox_faux" />
                                    </label>
                                </th>
                                <th scope="col">Account Name</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Website</th>
                                <th scope="col">Industry</th>
                                <th scope="col">Billing</th>
                                <th scope="col">Last Modified</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account, index) => (
                                <tr className="slds-hint-parent" key={account.Id}>
                                    <td className="slds-cell-shrink slds-text-align_center">{index + 1}</td>
                                    <td className="slds-cell-shrink slds-text-align_center">
                                        <label className="slds-checkbox">
                                            <input type="checkbox" aria-label={`Select ${account.Name}`} />
                                            <span className="slds-checkbox_faux" />
                                        </label>
                                    </td>
                                    <th scope="row">
                                        <div className="slds-truncate" title={account.Name}>
                                            <button className="slds-button_reset slds-text-link" type="button" onClick={() => onOpen(account)}>
                                                {account.Name}
                                            </button>
                                        </div>
                                    </th>
                                    <TableCell value={account.Phone} />
                                    <TableCell value={account.Website} />
                                    <TableCell value={account.Industry} />
                                    <TableCell value={getAccountBilling(account)} />
                                    <TableCell value={formatDate(account.LastModifiedDate)} />
                                    <td>
                                        <div className="slds-button-group" role="group">
                                            <button className="slds-button slds-button_neutral" type="button" onClick={() => onEdit(account)}>
                                                Edit
                                            </button>
                                            <button className="slds-button slds-button_destructive" type="button" onClick={() => onDelete(account)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}

export function ContactPanel({
    contacts,
    loading,
    connected,
    onOpen,
    onEdit,
    onDelete,
    onRefresh
}: {
    contacts: Contact[];
    loading: boolean;
    connected: boolean;
    onOpen: (record: Contact) => void;
    onEdit: (record: Contact) => void;
    onDelete: (record: Contact) => void;
    onRefresh: () => void;
}) {
    return (
        <div className="slds-theme_default">
            <ListViewToolbar count={contacts.length} loading={loading} objectLabel="Contacts" onRefresh={onRefresh} />
            {loading ? <EmptyState message="Loading Contacts..." /> : null}
            {!loading && contacts.length === 0 ? <EmptyState message={connected ? "No Contacts found." : "Connect Salesforce to load Contacts."} /> : null}
            {!loading && contacts.length > 0 ? (
                <div className="slds-scrollable_x">
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols">
                        <thead>
                            <tr>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <span className="slds-assistive-text">Row number</span>
                                </th>
                                <th className="slds-cell-shrink slds-text-align_center" scope="col">
                                    <label className="slds-checkbox">
                                        <input type="checkbox" aria-label="Select all Contacts" />
                                        <span className="slds-checkbox_faux" />
                                    </label>
                                </th>
                                <th scope="col">Name</th>
                                <th scope="col">Title</th>
                                <th scope="col">Account Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Last Modified</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact, index) => (
                                <tr className="slds-hint-parent" key={contact.Id}>
                                    <td className="slds-cell-shrink slds-text-align_center">{index + 1}</td>
                                    <td className="slds-cell-shrink slds-text-align_center">
                                        <label className="slds-checkbox">
                                            <input type="checkbox" aria-label={`Select ${getContactName(contact)}`} />
                                            <span className="slds-checkbox_faux" />
                                        </label>
                                    </td>
                                    <th scope="row">
                                        <div className="slds-truncate" title={getContactName(contact)}>
                                            <button className="slds-button_reset slds-text-link" type="button" onClick={() => onOpen(contact)}>
                                                {getContactName(contact)}
                                            </button>
                                        </div>
                                    </th>
                                    <TableCell value={contact.Title} />
                                    <TableCell value={contact.Account?.Name} />
                                    <TableCell value={contact.Email} />
                                    <TableCell value={contact.Phone} />
                                    <TableCell value={formatDate(contact.LastModifiedDate)} />
                                    <td>
                                        <div className="slds-button-group" role="group">
                                            <button className="slds-button slds-button_neutral" type="button" onClick={() => onEdit(contact)}>
                                                Edit
                                            </button>
                                            <button className="slds-button slds-button_destructive" type="button" onClick={() => onDelete(contact)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
}

function TableCell({ value }: { value?: string }) {
    const displayValue = value || "-";
    return (
        <td>
            <div className="slds-truncate" title={displayValue}>
                {displayValue}
            </div>
        </td>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="slds-text-align_center slds-p-around_xx-large">
            <span className="slds-icon_container slds-icon-utility-info slds-m-bottom_small" aria-hidden="true">
                <span className="slds-assistive-text">Info</span>
            </span>
            <p>{message}</p>
        </div>
    );
}
