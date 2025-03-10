import { useRouter } from 'next/navigation';

export const routes = {
  home: '/',
  properties: '/properties',
  propertyDetails: (id: string) => `/properties/${id}`,
  bookings: '/bookings',
  signIn: '/sign-in',
  signUp: '/sign-up',
  profile: '/profile',
  payment: '/payment',
} as const;

export function useNavigation() {
  const router = useRouter();

  return {
    navigate: (path: string) => router.push(path),
    back: () => router.back(),
    refresh: () => router.refresh(),
  };
} 