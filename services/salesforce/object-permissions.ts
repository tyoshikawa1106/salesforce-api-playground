import type { Connection, DescribeSObjectResult } from "jsforce";
import { SalesforceApiError } from "@/lib/salesforce/client";

export type ObjectPermission = "queryable" | "searchable" | "createable" | "updateable" | "deletable" | "undeletable";

type ObjectPermissionActionLabel = "参照" | "検索" | "作成" | "更新" | "削除" | "復元";

const objectPermissionActionLabels: Record<ObjectPermission, ObjectPermissionActionLabel> = {
    queryable: "参照",
    searchable: "検索",
    createable: "作成",
    updateable: "更新",
    deletable: "削除",
    undeletable: "復元"
};

export async function assertObjectPermission(
    connection: Connection,
    objectName: string,
    permission: ObjectPermission
): Promise<DescribeSObjectResult> {
    const describe = await connection.sobject(objectName).describe();
    if (!describe[permission]) {
        throw new SalesforceApiError(
            `${objectName} の${objectPermissionActionLabels[permission]}権限がありません。`,
            403
        );
    }

    return describe;
}
