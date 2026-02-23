// 都道府県コードから都道府県名を取得
const getPrefectureName = (code: string): string => {
  const prefectures: Record<string, string> = {
    "01": "北海道",
    "02": "青森県",
    "03": "岩手県",
    "04": "宮城県",
    "05": "秋田県",
    "06": "山形県",
    "07": "福島県",
    "08": "茨城県",
    "09": "栃木県",
    "10": "群馬県",
    "11": "埼玉県",
    "12": "千葉県",
    "13": "東京都",
    "14": "神奈川県",
    "15": "新潟県",
    "16": "富山県",
    "17": "石川県",
    "18": "福井県",
    "19": "山梨県",
    "20": "長野県",
    "21": "岐阜県",
    "22": "静岡県",
    "23": "愛知県",
    "24": "三重県",
    "25": "滋賀県",
    "26": "京都府",
    "27": "大阪府",
    "28": "兵庫県",
    "29": "奈良県",
    "30": "和歌山県",
    "31": "鳥取県",
    "32": "島根県",
    "33": "岡山県",
    "34": "広島県",
    "35": "山口県",
    "36": "徳島県",
    "37": "香川県",
    "38": "愛媛県",
    "39": "高知県",
    "40": "福岡県",
    "41": "佐賀県",
    "42": "長崎県",
    "43": "熊本県",
    "44": "大分県",
    "45": "宮崎県",
    "46": "鹿児島県",
    "47": "沖縄県",
  };
  return prefectures[code] || "";
};

// 都道府県コードから都道府県名（カナ）を取得
const getPrefectureNameKana = (code: string): string => {
  const prefecturesKana: Record<string, string> = {
    "01": "ホッカイドウ",
    "02": "アオモリケン",
    "03": "イワテケン",
    "04": "ミヤギケン",
    "05": "アキタケン",
    "06": "ヤマガタケン",
    "07": "フクシマケン",
    "08": "イバラキケン",
    "09": "トチギケン",
    "10": "グンマケン",
    "11": "サイタマケン",
    "12": "チバケン",
    "13": "トウキョウト",
    "14": "カナガワケン",
    "15": "ニイガタケン",
    "16": "トヤマケン",
    "17": "イシカワケン",
    "18": "フクイケン",
    "19": "ヤマナシケン",
    "20": "ナガノケン",
    "21": "ギフケン",
    "22": "シズオカケン",
    "23": "アイチケン",
    "24": "ミエケン",
    "25": "シガケン",
    "26": "キョウトフ",
    "27": "オオサカフ",
    "28": "ヒョウゴケン",
    "29": "ナラケン",
    "30": "ワカヤマケン",
    "31": "トットリケン",
    "32": "シマネケン",
    "33": "オカヤマケン",
    "34": "ヒロシマケン",
    "35": "ヤマグチケン",
    "36": "トクシマケン",
    "37": "カガワケン",
    "38": "エヒメケン",
    "39": "コウチケン",
    "40": "フクオカケン",
    "41": "サガケン",
    "42": "ナガサキケン",
    "43": "クマモトケン",
    "44": "オオイタケン",
    "45": "ミヤザキケン",
    "46": "カゴシマケン",
    "47": "オキナワケン",
  };
  return prefecturesKana[code] || "";
};

