export type LatestRequest = {
    id: number;
    isCurrent: () => boolean;
};

export type LatestRequestTracker = {
    start: () => LatestRequest;
};

export function createLatestRequestTracker(): LatestRequestTracker {
    let latestId = 0;

    return {
        start() {
            latestId += 1;
            const id = latestId;

            return {
                id,
                isCurrent: () => id === latestId
            };
        }
    };
}
