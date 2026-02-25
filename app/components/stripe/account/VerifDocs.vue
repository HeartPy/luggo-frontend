<template>
  <div
    v-if="isVerifSectionRequired"
    class="space-y-6"
  >
    <StripeAccountAtomsFormTtl>本人確認書類</StripeAccountAtomsFormTtl>
    <p class="mb-6 text-sm text-gray-600">
      代表者の本人確認書類として、運転免許証、パスポート、マイナンバーカードなどをアップロードしてください。
    </p>
    <div>
      <div class="mb-3 flex flex-col gap-6">
        <!-- 本人確認書類の表（前面） -->
        <div v-if="isFieldRequired('document_front')">
          <label class="mb-1 block text-sm font-medium">本人確認書類の表（前面）<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            ref="frontInputRef"
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            class="w-full py-2"
            aria-describedby="document_front-error"
            @change="handleFileChange('front', $event)"
          >
          <p
            v-if="formData.document_front"
            class="mt-1 text-sm text-green-600"
          >
            ✓ アップロード済み
          </p>
          <div
            v-if="errors?.document_front || localErrors.document_front"
            id="document_front-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors?.document_front || localErrors.document_front }}
          </div>
        </div>

        <!-- 本人確認書類の裏（背面） -->
        <div v-if="isFieldRequired('document_back')">
          <label class="mb-1 block text-sm font-medium">本人確認書類の裏（背面）<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            ref="backInputRef"
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            class="w-full py-2"
            aria-describedby="document_back-error"
            @change="handleFileChange('back', $event)"
          >
          <p
            v-if="formData.document_back"
            class="mt-1 text-sm text-green-600"
          >
            ✓ アップロード済み
          </p>
          <div
            v-if="errors?.document_back || localErrors.document_back"
            id="document_back-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors?.document_back || localErrors.document_back }}
          </div>
        </div>
      </div>
      <div class="space-y-1">
        <p
          v-for="noteItem in noteItems"
          :key="noteItem.id"
          class="text-xs text-gray-500"
        >
          {{ noteItem.txt }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step5FormData } from "~/types/stripe-account-register";

type Props = {
  formData: Step5FormData;
  errors?: Record<string, string>;
  requiredFields?: string[];
};

const props = defineProps<Props>();

// フィールドが必須かどうかを判定
const isFieldRequired = (fieldName: string): boolean => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.includes(fieldName);
};

const isVerifSectionRequired = computed(() => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.some(field =>
    ["document_front", "document_back"].includes(field),
  );
});

const emit = defineEmits<{
  "update:form-data": [value: Step5FormData];
  "file-upload": [side: "front" | "back", event: Event];
}>();

const frontInputRef = ref<HTMLInputElement | null>(null);
const backInputRef = ref<HTMLInputElement | null>(null);

const localErrors = ref<Record<string, string>>({
  document_front: "",
  document_back: "",
});

const handleFileChange = (side: "front" | "back", event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  const errorKey = side === "front" ? "document_front" : "document_back";
  const inputRef = side === "front" ? frontInputRef.value : backInputRef.value;

  // ファイルタイプの検証
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));

  if (
    !allowedTypes.includes(file.type)
    && !allowedExtensions.includes(fileExtension)
  ) {
    localErrors.value[errorKey]
      = "対応していないファイル形式です。JPEGまたはPNGファイルを選択してください。";
    // inputの値をクリア
    if (inputRef) {
      inputRef.value = "";
    }

    // 既にアップロード済みのファイルIDもクリア（アップロード済み表示を消すため）
    emit("update:form-data", {
      ...props.formData,
      [errorKey]: "",
    });

    return;
  }

  // ファイルサイズの検証
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    localErrors.value[errorKey]
      = "ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。";
    if (inputRef) {
      inputRef.value = "";
    }

    emit("update:form-data", {
      ...props.formData,
      [errorKey]: "",
    });

    return;
  }

  // 空ファイルの検証
  if (file.size === 0) {
    localErrors.value[errorKey]
      = "空のファイルはアップロードできません。有効なファイルを選択してください。";
    if (inputRef) {
      inputRef.value = "";
    }

    emit("update:form-data", {
      ...props.formData,
      [errorKey]: "",
    });

    return;
  }

  // 全ての検証を通過した場合、エラーをクリア
  localErrors.value[errorKey] = "";

  emit("file-upload", side, event);
};

type NoteItem = {
  id: number;
  txt: string;
};

const noteItems = ref<NoteItem[]>([
  {
    id: 1,
    txt: "JPEGまたはPNGファイルを選択してください。",
  },
  {
    id: 2,
    txt: "10MB以下のファイルを選択してください。",
  },
]);
</script>
