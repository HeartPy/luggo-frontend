// 自動割当の進行状態
export type AssignmentRunStatus
  = | "queued"
    | "running"
    | "draft"
    | "failed"
    | "stale"
    | "applied"
    | "cancelled";

// 配達者ルート上の1訪問先（地図・ルート詳細用）
export type RouteStop = {
  id: string;
  sequence: number;
  booking_id: string;
  booking_number: string;
  task_type: "pickup" | "delivery";
  location_name: string;
  location_address: string;
  latitude: number;
  longitude: number;
  planned_arrival_at: string | null;
  travel_seconds_from_previous: number;
  distance_meters_from_previous: number;
};

// ある配達者の1日分の最適化済みルート
export type DriverDailyRoute = {
  id: string;
  driver_id: string;
  driver_name: string;
  departure_latitude: number;
  departure_longitude: number;
  total_duration_seconds: number;
  total_distance_meters: number;
  stop_count: number;
  stops: RouteStop[];
};

// 自動割当結果に含まれる1タスク（集荷 or 配達）
export type DailyTaskAssignment = {
  id: string;
  booking_number: string;
  task_type: "pickup" | "delivery";
  location_name: string;
  location_address: string;
  manually_assigned: boolean;
};

// 配達者ごとの割当タスク一覧
export type DriverAssignmentGroup = {
  driver_id: string;
  driver_name: string;
  task_count: number;
  tasks: DailyTaskAssignment[];
};

// 自動割当できなかったタスクとその理由
export type UnassignedRouteTask = {
  booking_id: string;
  booking_number: string;
  task_type: "pickup" | "delivery";
  reason: string;
};

// 1回の自動割当実行（ドラフト〜適用までの単位）
export type AssignmentRun = {
  id: string;
  service_date: string;
  status: AssignmentRunStatus;
  is_stale: boolean;
  progress?: number;
  selected_driver_ids: string[];
  assignment_count: number;
  assignment_groups: DriverAssignmentGroup[];
  unassigned_tasks: UnassignedRouteTask[];
};

// 自動割当の候補になる配達者
export type RoutingEligibleDriver = {
  id: string;
  name: string;
  departure_address: string;
};

// 自動割当実行前の事前確認情報（件数・キャパなど）
export type RoutingEstimate = {
  service_date: string;
  eligible_driver_count: number;
  booking_count: number;
  task_count: number;
  driver_count: number;
  stop_capacity: number;
  capacity_sufficient: boolean;
  within_limit: boolean;
  eligible_drivers: RoutingEligibleDriver[];
  excluded: Array<Record<string, unknown>>;
};
