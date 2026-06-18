import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");

  const cookie = cookies.find((row) => row.startsWith(`${name}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.split("=")[1]);
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (xsrfToken) {
    config.headers["X-XSRF-TOKEN"] = xsrfToken;
  }

  return config;
});

export async function csrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan."
): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;

    const errors = axiosError.response?.data?.errors;

    if (errors) {
      const firstError = Object.values(errors).flat()[0];

      if (firstError) {
        return firstError;
      }
    }

    return axiosError.response?.data?.message ?? fallback;
  }

  return fallback;
}