export type SalesforceQueryResponse<T> = {
    totalSize: number;
    done: boolean;
    records: T[];
};

export type AccountRecord = {
    Id: string;
    Name: string;
    Phone?: string;
    Website?: string;
    Industry?: string;
    Type?: string;
    BillingCity?: string;
    BillingCountry?: string;
    LastModifiedDate?: string;
};

export type AccountInput = {
    Name: string;
    Phone?: string;
    Website?: string;
    Industry?: string;
    Type?: string;
    BillingCity?: string;
    BillingCountry?: string;
};

export type AccountUpdateInput = Partial<{
    [K in keyof AccountInput]: AccountInput[K] | null;
}>;

export type AccountForm = {
    [K in keyof AccountInput]-?: string;
};

export type ContactRecord = {
    Id: string;
    FirstName?: string;
    LastName: string;
    Email?: string;
    Phone?: string;
    Title?: string;
    AccountId?: string;
    Account?: {
        Name?: string;
    };
    LastModifiedDate?: string;
};

export type ContactInput = {
    FirstName?: string;
    LastName: string;
    Email?: string;
    Phone?: string;
    Title?: string;
    AccountId?: string;
};

export type ContactUpdateInput = Partial<{
    [K in keyof ContactInput]: ContactInput[K] | null;
}>;

export type ContactForm = {
    [K in keyof ContactInput]-?: string;
};