// 半角カナを全角カナに変換
const convertHalfWidthKanaToFullWidth = (text: string): string => {
  if (!text) return text;

  // 半角カナから全角カナへの変換マッピング
  const halfToFullMap: Record<string, string> = {
    ｱ: "ア",
    ｲ: "イ",
    ｳ: "ウ",
    ｴ: "エ",
    ｵ: "オ",
    ｶ: "カ",
    ｷ: "キ",
    ｸ: "ク",
    ｹ: "ケ",
    ｺ: "コ",
    ｻ: "サ",
    ｼ: "シ",
    ｽ: "ス",
    ｾ: "セ",
    ｿ: "ソ",
    ﾀ: "タ",
    ﾁ: "チ",
    ﾂ: "ツ",
    ﾃ: "テ",
    ﾄ: "ト",
    ﾅ: "ナ",
    ﾆ: "ニ",
    ﾇ: "ヌ",
    ﾈ: "ネ",
    ﾉ: "ノ",
    ﾊ: "ハ",
    ﾋ: "ヒ",
    ﾌ: "フ",
    ﾍ: "ヘ",
    ﾎ: "ホ",
    ﾏ: "マ",
    ﾐ: "ミ",
    ﾑ: "ム",
    ﾒ: "メ",
    ﾓ: "モ",
    ﾔ: "ヤ",
    ﾕ: "ユ",
    ﾖ: "ヨ",
    ﾗ: "ラ",
    ﾘ: "リ",
    ﾙ: "ル",
    ﾚ: "レ",
    ﾛ: "ロ",
    ﾜ: "ワ",
    ﾝ: "ン",
    ｦ: "ヲ",
    ｧ: "ァ",
    ｨ: "ィ",
    ｩ: "ゥ",
    ｪ: "ェ",
    ｫ: "ォ",
    ｬ: "ャ",
    ｭ: "ュ",
    ｮ: "ョ",
    ｯ: "ッ",
    ｰ: "ー",
    ｶﾞ: "ガ",
    ｷﾞ: "ギ",
    ｸﾞ: "グ",
    ｹﾞ: "ゲ",
    ｺﾞ: "ゴ",
    ｻﾞ: "ザ",
    ｼﾞ: "ジ",
    ｽﾞ: "ズ",
    ｾﾞ: "ゼ",
    ｿﾞ: "ゾ",
    ﾀﾞ: "ダ",
    ﾁﾞ: "ヂ",
    ﾂﾞ: "ヅ",
    ﾃﾞ: "デ",
    ﾄﾞ: "ド",
    ﾊﾞ: "バ",
    ﾋﾞ: "ビ",
    ﾌﾞ: "ブ",
    ﾍﾞ: "ベ",
    ﾎﾞ: "ボ",
    ﾊﾟ: "パ",
    ﾋﾟ: "ピ",
    ﾌﾟ: "プ",
    ﾍﾟ: "ペ",
    ﾎﾟ: "ポ",
  };

  let result = "";
  let i = 0;
  while (i < text.length) {
    const char = text.charAt(i);
    const nextChar = text.charAt(i + 1);

    // 濁点・半濁点の組み合わせをチェック（例: ｶﾞ, ﾊﾟ）
    if (
      nextChar &&
      (nextChar === "ﾞ" || nextChar === "ﾟ") &&
      halfToFullMap[char + nextChar]
    ) {
      result += halfToFullMap[char + nextChar];
      i += 2;
    } else if (char && halfToFullMap[char]) {
      result += halfToFullMap[char];
      i += 1;
    } else {
      result += char;
      i += 1;
    }
  }
  return result;
};

type ResponseType = {
  message: string | null;
  status: number;
  results?: Array<{
    prefcode?: string;
    address1?: string;
    address2?: string;
    address3?: string;
    kana1?: string;
    kana2?: string;
    kana3?: string;
    zipcode?: string;
  }>;
};

type AddressSearchResult = {
  postal_code: string;
  state: string;
  state_kana?: string;
  city: string;
  city_kana?: string;
  town: string;
  town_kana?: string;
};

export const usePostalCodeSearch = () => {
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const searchAddress = async (
    postalCode: string,
    includeKana = false,
  ): Promise<AddressSearchResult | null> => {
    try {
      const response = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`,
      );

      const data = (await response.json()) as ResponseType;

      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0];
        if (!result) {
          return null;
        }
        // address1: 都道府県, address2: 市区町村, address3: 町域（町名・丁目）
        // kana1: 都道府県カナ, kana2: 市区町村カナ, kana3: 町域カナ
        const prefecture = result.prefcode
          ? getPrefectureName(result.prefcode)
          : result.address1 || "";
        const city = result.address2 || "";
        const town = result.address3 || "";

        const searchResult: AddressSearchResult = {
          postal_code: postalCode,
          state: prefecture,
          city: city,
          town: town,
        };

        if (includeKana) {
          const prefectureKana = result.prefcode
            ? getPrefectureNameKana(result.prefcode)
            : convertHalfWidthKanaToFullWidth(result.kana1 || "");
          const cityKana = convertHalfWidthKanaToFullWidth(result.kana2 || "");
          const townKana = convertHalfWidthKanaToFullWidth(result.kana3 || "");

          searchResult.state_kana = prefectureKana;
          searchResult.city_kana = cityKana;
          searchResult.town_kana = townKana;
        }

        return searchResult;
      }
      return null;
    } catch (error: unknown) {
      // エラーは静かに処理（ユーザーには表示しない）
      if (error instanceof Error) {
        // 開発時のみエラーをログ出力
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("郵便番号検索エラー:", error);
        }
      }
      return null;
    }
  };

  const handlePostalCode = (
    event: Event,
    options: {
      onPostalCodeUpdate: (postalCode: string) => void;
      onSearch: (postalCode: string) => void | Promise<void>;
      debounceMs?: number;
    },
  ) => {
    const target = event.target as HTMLInputElement;
    const value = target.value.replace(/[^0-9]/g, ""); // 数字のみ抽出

    // 郵便番号を更新
    options.onPostalCodeUpdate(value);

    // デバウンス処理: 入力が止まってから指定時間後に検索
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const debounceMs = options.debounceMs ?? 500;

    // 7桁の数字が入力されたら住所検索
    if (value.length === 7) {
      searchTimeout = setTimeout(async () => {
        await options.onSearch(value);
      }, debounceMs);
    }
  };

  return {
    searchAddress,
    handlePostalCode,
  };
};
