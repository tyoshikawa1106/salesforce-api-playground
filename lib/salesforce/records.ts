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
