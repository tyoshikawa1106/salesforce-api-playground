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
        return <EmptyState message={loadingMessage} />;
    }

    if (!hasRecords) {
        return <EmptyState message={connected ? emptyMessage : disconnectedMessage} />;
    }

    if (!hasFilteredRecords) {
        return <EmptyState message={filteredEmptyMessage} />;
    }

    return null;
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="slds-text-align_center slds-p-around_xx-large">
            <span className="slds-icon_container slds-icon-utility-info slds-m-bottom_small" aria-hidden="true">
                <span className="slds-assistive-text">情報</span>
            </span>
            <p>{message}</p>
        </div>
    );
}
