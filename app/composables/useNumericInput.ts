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

    // 先頭の+をチェック（電話番号の国際形式用）
    const hasLeadingPlus = value.startsWith("+");

    // 数字以外の文字を削除
    value = value.replace(/\D/g, "");

    // 元々先頭に+があった場合のみ、先頭に+を追加
    if (hasLeadingPlus) {
      value = "+" + value;
    }

    target.value = value;

    onUpdate(value);
  };

  return {
    normalizeNumericInput,
  };
};
