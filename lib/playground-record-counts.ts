export const homeRecordCountObjectConfigs = [
    { key: "leads", objectApiName: "Lead" },
    { key: "opportunities", objectApiName: "Opportunity" },
    { key: "products", objectApiName: "Product2" },
    { key: "campaigns", objectApiName: "Campaign" },
    { key: "cases", objectApiName: "Case" },
    { key: "emailMessages", objectApiName: "EmailMessage" }
] as const;

export type HomeRecordCountKey = typeof homeRecordCountObjectConfigs[number]["key"];

export type HomeRecordCounts = Record<HomeRecordCountKey, number>;

export const emptyHomeRecordCounts: HomeRecordCounts = {
    campaigns: 0,
    cases: 0,
    emailMessages: 0,
    leads: 0,
    opportunities: 0,
    products: 0
};

export function createEmptyHomeRecordCounts() {
    return { ...emptyHomeRecordCounts };
}
