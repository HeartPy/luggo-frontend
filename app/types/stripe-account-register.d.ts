type CompanyAddressKanji = {
  country: string;
  postal_code: string;
  state: string;
  city: string;
  town?: string;
  line1: string;
  line2?: string;
};

type CompanyAddressKana = {
  country: string;
  postal_code: string;
  state: string;
  city: string;
  town?: string;
  line1: string;
};

type AddressKanji = {
  postal_code: string;
  state: string;
  city: string;
  town?: string;
  line1: string;
  line2?: string;
};

type AddressKana = {
  postal_code: string;
  state: string;
  city: string;
  town?: string;
  line1: string;
};

type DateOfBirth = {
  year: number;
  month: number;
  day: number;
};

export type DirectorInfo = {
  title: string;
  first_name_kanji: string;
  last_name_kanji: string;
  first_name_kana: string;
  last_name_kana: string;
  email: string;
  phone: string;
  dob: DateOfBirth;
  address_kanji: AddressKanji;
  address_kana: AddressKana;
};

export type Step1FormData = {
  accept_tos: boolean;
  support_email: string;
  company_name: string;
  company_name_kana: string;
  company_name_romaji: string;
  statement_descriptor: string;
  statement_descriptor_kana: string;
  statement_descriptor_romaji: string;
  tax_id: string;
  company_address_kanji: CompanyAddressKanji;
  company_address_kana: CompanyAddressKana;
};

export type Step2FormData = {
  first_name_kanji: string;
  last_name_kanji: string;
  first_name_kana: string;
  last_name_kana: string;
  rep_title: string;
  rep_email: string;
  rep_phone: string;
  rep_dob: DateOfBirth;
  address_kanji: AddressKanji;
  address_kana: AddressKana;
  directors: DirectorInfo[];
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
};
