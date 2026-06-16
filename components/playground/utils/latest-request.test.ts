import { describe, expect, it } from "vitest";
import { createLatestRequestTracker } from "./latest-request";

describe("latest request tracker", () => {
    it("keeps only the most recent request current", () => {
        const tracker = createLatestRequestTracker();
        const firstRequest = tracker.start();
        const secondRequest = tracker.start();

        expect(firstRequest.isCurrent()).toBe(false);
        expect(secondRequest.isCurrent()).toBe(true);
    });

    it("invalidates older requests each time a new request starts", () => {
        const tracker = createLatestRequestTracker();
        const firstRequest = tracker.start();
        const secondRequest = tracker.start();
        const thirdRequest = tracker.start();

        expect(firstRequest.id).toBe(1);
        expect(secondRequest.id).toBe(2);
        expect(thirdRequest.id).toBe(3);
        expect(firstRequest.isCurrent()).toBe(false);
        expect(secondRequest.isCurrent()).toBe(false);
        expect(thirdRequest.isCurrent()).toBe(true);
    });
});
