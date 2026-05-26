import { useCsrf } from "~/composables/useCsrf";

export type LuggageTypeKey = "cabin" | "checked" | "oversize";

export type PrefecturePricing = Record<LuggageTypeKey, number | null>;

export type PrefectureDef = {
  code: string;
  name: string;
};

export type RegionDef = {
  key: string;
  label: string;
  prefectures: PrefectureDef[];
};

export const LUGGAGE_TYPES: { key: LuggageTypeKey; label: string }[] = [
  { key: "cabin", label: "機内持ち込みサイズ" },
  { key: "checked", label: "受託手荷物サイズ" },
  { key: "oversize", label: "規格外サイズ" },
];

export const REGIONS: RegionDef[] = [
  {
    key: "hokkaido",
    label: "北海道地方",
    prefectures: [{ code: "01", name: "北海道" }],
  },
  {
    key: "tohoku",
    label: "東北地方",
    prefectures: [
      { code: "02", name: "青森" },
      { code: "03", name: "岩手" },
      { code: "04", name: "宮城" },
      { code: "05", name: "秋田" },
      { code: "06", name: "山形" },
      { code: "07", name: "福島" },
    ],
  },
  {
    key: "kanto",
    label: "関東地方",
    prefectures: [
      { code: "08", name: "茨城" },
      { code: "09", name: "栃木" },
      { code: "10", name: "群馬" },
      { code: "11", name: "埼玉" },
      { code: "12", name: "千葉" },
      { code: "13", name: "東京" },
      { code: "14", name: "神奈川" },
    ],
  },
  {
    key: "hokuriku",
    label: "北陸地方",
    prefectures: [
      { code: "15", name: "新潟" },
      { code: "16", name: "富山" },
      { code: "17", name: "石川" },
      { code: "18", name: "福井" },
    ],
  },
  {
    key: "chubu",
    label: "中部地方",
    prefectures: [
      { code: "19", name: "山梨" },
      { code: "20", name: "長野" },
      { code: "21", name: "岐阜" },
      { code: "22", name: "静岡" },
      { code: "23", name: "愛知" },
    ],
  },
  {
    key: "kinki",
    label: "近畿地方",
    prefectures: [
      { code: "24", name: "三重" },
      { code: "25", name: "滋賀" },
      { code: "26", name: "京都" },
      { code: "27", name: "大阪" },
      { code: "28", name: "兵庫" },
      { code: "29", name: "奈良" },
      { code: "30", name: "和歌山" },
    ],
  },
  {
    key: "chugoku",
    label: "中国地方",
    prefectures: [
      { code: "31", name: "鳥取" },
      { code: "32", name: "島根" },
      { code: "33", name: "岡山" },
      { code: "34", name: "広島" },
      { code: "35", name: "山口" },
    ],
  },
  {
    key: "shikoku",
    label: "四国地方",
    prefectures: [
      { code: "36", name: "徳島" },
      { code: "37", name: "香川" },
      { code: "38", name: "愛媛" },
      { code: "39", name: "高知" },
    ],
  },
  {
    key: "kyushu",
    label: "九州地方",
    prefectures: [
      { code: "40", name: "福岡" },
      { code: "41", name: "佐賀" },
      { code: "42", name: "長崎" },
      { code: "43", name: "熊本" },
      { code: "44", name: "大分" },
      { code: "45", name: "宮崎" },
      { code: "46", name: "鹿児島" },
      { code: "47", name: "沖縄" },
    ],
  },
];

export const ALL_PREFECTURES: PrefectureDef[] = REGIONS.flatMap(
  r => r.prefectures,
);

// 全都道府県について、荷物タイプ別の料金をnullで初期化
function buildEmptyPricing(): Record<string, PrefecturePricing> {
  const result: Record<string, PrefecturePricing> = {};
  for (const pref of ALL_PREFECTURES) {
    result[pref.code] = { cabin: null, checked: null, oversize: null };
  }
  return result;
}

