export type DashboardView =
  | "reservations"
  | "drivers"
  | "revenue"
  | "pricing-settings";

const viewTtls: Record<DashboardView, string> = {
  "reservations": "予約一覧",
  "drivers": "配達者一覧",
  "revenue": "売上管理",
  "pricing-settings": "料金の設定",
};

const VALID_VIEWS: DashboardView[] = [
  "reservations",
  "drivers",
  "revenue",
  "pricing-settings",
];

function isDashboardView(value: unknown): value is DashboardView {
  return (
    typeof value === "string" && VALID_VIEWS.includes(value as DashboardView)
  );
}

function resolveInitialView(): DashboardView {
  try {
    const route = useRoute();
    const view = route.params.view;
    if (view === undefined || view === "") return "reservations";
    const single = Array.isArray(view) ? view[0] : view;
    return isDashboardView(single) ? single : "reservations";
  } catch {
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

  // 現在のURL（route.params.view）に合わせて currentView とタイトルを同期
  const syncFromRoute = () => {
    const route = useRoute();
    const view = route.params.view;
    if (view === undefined || view === "") {
      currentView.value = "reservations";
    } else {
      const single = Array.isArray(view) ? view[0] : view;
      if (isDashboardView(single)) {
        currentView.value = single;
      }
    }
    updateTtl();
  };

  // 選択したビューのURLへ遷移
  const navigate = (view: string) => {
    if (!isDashboardView(view)) return;
    const path =
      view === "reservations"
        ? "/business-owner/dashboard"
        : `/business-owner/dashboard/${view}`;
    navigateTo(path, { replace: true });
  };

  return {
    currentView: readonly(currentView),
    currentTtl: readonly(currentTtl),
    navigate,
    syncFromRoute,
  };
};
