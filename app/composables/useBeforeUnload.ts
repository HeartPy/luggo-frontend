export const useBeforeUnload = (
  isSubmitting: Ref<boolean>,
  isSubmitted: Ref<boolean>,
  shouldWarn?: ComputedRef<boolean>,
) => {
  const shouldWarnRef = shouldWarn ?? computed(() => true);

  // ページを離れる前に警告を表示
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isSubmitted.value) return;

    if (shouldWarnRef.value && !isSubmitting.value) {
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
