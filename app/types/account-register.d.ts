type Address = {
  country: string;
  postal_code: string;
  state: string;
  state_kana: string;
  city: string;
  city_kana: string;
  line1: string;
  line1_kana: string;
  line2?: string;
};

type CompanyAddress = Omit<
  Address,
  "state_kana" | "city" | "city_kana" | "line1_kana"
>;

type AddressKanji = {
  postal_code: string;
  state: string;
  city: string;
  line1: string;
  line2?: string;
};

type AddressKana = {
  postal_code: string;
  state: string;
  city: string;
  line1: string;
};

type DateOfBirth = {
  year: number;
  month: number;
  day: number;
};

export type Step1FormData = {
  accept_tos: boolean;
  product_name: string;
  support_email: string;
  company_name: string;
  company_address: CompanyAddress;
};

export type Step2FormData = {
  first_name_kanji: string;
  last_name_kanji: string;
  first_name_kana: string;
  last_name_kana: string;
  rep_email: string;
  rep_phone: string;
  rep_dob: DateOfBirth;
  address_kanji: AddressKanji;
  address_kana: AddressKana;
};

export type Step3FormData = {
  bank_code: string;
  branch_code: string;
  account_type: string;
  account_number: string;
  account_holder_name: string;
};

export type Step4FormData = {
  product_url: string;
  product_description: string;
  product_mcc: string;
};

export type Step5FormData = {
  document_front: string;
  document_back: string;
  address_kana: string;
};
