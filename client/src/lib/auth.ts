import { useAuth } from "@/hooks/use-auth";

export function requireAuth() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return { user: null, isLoading: true };
  }
  
  if (!user) {
    return { user: null, isLoading: false, redirectTo: "/login" };
  }
  
  return { user, isLoading: false };
}

export function requireRole(role: string) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return { user: null, isLoading: true };
  }
  
  if (!user) {
    return { user: null, isLoading: false, redirectTo: "/login" };
  }
  
  if (user.role !== role) {
    return { user: null, isLoading: false, redirectTo: "/" };
  }
  
  return { user, isLoading: false };
}
