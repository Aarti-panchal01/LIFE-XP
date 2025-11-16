import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "69103353e131b7dce6f490fa", 
  requiresAuth: true // Ensure authentication is required for all operations
});
