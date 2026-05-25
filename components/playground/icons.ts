import type { StaticImageData } from "next/image";
import accountIcon from "@salesforce-ux/design-system/assets/icons/standard/account.svg";
import contactIcon from "@salesforce-ux/design-system/assets/icons/standard/contact.svg";
import homeIcon from "@salesforce-ux/design-system/assets/icons/standard/home.svg";
import addIcon from "@salesforce-ux/design-system/assets/icons/utility/add.svg";
import helpIcon from "@salesforce-ux/design-system/assets/icons/utility/help.svg";
import logoutIcon from "@salesforce-ux/design-system/assets/icons/utility/logout.svg";
import notificationIcon from "@salesforce-ux/design-system/assets/icons/utility/notification.svg";
import refreshIcon from "@salesforce-ux/design-system/assets/icons/utility/refresh.svg";
import searchIcon from "@salesforce-ux/design-system/assets/icons/utility/search.svg";
import settingsIcon from "@salesforce-ux/design-system/assets/icons/utility/settings.svg";
import tableIcon from "@salesforce-ux/design-system/assets/icons/utility/table.svg";
import userIcon from "@salesforce-ux/design-system/assets/icons/utility/user.svg";
import salesforceLogo from "@salesforce-ux/design-system/assets/images/logo-noname.svg";
import type { ActiveTab } from "./types";

export { salesforceLogo };

export const standardIcons: Record<ActiveTab, StaticImageData> = {
    home: homeIcon,
    accounts: accountIcon,
    contacts: contactIcon
};

export const utilityIcons = {
    add: addIcon,
    help: helpIcon,
    logout: logoutIcon,
    notification: notificationIcon,
    refresh: refreshIcon,
    search: searchIcon,
    settings: settingsIcon,
    table: tableIcon,
    user: userIcon
};
