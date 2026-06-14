import type { ActiveTab } from "./utils/types";

export type ComponentLogEntry = {
    description: string;
    name: string;
    filePath: string;
};

export type ComponentLogGroup = {
    label: string;
    entries: ComponentLogEntry[];
};

type VisibleComponentLogState = {
    activeTab: ActiveTab;
    hasSelectedAccount: boolean;
    hasSelectedActivity: boolean;
    hasSelectedContact: boolean;
};

const shellComponentLogs: ComponentLogEntry[] = [
    { description: "ログイン後画面の状態管理と全体レイアウトを組み立てる。", name: "Playground", filePath: "components/Playground.tsx" },
    { description: "Salesforce 風の上部ヘッダーとナビゲーション枠を表示する。", name: "GlobalHeader", filePath: "components/playground/shell/GlobalHeader.tsx" },
    { description: "グローバル検索ボックスと検索結果選択を扱う。", name: "GlobalSearch", filePath: "components/playground/shell/GlobalSearch.tsx" },
    { description: "ヘッダー右側のアクション、ヘルプ、設定、通知、ユーザー領域を表示する。", name: "GlobalHeaderActions", filePath: "components/playground/shell/GlobalHeaderActions.tsx" },
    { description: "ホーム、取引先、取引先責任者などのタブナビゲーションを表示する。", name: "AppNavigation", filePath: "components/playground/shell/Navigation.tsx" },
    { description: "画面下部の Utility Bar と Logs パネルを表示する。", name: "UtilityBar", filePath: "components/playground/shell/UtilityBar.tsx" }
];

const workspaceBaseComponentLogs: ComponentLogEntry[] = [
    { description: "選択中タブとレコード状態に応じて表示する画面を切り替える。", name: "PlaygroundWorkspace", filePath: "components/playground/PlaygroundWorkspace.tsx" }
];

const homeComponentLogs: ComponentLogEntry[] = [
    { description: "ホーム画面のヘッダーを表示する。", name: "HomePanel", filePath: "components/playground/home/HomePanel.tsx" },
    { description: "ページタイトル、アイコン、補足情報を共通形式で表示する。", name: "PageHeader", filePath: "components/playground/shell/PageHeader.tsx" },
    { description: "ホーム画面のオブジェクト件数カードを表示する。", name: "HomeCounts", filePath: "components/playground/home/HomePanel.tsx" }
];

const accountListComponentLogs: ComponentLogEntry[] = [
    { description: "取引先一覧画面のヘッダーと一覧パネルを組み立てる。", name: "AccountListWorkspace", filePath: "components/playground/records/RecordWorkspacePanels.tsx" },
    { description: "オブジェクト一覧画面のヘッダーを表示する。", name: "ObjectHomeHeader", filePath: "components/playground/records/ObjectHome.tsx" },
    { description: "取引先一覧のデータと操作を一覧パネルへ渡す。", name: "AccountPanel", filePath: "components/playground/records/RecordLists.tsx" },
    { description: "検索、更新、削除、テーブルを含むレコード一覧 UI を表示する。", name: "RecordListPanel", filePath: "components/playground/records/RecordListPanel.tsx" }
];

const accountDetailComponentLogs: ComponentLogEntry[] = [
    { description: "選択中の取引先詳細画面を組み立てる。", name: "AccountDetailWorkspace", filePath: "components/playground/records/RecordWorkspacePanels.tsx" },
    { description: "取引先レコードページの本文、関連情報、活動を表示する。", name: "AccountRecordPage", filePath: "components/playground/records/RecordPages.tsx" },
    { description: "レコード詳細画面のヘッダーと主要操作を表示する。", name: "RecordPageHeader", filePath: "components/playground/records/RecordPageHeader.tsx" },
    { description: "レコード詳細のタブ領域を表示する。", name: "RecordMainTabs", filePath: "components/playground/records/RecordMainTabs.tsx" },
    { description: "関連する活動タイムラインと活動作成操作を表示する。", name: "ActivityPanel", filePath: "components/playground/activities/ActivityPanel.tsx" }
];

