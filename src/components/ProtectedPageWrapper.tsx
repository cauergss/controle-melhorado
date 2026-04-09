import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

type ProtectedPageWrapperProps = {
  children: ReactNode;
  requiredRole?: "admin" | "user";
  fallbackRedirect?: string;
};

export default function ProtectedPageWrapper({
  children,
  requiredRole = "user",
  fallbackRedirect = "/login",
}: ProtectedPageWrapperProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        
        if (!res.ok) {
          router.replace(fallbackRedirect);
          return;
        }

        const data = await res.json();
        
        if (requiredRole === "admin" && data.user.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        router.replace(fallbackRedirect);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router, requiredRole, fallbackRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