// 全都道府県を配達不可(false)で初期化
function buildEmptyPrefFlags(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const pref of ALL_PREFECTURES) {
    result[pref.code] = false;
  }
  return result;
}

// 荷物タイプを全て有効(true)で初期化
function buildDefaultEnabledLuggageTypes(): Record<LuggageTypeKey, boolean> {
  const result = {} as Record<LuggageTypeKey, boolean>;
  for (const lt of LUGGAGE_TYPES) {
    result[lt.key] = true;
  }
  return result;
}

// 現在のフォーム状態を参照共有しない形で複製（スナップショット用）
function cloneState(state: {
  departurePrefectures: string[];
  deliveryEnabled: Record<string, boolean>;
  prefecturePricing: Record<string, PrefecturePricing>;
  enabledLuggageTypes: Record<LuggageTypeKey, boolean>;
}) {
  return {
    departurePrefectures: [...state.departurePrefectures],
    deliveryEnabled: { ...state.deliveryEnabled },
    prefecturePricing: JSON.parse(
      JSON.stringify(state.prefecturePricing),
    ) as Record<string, PrefecturePricing>,
    enabledLuggageTypes: { ...state.enabledLuggageTypes },
  };
}

type PricingDraftLayer = ReturnType<typeof cloneState>;

// API/DB から取得した料金設定の一時保存データ（JSON 形式）を検証し、フォーム用の PricingDraftLayer に正規化
function normalizeDraftLayer(raw: unknown): PricingDraftLayer | null {
  if (!raw || typeof raw !== "object") return null;
  const draftObj = raw as Record<string, unknown>;

  if (!Array.isArray(draftObj.departurePrefectures)) return null;

  if (!draftObj.deliveryEnabled || typeof draftObj.deliveryEnabled !== "object")
    return null;

  if (
    !draftObj.prefecturePricing
    || typeof draftObj.prefecturePricing !== "object"
  )
    return null;

  if (
    !draftObj.enabledLuggageTypes
    || typeof draftObj.enabledLuggageTypes !== "object"
  ) {
    return null;
  }

  // まず全県を配達不可で初期化し、一時保存データに boolean がある県だけ上書き
  const deliveryEnabled = buildEmptyPrefFlags();
  const draftDeliveryEnabled = draftObj.deliveryEnabled as Record<
    string,
    unknown
  >;
  for (const pref of ALL_PREFECTURES) {
    const deliveryFlag = draftDeliveryEnabled[pref.code];
    if (typeof deliveryFlag === "boolean") {
      deliveryEnabled[pref.code] = deliveryFlag;
    }
  }

  // まず全県の各荷物タイプを料金なし（null）で初期化し、一時保存データに数値がある項目だけ上書き
  const prefecturePricing = buildEmptyPricing();
  const draftPrefecturePricing = draftObj.prefecturePricing as Record<
    string,
    unknown
  >;
  for (const pref of ALL_PREFECTURES) {
    const row = draftPrefecturePricing[pref.code];
    if (!row || typeof row !== "object") continue;
    const pricingRow = row as Record<string, unknown>;
    prefecturePricing[pref.code] = {
      cabin: typeof pricingRow.cabin === "number" ? pricingRow.cabin : null,
      checked:
        typeof pricingRow.checked === "number" ? pricingRow.checked : null,
      oversize:
        typeof pricingRow.oversize === "number" ? pricingRow.oversize : null,
    };
  }

  // まず全荷物タイプをデフォルトで有効に初期化し、一時保存データに boolean があるキーだけ上書き
  const enabledLuggageTypes = buildDefaultEnabledLuggageTypes();
  const draftEnabledLuggageTypes = draftObj.enabledLuggageTypes as Record<
    string,
    unknown
  >;
  for (const luggageType of LUGGAGE_TYPES) {
    const luggageEnabled = draftEnabledLuggageTypes[luggageType.key];
    if (typeof luggageEnabled === "boolean") {
      enabledLuggageTypes[luggageType.key] = luggageEnabled;
    }
  }

  return cloneState({
    departurePrefectures: draftObj.departurePrefectures.filter(
      (code): code is string => typeof code === "string",
    ),
    deliveryEnabled,
    prefecturePricing,
    enabledLuggageTypes,
  });
}

