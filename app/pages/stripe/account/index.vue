<script setup lang="ts">
import { useSession } from "~/composables/useSession";
import { determineFirstRequiredStep } from "~/composables/useStripeAccount";

definePageMeta({
  layout: "stripe",
  middleware: ["business-owner", "stripe-prerequisite"],
});

useAppSeo({
  title: "アカウント登録申請",
  description: "アカウント登録申請ページ。",
});

const { startSession } = useSession();

onMounted(async () => {
  if (import.meta.client) {
    await startSession();

    try {
      // middlewareで認証チェック済みなので、不足要件から最初の必要なステップを取得
      const firstRequiredStep = await determineFirstRequiredStep();

      await navigateTo(`/stripe/account/${firstRequiredStep}`, {
        replace: true,
      });
    }
    catch {
      await navigateTo("/stripe/account/1", { replace: true });
    }
  }
});
</script>
