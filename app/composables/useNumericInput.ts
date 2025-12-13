export const useNumericInput = () => {
  const normalizeNumericInput = (
    event: Event,
    onUpdate: (value: string) => void,
  ) => {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    // 全角数字を半角数字に変換
    value = value.replace(/[０-９]/g, (char) => {
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    });

    // 数字以外の文字を削除
    value = value.replace(/\D/g, "");

    target.value = value;

    onUpdate(value);
  };

  return {
    normalizeNumericInput,
  };
};
