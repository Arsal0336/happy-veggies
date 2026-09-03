import { farmerApi } from '../apiInstance';
import { fixtureOtpRequest, fixtureOtpVerify } from '@hv/api-types';
import type { OtpRequestResponse, OtpVerifyResponse } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const authService = {
  requestOtp: async (phone: string): Promise<OtpRequestResponse> => {
    if (USE_FIXTURES) return fixtureOtpRequest();
    return farmerApi.post<OtpRequestResponse>('/auth/otp/request', { phone, language: 'ur' });
  },

  verifyOtp: async (phone: string, code: string): Promise<OtpVerifyResponse> => {
    if (USE_FIXTURES) return fixtureOtpVerify();
    return farmerApi.post<OtpVerifyResponse>('/auth/otp/verify', { phone, code, requestId: '' });
  },
};
