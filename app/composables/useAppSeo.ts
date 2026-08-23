import type { MaybeRefOrGetter } from "vue";

export const LUGO_SITE_NAME = "LugGo(ラグゴー)";
export const LUGO_DEFAULT_TITLE
  = "LugGo(ラグゴー) | 予約から配送まで一括管理";
export const LUGO_DEFAULT_DESCRIPTION
  = "固定費完全無料。旅行客向けの手荷物配送予約フォームの作成、予約管理、配送管理、配達者管理、売上管理を一括で行えます。";
export const LUGO_EMAIL = "luggo.register@gmail.com";
export const LUGO_OGP_IMAGE = "/img/ogp-luggo.png";
export const BUSINESS_OGP_IMAGE = "/img/ogp-business.png";

export type BusinessProfileSeo = {
  company_name: string;
  company_name_en?: string;
  subdomain: string;
  support_email?: string;
};

export type SeoBreadcrumb = {
  name: string;
  item?: string;
};

export type UseAppSeoOptions = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  /** true のとき title をそのまま使い、ブランド接尾辞を付けない */
  isHome?: MaybeRefOrGetter<boolean>;
  breadcrumbs?: MaybeRefOrGetter<SeoBreadcrumb[] | undefined>;
  withService?: MaybeRefOrGetter<boolean>;
};

const isBusinessPath = (path: string): boolean => path.startsWith("/booking");

// LugGo / 事業者のブランド判定と、SEO 用の origin・canonical・OGP 画像・locale を返す
export const useSeoBrand = () => {
  const route = useRoute();
  const requestUrl = useRequestURL();
  const site = useSiteConfig();
  const { bcp47Locale, currentLocale } = useAppLocale();
  const businessProfile = useState<BusinessProfileSeo | null>(
    "businessProfile",
    () => null,
  );

  const isBusinessPage = computed(() => isBusinessPath(route.path));

  const brandName = computed(() => {
    if (!isBusinessPage.value || !businessProfile.value?.company_name) {
      return LUGO_SITE_NAME;
    }
    const companyNameEn = businessProfile.value.company_name_en?.trim();
    if (currentLocale.value !== "ja" && companyNameEn) {
      return companyNameEn;
    }
    return businessProfile.value.company_name;
  });

  const siteOrigin = computed(() => {
    if (isBusinessPage.value) {
      return requestUrl.origin;
    }
    return site.url || requestUrl.origin;
  });

  const canonicalUrl = computed(() => {
    const url = new URL(route.path, siteOrigin.value);
    const subdomain = route.query.subdomain;
    if (typeof subdomain === "string" && subdomain) {
      url.searchParams.set("subdomain", subdomain);
    }
    return url.toString();
  });

  const ogImage = computed(() => {
    const path = isBusinessPage.value ? BUSINESS_OGP_IMAGE : LUGO_OGP_IMAGE;
    return new URL(path, siteOrigin.value).toString();
  });

  const ogLocale = computed(() =>
    isBusinessPage.value ? bcp47Locale.value.replace("-", "_") : "ja_JP",
  );

  return {
    businessProfile,
    isBusinessPage,
    brandName,
    siteOrigin,
    canonicalUrl,
    ogImage,
    ogLocale,
  };
};

// SEO モジュール共有の site 設定を、LugGo / 事業者のどちらのブランドかに合わせて同期
const applySiteConfigForBrand = (brandName: string): void => {
  const route = useRoute();
  const requestUrl = useRequestURL();
  const businessProfile = useState<BusinessProfileSeo | null>(
    "businessProfile",
    () => null,
  );

  if (isBusinessPath(route.path) && businessProfile.value?.company_name) {
    updateSiteConfig({
      url: requestUrl.origin,
      name: brandName,
    });
    return;
  }

  updateSiteConfig({
    name: LUGO_SITE_NAME,
  });
};

// ページの title / description などから、OGP・Twitter・JSON-LD をまとめて適用
export const useAppSeo = (options: UseAppSeoOptions): void => {
  const {
    businessProfile,
    isBusinessPage,
    brandName,
    canonicalUrl,
    ogImage,
    ogLocale,
    siteOrigin,
  } = useSeoBrand();

  watch(brandName, (name) => {
    applySiteConfigForBrand(name);
  }, { immediate: true });

  const pageTtl = computed(() => toValue(options.title));
  const pageDesc = computed(() => toValue(options.description));
  const isHome = computed(() => Boolean(toValue(options.isHome)));

  const fullTtl = computed(() => {
    const title = pageTtl.value;
    if (isHome.value || title.includes(brandName.value)) {
      return title;
    }
    return `${title} | ${brandName.value}`;
  });

  useSeoMeta({
    title: fullTtl,
    titleTemplate: "%s",
    description: pageDesc,
    ogTitle: fullTtl,
    ogDescription: pageDesc,
    ogType: "website",
    ogSiteName: brandName,
    ogUrl: canonicalUrl,
    ogImage: ogImage,
    ogLocale: ogLocale,
    twitterCard: "summary_large_image",
    twitterTitle: fullTtl,
    twitterDescription: pageDesc,
    twitterImage: ogImage,
  });

  useSchemaOrg(() => {
    const identity = isBusinessPage.value && businessProfile.value
      ? [
          defineOrganization({
            name: brandName.value,
            url: siteOrigin.value,
            email: businessProfile.value.support_email || undefined,
          }),
          defineWebSite({
            name: brandName.value,
            url: siteOrigin.value,
          }),
        ]
      : [
          defineOrganization({
            name: "LugGo",
            alternateName: LUGO_SITE_NAME,
            url: siteOrigin.value,
            logo: new URL("/img/luggo.svg", siteOrigin.value).toString(),
            email: LUGO_EMAIL,
          }),
          defineWebSite({
            name: LUGO_SITE_NAME,
            url: siteOrigin.value,
          }),
        ];

    const breadcrumbs = options.breadcrumbs
      ? toValue(options.breadcrumbs)
      : undefined;
    const breadcrumbNode = breadcrumbs?.length
      ? [
          defineBreadcrumb({
            itemListElement: breadcrumbs.map(crumb => ({
              name: crumb.name,
              item: crumb.item,
            })),
          }),
        ]
      : [];

    const serviceNode
      = toValue(options.withService) && isBusinessPage.value
        ? [
            defineService({
              name: pageTtl.value,
              description: pageDesc.value,
              serviceType: "手荷物配送",
              provider: {
                name: brandName.value,
              },
            }),
          ]
        : [];

    return [
      ...identity,
      defineWebPage({
        name: fullTtl.value,
        description: pageDesc.value,
      }),
      ...breadcrumbNode,
      ...serviceNode,
    ];
  });
};
