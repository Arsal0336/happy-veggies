import type {
  FarmerProfileDto,
  FarmerProfileUpdate,
  FarmerProfileUpdateResponse,
  Language,
  OtpRequestResponse,
  OtpVerifyResponse,
  RefreshSessionResponse,
} from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import {
  fixtureFarmer,
  fixtureRequestOtp,
  fixtureVerifyOtp,
} from '../fixtures';
import { mapFarmerProfileDto } from '../mappers';

export const authService = {
  async requestOtp(phone: string, language: Language = 'en'): Promise<OtpRequestResponse> {
    if (useFixtures()) return fixtureRequestOtp(phone);
    return farmerApi.post<OtpRequestResponse>('/auth/otp/request', { phone, language });
  },

  async verifyOtp(
    phone: string,
    code: string,
    requestId: string,
  ): Promise<OtpVerifyResponse> {
    if (useFixtures()) return fixtureVerifyOtp(phone, code);
    return farmerApi.post<OtpVerifyResponse>('/auth/otp/verify', {
      phone,
      code,
      requestId,
    });
  },

  async updateProfile(
    payload: FarmerProfileUpdate,
  ): Promise<FarmerProfileUpdateResponse> {
    if (useFixtures()) {
      const farmer = {
        ...fixtureFarmer,
        name: payload.name,
        language: payload.language ?? fixtureFarmer.language,
      };
      return { farmer };
    }
    const res = await farmerApi.post<FarmerProfileDto>('/farmers/me/profile', {
      name: payload.name,
      language: payload.language,
    });
    return mapFarmerProfileDto(res);
  },

  /** POST /auth/refresh — Bearer re-issue (GAP-010). */
  async refreshSession(): Promise<RefreshSessionResponse> {
    if (useFixtures()) {
      return { sessionToken: 'fixture-farmer-token-refreshed' };
    }
    return farmerApi.post<RefreshSessionResponse>('/auth/refresh');
  },

  /** POST /auth/logout — 204; client still discards token. */
  async logout(): Promise<void> {
    if (useFixtures()) return;
    try {
      await farmerApi.post<void>('/auth/logout');
    } catch {
      // Best-effort — always clear local session afterward.
    }
  },
};