export const usePricingSettings = () => {
  const departurePrefectures = useState<string[]>("pricingDeparture", () => []);
  const deliveryEnabled = useState<Record<string, boolean>>(
    "pricingDeliveryEnabled",
    () => buildEmptyPrefFlags(),
  );
  const prefecturePricing = useState<Record<string, PrefecturePricing>>(
    "pricingPrefectures",
    () => buildEmptyPricing(),
  );
  const enabledLuggageTypes = useState<Record<LuggageTypeKey, boolean>>(
    "pricingEnabledLuggageTypes",
    () => buildDefaultEnabledLuggageTypes(),
  );

  const snapshot = ref<ReturnType<typeof cloneState> | null>(null);

  // 一時保存したが本保存はまだの場合 true
  // SPA 内でコンポーネントが再マウントされても状態を失わないよう useState で保持
  const hasDraftSaveSinceLastRealSave = useState(
    "pricingHasDraftSave",
    () => false,
  );

  const isSavingDraft = ref(false);
  const isDiscardingDraft = ref(false);

  // 現在のフォーム状態のコピーをスナップショットに保存
  const takeSnapshot = () => {
    const current = {
      departurePrefectures: [...departurePrefectures.value],
      deliveryEnabled: { ...deliveryEnabled.value },
      prefecturePricing: JSON.parse(
        JSON.stringify(prefecturePricing.value),
      ) as Record<string, PrefecturePricing>,
      enabledLuggageTypes: { ...enabledLuggageTypes.value },
    };
    snapshot.value = current;
  };

  // DB からドラフトを取得してフォームに復元
  const loadDraftFromServer = async (): Promise<boolean> => {
    if (!import.meta.client) return false;
    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      const res = await $fetch<{ draft: Record<string, unknown> | null }>(
        `${apiBase}/api/business/profile/pricing/draft`,
        { method: "GET", credentials: "include" },
      );
      if (!res.draft) return false;

      const layer = normalizeDraftLayer(res.draft);
      if (!layer) return false;

      departurePrefectures.value = [...layer.departurePrefectures];
      deliveryEnabled.value = { ...layer.deliveryEnabled };
      prefecturePricing.value = JSON.parse(
        JSON.stringify(layer.prefecturePricing),
      ) as Record<string, PrefecturePricing>;
      enabledLuggageTypes.value = { ...layer.enabledLuggageTypes };

      takeSnapshot();
      hasDraftSaveSinceLastRealSave.value = true;
      return true;
    }
    catch {
      return false;
    }
  };

  // 現在のフォーム状態を DB にドラフト保存
  const saveDraftToServer = async (): Promise<boolean> => {
    if (!import.meta.client) return false;
    try {
      isSavingDraft.value = true;
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      const { ensureCsrf, getCsrf } = useCsrf();
      await ensureCsrf(apiBase);
      const draft = cloneState({
        departurePrefectures: departurePrefectures.value,
        deliveryEnabled: deliveryEnabled.value,
        prefecturePricing: prefecturePricing.value,
        enabledLuggageTypes: enabledLuggageTypes.value,
      });
      await $fetch(`${apiBase}/api/business/profile/pricing/draft`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
        body: { draft },
      });
      return true;
    }
    catch {
      return false;
    }
    finally {
      isSavingDraft.value = false;
    }
  };

  // スナップショットとの差分検知
  const isDirty = computed(() => {
    if (!snapshot.value) return false;
    return (
      JSON.stringify({
        departurePrefectures: departurePrefectures.value,
        deliveryEnabled: deliveryEnabled.value,
        prefecturePricing: prefecturePricing.value,
        enabledLuggageTypes: enabledLuggageTypes.value,
      })
      !== JSON.stringify({
        departurePrefectures: snapshot.value.departurePrefectures,
        deliveryEnabled: snapshot.value.deliveryEnabled,
        prefecturePricing: snapshot.value.prefecturePricing,
        enabledLuggageTypes: snapshot.value.enabledLuggageTypes,
      })
    );
  });

  // 配達可能として選択された荷物タイプのみ
  const visibleLuggageTypes = computed(() =>
    LUGGAGE_TYPES.filter(
      luggageType => enabledLuggageTypes.value[luggageType.key],
    ),
  );

  const validationErrs = ref<Record<string, string>>({});

  // 配達可の都道府県について、表示中の荷物タイプの料金を検証
  const validate = (): boolean => {
    validationErrs.value = {};
    let isValid = true;

    for (const pref of ALL_PREFECTURES) {
      if (!deliveryEnabled.value[pref.code]) continue;

      const pricing = prefecturePricing.value[pref.code];
      if (!pricing) continue;

      for (const luggageType of visibleLuggageTypes.value) {
        const price = pricing[luggageType.key];
        if (price === null || price === undefined) {
          validationErrs.value[`${pref.code}_${luggageType.key}`]
            = "料金を入力してください";
          isValid = false;
        }
        else if (price < 100) {
          validationErrs.value[`${pref.code}_${luggageType.key}`]
            = "100円以上で設定してください";
          isValid = false;
        }
      }
    }

    return isValid;
  };

  // 配達地域の「配達可」を切り替え
  // OFF にしたら料金と validationErrs をその地域分リセット
  const togglePrefecture = (prefCode: string) => {
    deliveryEnabled.value[prefCode] = !deliveryEnabled.value[prefCode];

    if (!deliveryEnabled.value[prefCode]) {
      prefecturePricing.value[prefCode] = {
        cabin: null,
        checked: null,
        oversize: null,
      };
      for (const luggageType of LUGGAGE_TYPES) {
        const { [`${prefCode}_${luggageType.key}`]: _, ...rest }
          = validationErrs.value;
        validationErrs.value = rest;
      }
    }
  };

  // 荷物タイプの有効・無効を切り替え
  const toggleLuggageType = (key: LuggageTypeKey) => {
    enabledLuggageTypes.value[key] = !enabledLuggageTypes.value[key];

    // チェックを外した荷物タイプの料金を全地域でリセット
    if (!enabledLuggageTypes.value[key]) {
      for (const pref of ALL_PREFECTURES) {
        const pricing = prefecturePricing.value[pref.code];
        if (pricing) pricing[key] = null;
        const { [`${pref.code}_${key}`]: _, ...rest } = validationErrs.value;
        validationErrs.value = rest;
      }
    }

    // 配達可能な荷物が1つもなくなったら、全地域を配達不可
    const hasAnyEnabled = LUGGAGE_TYPES.some(
      luggageType => enabledLuggageTypes.value[luggageType.key],
    );
    if (!hasAnyEnabled) {
      for (const pref of ALL_PREFECTURES) {
        deliveryEnabled.value[pref.code] = false;
      }
    }
  };

  // 配達地域×荷物タイプの料金を更新
  const setPrice = (
    prefCode: string,
    luggageType: LuggageTypeKey,
    value: number | null,
  ) => {
    if (!prefecturePricing.value[prefCode]) {
      prefecturePricing.value[prefCode] = {
        cabin: null,
        checked: null,
        oversize: null,
      };
    }
    prefecturePricing.value[prefCode][luggageType] = value;

    if (value !== null && value >= 100) {
      const { [`${prefCode}_${luggageType}`]: _, ...rest }
        = validationErrs.value;
      validationErrs.value = rest;
    }
  };

  const isSaving = ref(false);
  const saveErr = ref<string | null>(null);

  const save = async (): Promise<boolean> => {
    if (!validate()) return false;

    const pricingRules: Record<string, Record<string, number>> = {};

    for (const pref of ALL_PREFECTURES) {
      if (!deliveryEnabled.value[pref.code]) continue;
      const pricing = prefecturePricing.value[pref.code];
      if (!pricing) continue;

      const prefRules: Record<string, number> = {};
      for (const luggageType of visibleLuggageTypes.value) {
        if (pricing[luggageType.key] !== null) {
          prefRules[luggageType.key] = pricing[luggageType.key]!;
        }
      }
      pricingRules[pref.code] = prefRules;
    }

    try {
      isSaving.value = true;
      saveErr.value = null;

      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      const { ensureCsrf, getCsrf } = useCsrf();
      await ensureCsrf(apiBase);

      await $fetch(`${apiBase}/api/business/profile/pricing`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
        body: {
          service_areas: departurePrefectures.value,
          pricing_rules: pricingRules,
        },
      });

      takeSnapshot();
      hasDraftSaveSinceLastRealSave.value = false;
      return true;
    }
    catch (err: unknown) {
      // 認証切れ（401）の場合はログインページへリダイレクト
      if (
        err
        && typeof err === "object"
        && "status" in err
        && (err as { status: number }).status === 401
      ) {
        saveErr.value
          = "ログインの有効期限が切れました。再ログインしてください。";
        navigateTo("/account/login");
        return false;
      }
      saveErr.value = "料金設定の保存に失敗しました";
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Failed to save pricing settings:", err);
      }
      return false;
    }
    finally {
      isSaving.value = false;
    }
  };

  // 追加編集を破棄して直近のスナップショットの状態に戻す。
  const discard = () => {
    if (snapshot.value) {
      const restored = cloneState(snapshot.value);
      departurePrefectures.value = restored.departurePrefectures;
      deliveryEnabled.value = restored.deliveryEnabled;
      prefecturePricing.value = restored.prefecturePricing;
      enabledLuggageTypes.value = restored.enabledLuggageTypes;
    }
    validationErrs.value = {};
  };

  // 一時保存：フォームを DB に一時保存（本番の料金設定は更新しない）
  const saveDraft = async (): Promise<boolean> => {
    takeSnapshot();
    hasDraftSaveSinceLastRealSave.value = true;
    return await saveDraftToServer();
  };

  // 配達可能な荷物タイプが 1 つ以上選択されているか
  const hasEnabledLuggageType = computed(() =>
    LUGGAGE_TYPES.some(
      luggageType => enabledLuggageTypes.value[luggageType.key],
    ),
  );

  // 集荷地域（出発側の都道府県）が 1 つ以上選択されているか
  const hasDeparturePrefecture = computed(
    () => departurePrefectures.value.length > 0,
  );

  // 配送地域（「配達可」になっている都道府県）が 1 つ以上選択されているか
  const hasDeliveryPrefecture = computed(() =>
    ALL_PREFECTURES.some(pref => deliveryEnabled.value[pref.code]),
  );

  // 配送可の各都道府県について、表示中の荷物タイプの料金がすべて入力済みか
  //   ※ 金額の妥当性（100 円以上か等）は save 時の validate() で別途検証する
  const hasAllRequiredPrices = computed(() => {
    for (const pref of ALL_PREFECTURES) {
      if (!deliveryEnabled.value[pref.code]) continue;
      const pricing = prefecturePricing.value[pref.code];
      if (!pricing) return false;
      for (const luggageType of visibleLuggageTypes.value) {
        const price = pricing[luggageType.key];
        if (price === null || price === undefined) return false;
      }
    }
    return true;
  });

  // 保存ボタンを有効にするか
  //   - 変更あり、または一時保存済みで本保存を行なっていない場合
  //   - かつ、最低限の設定（配達可能な荷物・集荷地域・配送地域・料金）が揃っている場合のみ
  const canSave = computed(
    () =>
      (isDirty.value || hasDraftSaveSinceLastRealSave.value)
      && hasEnabledLuggageType.value
      && hasDeparturePrefecture.value
      && hasDeliveryPrefecture.value
      && hasAllRequiredPrices.value,
  );

  // 事業者プロフィール（集荷エリア・料金ルール）から料金設定フォームの状態を初期化
  // ドラフト（≒一時保存）がない状態の初期表示、および一時保存破棄時に呼ばれる。
  //   - 既存のフォーム状態（メモリ・ドラフトいずれも）に依らず、必ずプロフィール準拠の
  //     状態に揃え直すため、最初に全都道府県・全荷物タイプを空状態へリセットする。
  const initFromProfile = (profile: {
    service_areas?: readonly string[];
    pricing_rules?: Record<string, Record<string, number>>;
  }) => {
    departurePrefectures.value = [];
    deliveryEnabled.value = buildEmptyPrefFlags();
    prefecturePricing.value = buildEmptyPricing();
    enabledLuggageTypes.value = buildDefaultEnabledLuggageTypes();
    validationErrs.value = {};

    if (profile.service_areas) {
      departurePrefectures.value = [...profile.service_areas];
    }

    if (profile.pricing_rules) {
      for (const [code, rules] of Object.entries(profile.pricing_rules)) {
        deliveryEnabled.value[code] = true;
        prefecturePricing.value[code] = {
          cabin: rules.cabin ?? null,
          checked: rules.checked ?? null,
          oversize: rules.oversize ?? null,
        };
      }
      // 各荷物タイプについて、いずれかの地域に料金が入っていればチェックをオンにする
      for (const luggageType of LUGGAGE_TYPES) {
        const hasAny = Object.values(profile.pricing_rules).some(
          prefRules => prefRules[luggageType.key] != null,
        );
        enabledLuggageTypes.value[luggageType.key] = hasAny;
      }
    }

    // 配達可能な荷物が1つもない場合は、全地域を配達不可
    const hasAnyLuggageEnabled = LUGGAGE_TYPES.some(
      luggageType => enabledLuggageTypes.value[luggageType.key],
    );
    if (!hasAnyLuggageEnabled) {
      for (const pref of ALL_PREFECTURES) {
        deliveryEnabled.value[pref.code] = false;
        prefecturePricing.value[pref.code] = {
          cabin: null,
          checked: null,
          oversize: null,
        };
      }
    }

    takeSnapshot();
    hasDraftSaveSinceLastRealSave.value = false;
  };

  // 一時保存（ドラフト）を破棄し、サーバー保存済みの状態（プロフィール反映済み設定）に戻す。
  //   - DB 上のドラフトを DELETE で削除
  //   - その後、渡されたプロフィール内容でフォームを再初期化
  const discardDraft = async (profile: {
    service_areas?: readonly string[];
    pricing_rules?: Record<string, Record<string, number>>;
  }): Promise<boolean> => {
    if (!import.meta.client) return false;
    try {
      isDiscardingDraft.value = true;
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      const { ensureCsrf, getCsrf } = useCsrf();
      await ensureCsrf(apiBase);
      await $fetch(`${apiBase}/api/business/profile/pricing/draft`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
      });
      initFromProfile(profile);
      return true;
    }
    catch {
      return false;
    }
    finally {
      isDiscardingDraft.value = false;
    }
  };

  return {
    departurePrefectures,
    deliveryEnabled,
    prefecturePricing,
    enabledLuggageTypes,
    visibleLuggageTypes,
    validationErrs: readonly(validationErrs),
    isDirty,
    canSave,
    hasDraftSaveSinceLastRealSave: readonly(hasDraftSaveSinceLastRealSave),
    isSaving: readonly(isSaving),
    isSavingDraft: readonly(isSavingDraft),
    isDiscardingDraft: readonly(isDiscardingDraft),
    saveErr: readonly(saveErr),
    togglePrefecture,
    toggleLuggageType,
    setPrice,
    save,
    discard,
    saveDraft,
    discardDraft,
    initFromProfile,
    takeSnapshot,
    loadDraftFromServer,
  };
};
