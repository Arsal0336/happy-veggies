import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

export interface OtpRequestResponse {
  requestId: string;
  expiresAt?: string;
  demoCode?: string;
}

export interface OtpVerifyResponse {
  sessionToken: string;
  farmer: {
    id: string;
    phone: string;
    name?: string | null;
    language?: string | null;
  };
  isNewUser?: boolean;
}

export interface FarmerProfileDto {
  id: string;
  phone: string;
  name?: string | null;
  language?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  requestOtp(phone: string, language: string = 'en'): Observable<OtpRequestResponse> {
    return this.http.post<OtpRequestResponse>(`${this.base}/auth/otp/request`, {
      phone,
      language,
    });
  }

  verifyOtp(phone: string, code: string, requestId: string): Observable<OtpVerifyResponse> {
    return this.http.post<OtpVerifyResponse>(`${this.base}/auth/otp/verify`, {
      phone,
      code,
      requestId,
    });
  }

  updateProfile(body: { name: string; language?: string }): Observable<FarmerProfileDto> {
    return this.http.post<FarmerProfileDto>(`${this.base}/farmers/me/profile`, body);
  }

  refreshSession(): Observable<{ sessionToken: string }> {
    return this.http.post<{ sessionToken: string }>(`${this.base}/auth/refresh`, {});
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/logout`, {});
  }
}
