export const useCsrf = () => {
  const ensureCsrf = async (apiBase: string): Promise<void> => {
    await fetch(`${apiBase}/api/common/csrf`, { credentials: "include" });
  };

  const getCsrf = (): string | undefined => {
    if (!import.meta.client) return undefined;
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrftoken="));
    return match ? match.split("=")[1] : undefined;
  };

  return {
    ensureCsrf,
    getCsrf,
  };
};
