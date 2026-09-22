declare module 'midtrans-client' {
  export interface SnapTransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface SnapCustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    billing_address?: any;
    shipping_address?: any;
  }

  export interface SnapItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
    category?: string;
    url?: string;
  }

  export interface SnapParameter {
    transaction_details: SnapTransactionDetails;
    customer_details?: SnapCustomerDetails;
    item_details?: SnapItemDetails[];
    credit_card?: {
      secure?: boolean;
      channel?: string;
      bank?: string;
      installment?: any;
    };
    callbacks?: {
      finish?: string;
    };
  }

  export interface SnapResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    createTransaction(parameter: SnapParameter): Promise<SnapResponse>;
    createTransactionToken(parameter: SnapParameter): Promise<string>;
    createTransactionRedirectUrl(parameter: SnapParameter): Promise<string>;

    transaction: {
      notification(notificationJson: any): Promise<any>;
      status(transactionId: string): Promise<any>;
      approve(transactionId: string): Promise<any>;
      cancel(transactionId: string): Promise<any>;
      expire(transactionId: string): Promise<any>;
    };
  }

  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    charge(parameter: any): Promise<any>;
    transaction: {
      notification(notificationJson: any): Promise<any>;
      status(transactionId: string): Promise<any>;
      approve(transactionId: string): Promise<any>;
      cancel(transactionId: string): Promise<any>;
      expire(transactionId: string): Promise<any>;
    };
  }
}
