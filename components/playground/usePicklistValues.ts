"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlaygroundApiRequest, playgroundApiPaths } from "@/lib/playground-api";
import type { PicklistValuesResponse } from "@/lib/salesforce/picklist-values";
import { apiRequest } from "./api";

type UsePicklistValuesOptions = {
    enabled: boolean;
    fieldApiNames: string[];
    objectApiName: "Account" | "Task";
    recordTypeId?: string;
};

export function usePicklistValues({
    enabled,
    fieldApiNames,
    objectApiName,
    recordTypeId
}: UsePicklistValuesOptions) {
    const [data, setData] = useState<PicklistValuesResponse | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const fieldsKey = useMemo(() => fieldApiNames.join(","), [fieldApiNames]);

    useEffect(() => {
        let active = true;

        if (!enabled) {
            setData(null);
            setError("");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        apiRequest<PicklistValuesResponse>(
            buildPlaygroundApiRequest(playgroundApiPaths.picklistValues({
                fields: fieldsKey.split(",").filter(Boolean),
                object: objectApiName,
                recordTypeId
            }))
        )
            .then((response) => {
                if (active) {
                    setData(response);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setData(null);
                    setError(requestError instanceof Error ? requestError.message : "選択リスト値を取得できませんでした。");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [enabled, fieldsKey, objectApiName, recordTypeId]);

    return {
        data,
        error,
        loading
    };
}
