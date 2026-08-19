<template>
  <div>
    <div class="relative">
      <canvas
        ref="canvasElement"
        class="h-48 w-full touch-none rounded-md border border-gray-300 bg-white"
        @pointerdown="startStroke"
        @pointermove="moveStroke"
        @pointerup="endStroke"
        @pointercancel="endStroke"
        @pointerleave="endStroke"
      />
      <p
        v-if="isEmpty"
        class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400"
      >
        ここにサインしてください
      </p>
    </div>
    <div class="mt-2 flex justify-end">
      <button
        type="button"
        class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        @click="clear"
      >
        全消し
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 施設側の担当者がタッチペンや指でサインするための手書きキャンバス
const emit = defineEmits<{
  // サインの有無が変わったときに通知（親で配達完了ボタンの押せる／押せないを切り替える）
  "update:isEmpty": [value: boolean];
}>();

const canvasElement = ref<HTMLCanvasElement | null>(null);
const isEmpty = ref(true);

let context: CanvasRenderingContext2D | null = null;
let isDrawing = false;

function setEmpty(value: boolean) {
  if (isEmpty.value === value) return;
  isEmpty.value = value;
  emit("update:isEmpty", value);
}

// 表示サイズ × devicePixelRatio の解像度でキャンバスを初期化
function setupCanvas() {
  const canvas = canvasElement.value;
  if (!canvas) return;

  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);

  context = canvas.getContext("2d");
  if (!context) return;
  context.scale(ratio, ratio);
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#1f2937";
}

// 画面上のポインタ位置を、キャンバス左上からの座標に直す
function pointFromEvent(event: PointerEvent): { x: number; y: number } {
  const rect = canvasElement.value!.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

// ポインタを押した位置から線を開始する
function startStroke(event: PointerEvent) {
  if (!context || !canvasElement.value) return;
  event.preventDefault();
  canvasElement.value.setPointerCapture(event.pointerId);
  isDrawing = true;

  const { x, y } = pointFromEvent(event);
  context.beginPath();
  context.moveTo(x, y);
  // タップのみでも点が残るように極小の線を描く
  context.lineTo(x + 0.1, y + 0.1);
  context.stroke();
  setEmpty(false);
}

// ポインタの移動に合わせて線を伸ばす
function moveStroke(event: PointerEvent) {
  if (!isDrawing || !context) return;
  event.preventDefault();
  const { x, y } = pointFromEvent(event);
  context.lineTo(x, y);
  context.stroke();
}

function endStroke() {
  isDrawing = false;
}

function clear() {
  const canvas = canvasElement.value;
  if (!canvas || !context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  setEmpty(true);
}

// サインをPNGのdata URLとして取得（未記入ならnull）
function toDataUrl(): string | null {
  const canvas = canvasElement.value;
  if (!canvas || isEmpty.value) return null;
  return canvas.toDataURL("image/png");
}

defineExpose({ toDataUrl, clear });

onMounted(() => setupCanvas());
</script>