const contactListComponentLogs: ComponentLogEntry[] = [
    { description: "取引先責任者一覧画面のヘッダーと一覧パネルを組み立てる。", name: "ContactListWorkspace", filePath: "components/playground/records/RecordWorkspacePanels.tsx" },
    { description: "オブジェクト一覧画面のヘッダーを表示する。", name: "ObjectHomeHeader", filePath: "components/playground/records/ObjectHome.tsx" },
    { description: "取引先責任者一覧のデータと操作を一覧パネルへ渡す。", name: "ContactPanel", filePath: "components/playground/records/RecordLists.tsx" },
    { description: "検索、更新、削除、テーブルを含むレコード一覧 UI を表示する。", name: "RecordListPanel", filePath: "components/playground/records/RecordListPanel.tsx" }
];

const contactDetailComponentLogs: ComponentLogEntry[] = [
    { description: "選択中の取引先責任者詳細画面を組み立てる。", name: "ContactDetailWorkspace", filePath: "components/playground/records/RecordWorkspacePanels.tsx" },
    { description: "取引先責任者レコードページの本文、関連情報、活動を表示する。", name: "ContactRecordPage", filePath: "components/playground/records/RecordPages.tsx" },
    { description: "レコード詳細画面のヘッダーと主要操作を表示する。", name: "RecordPageHeader", filePath: "components/playground/records/RecordPageHeader.tsx" },
    { description: "レコード詳細のタブ領域を表示する。", name: "RecordMainTabs", filePath: "components/playground/records/RecordMainTabs.tsx" },
    { description: "関連する活動タイムラインと活動作成操作を表示する。", name: "ActivityPanel", filePath: "components/playground/activities/ActivityPanel.tsx" }
];

const activityDetailComponentLogs: ComponentLogEntry[] = [
    { description: "選択中の活動詳細画面を組み立てる。", name: "ActivityDetailWorkspace", filePath: "components/playground/records/RecordWorkspacePanels.tsx" },
    { description: "活動レコードページの本文と関連リンクを表示する。", name: "ActivityRecordPage", filePath: "components/playground/records/RecordPages.tsx" },
    { description: "レコード詳細画面のヘッダーと主要操作を表示する。", name: "RecordPageHeader", filePath: "components/playground/records/RecordPageHeader.tsx" },
    { description: "レコード詳細のタブ領域を表示する。", name: "RecordMainTabs", filePath: "components/playground/records/RecordMainTabs.tsx" }
];

const integrationComponentLogs: ComponentLogEntry[] = [
    { description: "連携タブの取引先作成フォームを表示する。", name: "IntegrationPanel", filePath: "components/playground/integration/IntegrationPanel.tsx" }
];

const recycleBinComponentLogs: ComponentLogEntry[] = [
    { description: "ごみ箱画面のヘッダー、操作、一覧を組み立てる。", name: "RecycleBinPanel", filePath: "components/playground/recycle-bin/RecycleBinPanel.tsx" },
    { description: "ごみ箱のレコード一覧テーブルを表示する。", name: "RecycleBinTable", filePath: "components/playground/recycle-bin/RecycleBinTable.tsx" }
];

export function getVisibleComponentLogGroups({
    activeTab,
    hasSelectedAccount,
    hasSelectedActivity,
    hasSelectedContact
}: VisibleComponentLogState): ComponentLogGroup[] {
    return [
        {
            label: "表示中の画面",
            entries: [
                ...workspaceBaseComponentLogs,
                ...getWorkspaceComponentLogs({
                    activeTab,
                    hasSelectedAccount,
                    hasSelectedActivity,
                    hasSelectedContact
                })
            ]
        },
        { label: "共通レイアウト", entries: shellComponentLogs }
    ];
}

function getWorkspaceComponentLogs({
    activeTab,
    hasSelectedAccount,
    hasSelectedActivity,
    hasSelectedContact
}: VisibleComponentLogState): ComponentLogEntry[] {
    if (activeTab === "home") {
        return homeComponentLogs;
    }

    if (activeTab === "accounts") {
        return hasSelectedAccount ? accountDetailComponentLogs : accountListComponentLogs;
    }

    if (activeTab === "contacts") {
        return hasSelectedContact ? contactDetailComponentLogs : contactListComponentLogs;
    }

    if (activeTab === "activities") {
        return hasSelectedActivity ? activityDetailComponentLogs : [];
    }

    if (activeTab === "integration") {
        return integrationComponentLogs;
    }

    return recycleBinComponentLogs;
}
