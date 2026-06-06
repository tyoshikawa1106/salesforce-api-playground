import type { Account, Contact } from "./types";

export const accountFixture: Account = {
    Id: "001xx000003DGbY",
    Name: "Acme"
};

export const contactFixture: Contact = {
    Id: "003xx000004TmiQ",
    FirstName: "Taro",
    LastName: "Yamada",
    AccountId: accountFixture.Id,
    Account: {
        Name: accountFixture.Name
    }
};
