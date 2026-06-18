"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  nim?: string | null;
  class_?: string | null;
  role?: string | null;
};

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      try {
        const { data } = await api.get<AuthUser>("/api/user");

        if (active) {
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch authenticated user:", error);

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, []);

  return {
    user,
    loading,
  };
}