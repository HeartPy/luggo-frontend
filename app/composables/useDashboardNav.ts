export type DashboardView
  = | "reservations"
    | "drivers"
    | "revenue"
    | "settings"
    | "settings-pricing"
    | "settings-business"
    | "settings-invoice"
    | "business-info"
    | "payment-info";

const viewTtls: Record<DashboardView, string> = {
  "reservations": "予約一覧",
  "drivers": "配達者一覧",
  "revenue": "売上管理",
  "settings": "各種設定",
  "settings-pricing": "料金設定",
  "settings-business": "事業設定",
  "settings-invoice": "インボイス設定",
  "business-info": "ユーザー情報",
  "payment-info": "決済設定情報",
};

const VALID_TOP_VIEWS: DashboardView[] = [
  "reservations",
  "drivers",
  "revenue",
  "business-info",
  "payment-info",
];

const DASHBOARD_PREFIX = "/business-owner/dashboard";

// 「各種設定」グループのサブビュー
const SETTINGS_CHILDREN: Record<string, DashboardView> = {
  pricing: "settings-pricing",
  business: "settings-business",
  invoice: "settings-invoice",
};

function isTopView(value: string): value is DashboardView {
  return (VALID_TOP_VIEWS as string[]).includes(value);
}

// URL パス → 対応するビュー名
export function pathToView(path: string): DashboardView {
  if (!path.startsWith(DASHBOARD_PREFIX)) return "reservations";
  // /business-owner/dashboard 以下の相対パスを取り出す
  const rest = path.slice(DASHBOARD_PREFIX.length).replace(/^\/+|\/+$/g, "");
  if (rest === "") return "reservations";

  const segments = rest.split("/").filter(seg => seg !== "");
  if (segments.length === 1) {
    const seg = segments[0]!;
    if (seg === "settings") return "settings";
    if (isTopView(seg)) return seg;
    return "reservations";
  }
  if (segments.length === 2 && segments[0] === "settings") {
    const mapped = SETTINGS_CHILDREN[segments[1]!];
    if (mapped) return mapped;
  }
  return "reservations";
}

// ビュー名 → 対応する URL パス
function viewToPath(view: DashboardView): string {
  if (view === "reservations") return DASHBOARD_PREFIX;
  if (view === "settings-pricing")
    return `${DASHBOARD_PREFIX}/settings/pricing`;
  if (view === "settings-business")
    return `${DASHBOARD_PREFIX}/settings/business`;
  if (view === "settings-invoice")
    return `${DASHBOARD_PREFIX}/settings/invoice`;
  return `${DASHBOARD_PREFIX}/${view}`;
}

function resolveInitialView(): DashboardView {
  try {
    const route = useRoute();
    return pathToView(route.path);
  }
  catch {
    return "reservations";
  }
}

export const useDashboardNav = () => {
  const initialView = resolveInitialView();
  const currentView = useState<DashboardView>(
    "dashboardView",
    () => initialView,
  );
  const currentTtl = useState<string>(
    "dashboardTtl",
    () => viewTtls[initialView],
  );

  const updateTtl = () => {
    currentTtl.value = viewTtls[currentView.value];
  };

  // 現在のURLに合わせて currentView とタイトルを同期
  const syncFromRoute = () => {
    const route = useRoute();
    currentView.value = pathToView(route.path);
    updateTtl();
  };

  // 選択したビューのURLへ遷移
  const navigate = (view: string) => {
    const allowed: DashboardView[] = [
      ...VALID_TOP_VIEWS,
      "settings",
      "settings-pricing",
      "settings-business",
      "settings-invoice",
    ];
    if (!(allowed as string[]).includes(view)) return;
    navigateTo(viewToPath(view as DashboardView), { replace: true });
  };

  return {
    currentView: readonly(currentView),
    currentTtl: readonly(currentTtl),
    navigate,
    syncFromRoute,
  };
};
