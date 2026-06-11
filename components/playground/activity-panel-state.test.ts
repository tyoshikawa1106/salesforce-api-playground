import { describe, expect, it } from "vitest";
import {
    areAllTimelineItemsExpanded,
    emptyFutureActivityTimelineSection,
    getActivityTimelineKeys,
    getDisplayedTimelineSections,
    getExpandedSectionKeys,
    getNextTimelineExpansionState,
    toggleSetValue
} from "./activity-panel-state";
import { activityFixture } from "./test-fixtures";

describe("activity panel state helpers", () => {
    it("keeps an empty future timeline section available for interaction", () => {
        expect(getDisplayedTimelineSections([], {})).toEqual([emptyFutureActivityTimelineSection]);
    });

    it("derives activity and expanded section keys from displayed sections", () => {
        const sections = getDisplayedTimelineSections([activityFixture], {});

        expect(getActivityTimelineKeys(sections)).toEqual([`${activityFixture.type}-${activityFixture.id}`]);
        expect(getExpandedSectionKeys(sections, new Set())).toEqual(new Set(["future"]));
        expect(getExpandedSectionKeys(sections, new Set(["future"]))).toEqual(new Set());
    });

    it("toggles all timeline sections and activities together", () => {
        const sections = getDisplayedTimelineSections([activityFixture], {});
        const activityKeys = getActivityTimelineKeys(sections);
        const expandedState = getNextTimelineExpansionState({
            activityKeys,
            allTimelineExpanded: false,
            sections
        });

        expect(expandedState.collapsedSectionKeys).toEqual(new Set());
        expect(expandedState.expandedActivityKeys).toEqual(new Set([`${activityFixture.type}-${activityFixture.id}`]));
        expect(areAllTimelineItemsExpanded({
            activityKeys,
            collapsedSectionKeys: expandedState.collapsedSectionKeys,
            expandedActivityKeys: expandedState.expandedActivityKeys,
            sections
        })).toBe(true);

        const collapsedState = getNextTimelineExpansionState({
            activityKeys,
            allTimelineExpanded: true,
            sections
        });
        expect(collapsedState.collapsedSectionKeys).toEqual(new Set(["future"]));
        expect(collapsedState.expandedActivityKeys).toEqual(new Set());
    });

    it("returns a new set when toggling a value", () => {
        const original = new Set(["future"]);
        const removed = toggleSetValue(original, "future");
        const added = toggleSetValue(removed, "history");

        expect(original).toEqual(new Set(["future"]));
        expect(removed).toEqual(new Set());
        expect(added).toEqual(new Set(["history"]));
    });
});
