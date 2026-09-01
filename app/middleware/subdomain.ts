import { resolveSubdomain } from "~/composables/useSubdomain";

export default defineNuxtRouteMiddleware(async (_to) => {
  const subdomain = resolveSubdomain();

  if (!subdomain) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }

  // BusinessProfileを取得
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBaseUrl;

  try {
    const data = await $fetch<{
      id: string;
      company_name: string;
      company_name_en: string;
      subdomain: string;
      is_active: boolean;
      service_areas: string[];
      pricing_rules: Record<string, Record<string, number>>;
      operating_days: string;
      nth_weekday_holidays: string[];
      daily_max_luggage: number;
      temporary_closures: string[];
      support_email: string;
    }>(`${apiBase}/api/business/subdomain/profile`, {
      method: "GET",
      params: { subdomain },
      credentials: "include",
    });

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
      });
    }

    const businessProfile = useState("businessProfile", () => data);
    businessProfile.value = data;
  }
  catch (err: unknown) {
    if (err && typeof err === "object" && "statusCode" in err) {
      throw err;
    }
    if (
      err
      && typeof err === "object"
      && "status" in err
      && err.status === 404
    ) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
