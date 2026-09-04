import { ApiClient } from '@hv/api-types';
import { API_BASE_URL } from './env';
import { getToken, handleUnauthorized } from './authStorage';

/** Typed farmer API client — fixtures replace this when useFixtures() is true. */
export const farmerApi = new ApiClient(API_BASE_URL, getToken, handleUnauthorized);

export { farmerApi as apiInstance };
