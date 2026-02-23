export type RegisterFormData = {
  business_type: "company" | "individual";
  company_name: string;
  rep_last_name: string;
  rep_first_name: string;
  rep_last_name_kana: string;
  rep_first_name_kana: string;
  email: string;
  phone: string;
  subdomain: string;
  password: string;
  password_confirm: string;
};
