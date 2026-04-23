import { api } from './api';

export interface SimulationResult {
  amount: number;
  installments: number;
  monthlyRate: number;
  installmentAmount: number;
  totalAmount: number;
  totalInterest: number;
  iof: number;
}

export interface Payment {
  id: string;
  creditRequestId: string;
  installmentNo: number;
  dueDate: string;
  amount: number;
  paidAt: string | null;
  status: 'pending' | 'paid' | 'overdue';
}

export interface CreditRequest {
  id: string;
  userId: string;
  requestedAmount: number;
  approvedAmount: number | null;
  installments: number;
  monthlyRate: number;
  totalAmount: number | null;
  status: 'pending' | 'approved' | 'denied' | 'active' | 'paid';
  scoreAtRequest: number;
  pixKey: string | null;
  requestedAt: string;
  approvedAt: string | null;
  disbursedAt: string | null;
  payments: Payment[];
}

export const creditService = {
  async simulate(amount: number, installments: number): Promise<SimulationResult> {
    const { data } = await api.post('/credit/simulate', { amount, installments });
    return data;
  },

  async request(input: { amount: number; installments: number; pixKey?: string }) {
    const { data } = await api.post('/credit/request', input);
    return data as CreditRequest & {
      explanation: string;
      simulationPreview: SimulationResult;
    };
  },

  async list(): Promise<CreditRequest[]> {
    const { data } = await api.get('/credit/requests');
    return data;
  },

  async get(id: string): Promise<CreditRequest> {
    const { data } = await api.get(`/credit/requests/${id}`);
    return data;
  },

  async payInstallment(id: string, installmentNo: number) {
    const { data } = await api.post(`/credit/requests/${id}/pay`, { installmentNo });
    return data;
  },
};
