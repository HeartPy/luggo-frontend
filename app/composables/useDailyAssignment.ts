/**
 * 事業者ダッシュボード向けの「日次自動割当」composable
 *
 * 指定日の集荷・配達タスクを配達者へ自動割り当てする一連の操作を担う。
 * - 事前見積もり（件数・候補配達者など）の取得
 * - 自動割当の開始と計算中ランの進捗ポーリング
 * - 指定日の最新割当結果の取得
 * - 計算結果（ドラフト）の実予約への適用
 */

import type { AssignmentRun, RoutingEstimate } from "~/types/routing";
import { useCsrf } from "~/composables/useCsrf";

// API の reason コードを画面表示用の日本語に変換
function unassignedReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    missing_coordinates:
      "地点の位置情報（緯度・経度）が未設定のため割り当てできません。",
    fixed_driver_unavailable_or_missing_location:
      "手動割当済みの配達者が利用不可、または出発地点が未設定です。",
    fixed_driver_not_selected:
      "手動割当済みの配達者が今回の候補に選択されていません。",
    same_day_conflicting_fixed_assignments:
      "同日の集荷・配達に異なる担当者が固定されています。",
    no_eligible_drivers: "利用可能な配達者がいません。",
    assignment_capacity_exceeded:
      "配達者の最大訪問数または最大荷物個数を超えるため割り当てできません。",
    assignment_infeasible: "指定された条件では担当者を決定できません。",
  };

  return labels[reason] ?? "割り当てできませんでした。";
}

// 成功時の共通のレスポンス形式
type RunEnvelope = {
  run: AssignmentRun | null;
};

// 未割当 reason を画面表示用に変換した AssignmentRun を返す
function toUiRun(source: AssignmentRun): AssignmentRun {
  return {
    ...source,
    unassigned_tasks: source.unassigned_tasks.map(task => ({
      ...task,
      reason: unassignedReasonLabel(task.reason),
    })),
  };
}

