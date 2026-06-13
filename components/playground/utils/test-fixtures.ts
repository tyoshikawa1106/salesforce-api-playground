import type { Account, Activity, Contact, RecycleBinItem } from "./types";

export const accountFixture: Account = {
    Id: "001xx000003DGbY",
    Name: "Acme",
    Phone: "03-1234-5678",
    Website: "https://example.test",
    Industry: "Technology",
    Type: "Customer",
    BillingCity: "Tokyo",
    BillingCountry: "Japan",
    CreatedDate: "2026-04-01T10:00:00.000Z",
    LastModifiedDate: "2026-05-01T10:00:00.000Z",
    LastModifiedBy: {
        Name: "Admin User"
    }
};

export const contactFixture: Contact = {
    Id: "003xx000004TmiQ",
    FirstName: "Taro",
    LastName: "Yamada",
    Email: "taro@example.test",
    Phone: "090-1234-5678",
    Title: "Manager",
    Department: "Sales",
    AccountId: accountFixture.Id,
    Account: {
        Name: accountFixture.Name
    },
    CreatedDate: "2026-04-01T10:00:00.000Z",
    LastModifiedDate: "2026-05-01T10:00:00.000Z",
    LastModifiedBy: {
        Name: "Sales User"
    }
};

export const activityFixture: Activity = {
    type: "task",
    id: "00Txx0000012345",
    subject: "Call",
    date: "2026-06-08",
    whoId: contactFixture.Id,
    whoName: "Taro Yamada",
    ownerId: "005xx0000012345",
    ownerName: "Admin User",
    whatId: accountFixture.Id,
    whatName: accountFixture.Name,
    status: "Not Started",
    description: "Follow up",
    createdDate: "2026-04-01T10:00:00.000Z",
    lastModifiedDate: "2026-05-01T10:00:00.000Z"
};

export const recycleBinItemFixture: RecycleBinItem = {
    objectApiName: "Account",
    objectLabel: "取引先",
    id: accountFixture.Id,
    name: accountFixture.Name,
    deletedAt: accountFixture.LastModifiedDate,
    deletedByName: "Taro Admin"
};

export const noop = () => {};
