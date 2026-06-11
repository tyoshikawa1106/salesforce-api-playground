"use client";

import { useMemo, useState } from "react";
import {
    areAllTimelineItemsExpanded,
    getActivityTimelineKeys,
    getExpandedSectionKeys,
    getNextTimelineExpansionState,
    toggleSetValue
} from "./activity-panel-state";
import type { ActivityTimelineSection } from "./activity-timeline-helpers";

export function useActivityTimelineDisclosure(sections: ActivityTimelineSection[]) {
    const [collapsedSectionKeys, setCollapsedSectionKeys] = useState<Set<string>>(() => new Set());
    const [expandedActivityKeys, setExpandedActivityKeys] = useState<Set<string>>(() => new Set());
    const [openActionActivityId, setOpenActionActivityId] = useState<string | null>(null);
    const activityKeys = useMemo(() => getActivityTimelineKeys(sections), [sections]);
    const expandedSectionKeys = useMemo(
        () => getExpandedSectionKeys(sections, collapsedSectionKeys),
        [collapsedSectionKeys, sections]
    );
    const allTimelineExpanded = areAllTimelineItemsExpanded({
        activityKeys,
        collapsedSectionKeys,
        expandedActivityKeys,
        sections
    });

    function toggleAllTimelineSections() {
        const next = getNextTimelineExpansionState({
            activityKeys,
            allTimelineExpanded,
            sections
        });
        setCollapsedSectionKeys(next.collapsedSectionKeys);
        setExpandedActivityKeys(next.expandedActivityKeys);
    }

    function toggleTimelineSection(key: string) {
        setCollapsedSectionKeys((current) => toggleSetValue(current, key));
    }

    function toggleActivity(key: string) {
        setExpandedActivityKeys((current) => toggleSetValue(current, key));
    }

    function toggleActionMenu(activityId: string) {
        setOpenActionActivityId((currentActivityId) =>
            currentActivityId === activityId ? null : activityId
        );
    }

    return {
        allTimelineExpanded,
        expandedActivityKeys,
        expandedSectionKeys,
        openActionActivityId,
        closeActionMenu: () => setOpenActionActivityId(null),
        toggleActionMenu,
        toggleActivity,
        toggleAllTimelineSections,
        toggleTimelineSection
    };
}
