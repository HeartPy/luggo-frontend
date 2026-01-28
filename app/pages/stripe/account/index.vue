<script setup lang="ts">
import { useSession } from "~/composables/useSession";
import { determineFirstRequiredStep } from "~/composables/useStripeAccount";

definePageMeta({
  layout: "stripe",
  middleware: "business-owner",
});

const { startSession } = useSession();

onMounted(async () => {
  if (import.meta.client) {
    await startSession();

    try {
      // middlewareで認証チェック済みなので、審査結果から最初の必要なステップを取得
      const firstRequiredStep = await determineFirstRequiredStep();

      await navigateTo(`/stripe/account/${firstRequiredStep}`, {
        replace: true,
      });
    } catch {
      await navigateTo("/stripe/account/1", { replace: true });
    }
  }
});
</script>