export function useDailyAssignment() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBaseUrl;
  const { ensureCsrf, getCsrf } = useCsrf();

  const run = ref<AssignmentRun | null>(null);
  const isStarting = ref(false);
  const isApplying = ref(false);
  const isCancelling = ref(false);
  const error = ref<string | null>(null);
  const estimate = ref<RoutingEstimate | null>(null);
  const isEstimating = ref(false);

  // 計算中ランの進捗ポーリング用タイマー
  let pollTimer: ReturnType<typeof setTimeout> | null = null;

  function stopPolling() {
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = null;
  }

  // 単一ランの最新状態を取得して run に反映
  async function fetchRun(runId: string): Promise<AssignmentRun> {
    const response = await $fetch<RunEnvelope>(
      `${apiBase}/api/business/routing/runs/${runId}`,
      { credentials: "include" },
    );

    if (!response.run) throw new Error("割当結果がありません");

    const next = toUiRun(response.run);
    run.value = next;

    return next;
  }

  // queued / running のあいだ 2 秒間隔で再取得
  async function pollRun(runId: string) {
    stopPolling();

    try {
      const next = await fetchRun(runId);

      if (next.status === "queued" || next.status === "running") {
        pollTimer = setTimeout(() => void pollRun(runId), 2000);
      }
    }
    catch {
      error.value = "自動割当の進捗を取得できませんでした。";
    }
  }

  // 割当実行前の件数・候補などの事前確認情報を取得
  async function fetchEstimate(
    serviceDate: string,
    selectedDriverIds?: string[],
  ): Promise<void> {
    isEstimating.value = true;

    try {
      estimate.value = await $fetch<RoutingEstimate>(
        `${apiBase}/api/business/routing/estimate`,
        {
          credentials: "include",
          query: {
            date: serviceDate,
            ...(selectedDriverIds === undefined
              ? {}
              : { selected_driver_ids: selectedDriverIds.join(",") }),
          },
        },
      );
    }
    catch {
      estimate.value = null;
      error.value = "自動割当の事前確認情報を取得できませんでした。";
    }
    finally {
      isEstimating.value = false;
    }
  }

  // 自動割当を開始し、完了までポーリングする
  async function assign(
    serviceDate: string,
    selectedDriverIds?: string[],
  ): Promise<boolean> {
    isStarting.value = true;
    error.value = null;
    stopPolling();

    try {
      await ensureCsrf(apiBase);

      const response = await $fetch<RunEnvelope>(
        `${apiBase}/api/business/routing/assign`,
        {
          method: "POST",
          credentials: "include",
          headers: getCsrf() ? { "X-CSRFToken": getCsrf()! } : undefined,
          body: {
            date: serviceDate,
            selected_driver_ids: selectedDriverIds,
          },
        },
      );

      if (!response.run?.id) throw new Error("割当結果のIDがありません");

      const next = toUiRun(response.run);
      run.value = next;
      await pollRun(next.id);

      return true;
    }
    catch (err: unknown) {
      const data
        = err && typeof err === "object" && "data" in err
          ? (err as {
              data?: { errMsg?: string; run_id?: string };
            }).data
          : undefined;

      // 既存ランが進行中の場合はエラーではなくその進捗を追う
      if (data?.run_id) {
        await pollRun(data.run_id);
        return true;
      }

      error.value = data?.errMsg ?? "自動割当を開始できませんでした。";

      return false;
    }
    finally {
      isStarting.value = false;
    }
  }

  // 実行中（queued / running）の自動割当をキャンセル
  async function cancelRun(): Promise<boolean> {
    const current = run.value;
    if (
      !current
      || (current.status !== "queued" && current.status !== "running")
    ) {
      return false;
    }

    isCancelling.value = true;
    error.value = null;
    stopPolling();

    try {
      await ensureCsrf(apiBase);

      const response = await $fetch<RunEnvelope>(
        `${apiBase}/api/business/routing/runs/${current.id}/cancel`,
        {
          method: "POST",
          credentials: "include",
          headers: getCsrf() ? { "X-CSRFToken": getCsrf()! } : undefined,
        },
      );

      if (response.run) run.value = toUiRun(response.run);

      return true;
    }
    catch {
      error.value = "自動割当をキャンセルできませんでした。";
      // キャンセルに失敗した場合は進捗の追跡を再開
      void pollRun(current.id);

      return false;
    }
    finally {
      isCancelling.value = false;
    }
  }

  // 指定日の最新ラン（または未実行）を取得
  async function fetchDaily(serviceDate: string): Promise<void> {
    error.value = null;

    try {
      const response = await $fetch<RunEnvelope>(
        `${apiBase}/api/business/routing/daily`,
        {
          credentials: "include",
          query: { date: serviceDate },
        },
      );

      run.value = response.run ? toUiRun(response.run) : null;
    }
    catch {
      run.value = null;
      error.value = "日次割当を取得できませんでした。";
    }
  }

  // 計算結果（ドラフト）を実予約へ適用
  async function applyRun(): Promise<boolean> {
    if (!run.value) return false;

    isApplying.value = true;
    error.value = null;

    try {
      await ensureCsrf(apiBase);

      const response = await $fetch<RunEnvelope>(
        `${apiBase}/api/business/routing/runs/${run.value.id}/apply`,
        {
          method: "POST",
          credentials: "include",
          headers: getCsrf() ? { "X-CSRFToken": getCsrf()! } : undefined,
        },
      );

      if (!response.run) throw new Error("割当結果がありません");

      run.value = toUiRun(response.run);

      return true;
    }
    catch (err: unknown) {
      const data
        = err && typeof err === "object" && "data" in err
          ? (err as {
              data?: { errMsg?: string; stale?: boolean };
            }).data
          : undefined;

      // 予約側が更新済みで結果が古い場合は stale 表示に切り替える
      if (data?.stale && run.value) {
        run.value = {
          ...run.value,
          status: "stale",
          is_stale: true,
        };
      }

      error.value = data?.errMsg ?? "自動割当結果を適用できませんでした。";

      return false;
    }
    finally {
      isApplying.value = false;
    }
  }

  // 画面離脱時にポーリングを止める
  onBeforeUnmount(stopPolling);

  return {
    run: readonly(run),
    isStarting: readonly(isStarting),
    isApplying: readonly(isApplying),
    isCancelling: readonly(isCancelling),
    estimate: readonly(estimate),
    isEstimating: readonly(isEstimating),
    error: readonly(error),
    assign,
    cancelRun,
    fetchDaily,
    fetchEstimate,
    fetchRun,
    applyRun,
  };
}
