export function RecordListEmptyStates({
    loading,
    hasRecords,
    hasFilteredRecords,
    connected,
    loadingMessage,
    emptyMessage,
    disconnectedMessage,
    filteredEmptyMessage
}: {
    loading: boolean;
    hasRecords: boolean;
    hasFilteredRecords: boolean;
    connected: boolean;
    loadingMessage: string;
    emptyMessage: string;
    disconnectedMessage: string;
    filteredEmptyMessage: string;
}) {
    if (loading) {
        return <LoadingState message={loadingMessage} />;
    }

    if (!hasRecords) {
        return <EmptyState message={connected ? emptyMessage : disconnectedMessage} />;
    }

    if (!hasFilteredRecords) {
        return <EmptyState message={filteredEmptyMessage} />;
    }

    return null;
}

function LoadingState({ message }: { message: string }) {
    return (
        <div className="slds-text-align_center slds-is-relative playground-list-view__empty">
            <div className="slds-spinner slds-spinner_small slds-spinner_brand" role="status">
                <span className="slds-assistive-text">{message}</span>
                <div className="slds-spinner__dot-a" />
                <div className="slds-spinner__dot-b" />
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="slds-text-align_center playground-list-view__empty">
            <span className="slds-icon_container slds-icon-utility-info slds-m-bottom_small" aria-hidden="true">
                <span className="slds-assistive-text">情報</span>
            </span>
            <p>{message}</p>
        </div>
    );
}
