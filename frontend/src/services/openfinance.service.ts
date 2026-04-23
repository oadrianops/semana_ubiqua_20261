import { api } from './api';

export interface Institution {
  id: string;
  name: string;
  color: string;
}

export interface ConsentItem {
  category: string;
  label: string;
  description: string;
  required: boolean;
  granted: boolean;
  grantedAt?: string | null;
  revokedAt?: string | null;
}

export interface BankConnection {
  id: string;
  institution: string;
  status: string;
  connectedAt: string;
  _count?: { transactions: number };
}

export interface Transaction {
  id: string;
  connectionId: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  isCircular: boolean;
}

export const openFinanceService = {
  async listInstitutions(): Promise<Institution[]> {
    const { data } = await api.get('/openfinance/institutions');
    return data;
  },

  async listConnections(): Promise<BankConnection[]> {
    const { data } = await api.get('/openfinance/connections');
    return data;
  },

  async connect(institutionId: string) {
    const { data } = await api.post('/openfinance/connect', { institutionId });
    return data;
  },

  async disconnect(id: string) {
    const { data } = await api.delete(`/openfinance/connections/${id}`);
    return data;
  },

  async transactions() {
    const { data } = await api.get('/openfinance/transactions');
    return data as {
      total: number;
      transactions: Transaction[];
      summary: {
        totalIncome: number;
        totalExpenses: number;
        netFlow: number;
        circularFlags: number;
      };
    };
  },

  async listConsents(): Promise<ConsentItem[]> {
    const { data } = await api.get('/openfinance/consents');
    return data;
  },

  async grantConsents(categories: string[]) {
    const { data } = await api.post('/openfinance/consents', { categories });
    return data;
  },

  async revokeConsent(category: string) {
    const { data } = await api.delete(`/openfinance/consents/${category}`);
    return data;
  },
};
