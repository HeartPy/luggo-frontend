export const useBeforeUnload = (
  shouldWarn: ComputedRef<boolean>,
  isSubmitting: Ref<boolean>,
  isSubmitted: Ref<boolean>,
) => {
  // ページを離れる前に警告を表示
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isSubmitted.value) return;

    if (shouldWarn.value && !isSubmitting.value) {
      event.preventDefault();
      // Chrome では returnValue を設定する必要がある
      event.returnValue = "";
      return "";
    }
  };

  if (import.meta.client) {
    window.addEventListener("beforeunload", handleBeforeUnload);

    onUnmounted(() => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });
  }
};
