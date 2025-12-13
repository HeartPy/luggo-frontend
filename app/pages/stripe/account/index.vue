<script setup lang="ts">
import { useSession } from "~/composables/useSession";
import {
  ensureAccount,
  determineFirstRequiredStep,
} from "~/composables/useStripeAccount";

const { startSession } = useSession();

onMounted(async () => {
  if (import.meta.client) {
    await startSession();

    try {
      await ensureAccount();

      // 審査結果から最初の必要なステップを取得
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
