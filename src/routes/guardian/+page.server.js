export const prerender = false;

import { redirect } from '@sveltejs/kit';

export async function load({ fetch, url }) {
  // In a real app, we would get the userId from a session or cookie
  // Since this is a local-first app, we might need to pass it or get it from the client
  // For the initial load, we'll try to get it from the query param if present (e.g. from a deep link)
  // otherwise the client-side onMount will have to fetch the data.
  
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return {
      guardianData: null
    };
  }

  const res = await fetch(`/api/guardian/generate-keys?userId=${userId}`);
  const guardianData = await res.json();

  return {
    guardianData
  };
}
