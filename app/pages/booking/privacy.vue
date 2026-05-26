<template>
  <div class="min-h-screen">
    <div class="bg-white px-4 py-20">
      <div class="mx-auto max-w-4xl">
        <main
          aria-label="プライバシーポリシー"
          :aria-busy="isLoading"
        >
          <div
            v-if="isLoading"
            role="status"
            aria-live="polite"
            aria-busy="true"
            class="py-8"
          >
            <CommonAtomsLoadingAnimation size="md" aria-hidden="true" />
            <p class="sr-only">
              プライバシーポリシーを読み込んでいます
            </p>
          </div>

          <div
            v-else-if="fetchErr"
            role="alert"
            aria-live="assertive"
            class="py-8 text-center text-red-600"
          >
            {{ fetchErr }}
          </div>

          <article
            v-else
            aria-labelledby="privacy-policy-title"
            aria-describedby="privacy-policy-intro"
          >
            <h1
              id="privacy-policy-title"
              class="relative mb-8 text-2xl font-bold tracking-wide after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:bg-gray-600 after:content-['']"
            >
              プライバシーポリシー
            </h1>
            <p
              id="privacy-policy-intro"
              class="mb-5 text-sm"
            >
              {{
                companyName
              }}（以下、「当事業者」といいます。）は、本ウェブサイト上で提供する手荷物配送サービス（以下、「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
            </p>
            <ul
              class="grid gap-6"
              role="list"
              aria-label="ポリシー条文一覧"
            >
              <li
                v-for="item in privacyPolicyItems"
                :key="item.id"
                role="listitem"
              >
                <section :aria-labelledby="`privacy-policy-item-${item.id}-title`">
                  <h2
                    :id="`privacy-policy-item-${item.id}-title`"
                    class="mb-1 text-sm font-bold"
                  >
                    {{ item.ttl }}
                  </h2>
                  <div
                    class="text-sm"
                    v-html="item.txt"
                  />
                </section>
              </li>
            </ul>
          </article>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "customer",
  middleware: "subdomain",
});

type PrivacyPolicyItem = {
  id: number;
  ttl: string;
  txt: string;
};

const isLoading = ref(true);
const fetchErr = ref("");
const companyName = ref("");
const supportEmail = ref("");

const privacyPolicyItems = computed<PrivacyPolicyItem[]>(() => {
  const email = supportEmail.value || "―";

  return [
    {
      id: 1,
      ttl: "第1条（プライバシー情報の定義）",
      txt: `プライバシー情報とは、個人情報、履歴情報および特性情報をいいます。<br /><br />プライバシー情報のうち「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、連絡先その他の記述等により特定の個人を識別できる情報を指します。<br /><br />プライバシー情報のうち「履歴情報および特性情報」とは、上記に定める「個人情報」以外のものを指し、ご利用いただいたサービスやご覧になったページ、広告の履歴、ユーザーが検索された検索キーワード、ご利用日時、ご利用方法、ご利用環境、ユーザーのIPアドレス、Cookie、端末の個体識別情報等、ユーザーがサービスを利用する際の履歴に関する情報や、ユーザーの有する特性に関する情報を指します。`,
    },
    {
      id: 2,
      ttl: "第2条（収集する個人情報の項目および収集方法）",
      txt: `本サービスでは、予約の受付・配送の手配・決済処理のために、ユーザーが予約をする際に以下の個人情報を収集します。<br /><br /><strong class="font-semibold">（1）ユーザーが直接入力する情報</strong><br />・氏名<br />・メールアドレス<br />・電話番号<br />・国籍<br />・同行者の氏名<br />・集荷先および配達先の施設名・郵便番号・住所<br />・集荷日・配達日<br />・備考（ユーザーが任意で入力した場合）<br /><br /><strong class="font-semibold">（2）決済に関する情報</strong><br />クレジットカード番号、有効期限、セキュリティコード等の決済情報は、決済代行サービスであるStripe Inc.が直接取得・処理します。これらの情報は当事業者のサーバーには保存されません。Stripe Inc.はPCI DSS（Payment Card Industry Data Security Standard）に準拠した環境で決済情報を管理しています。<br /><br /><strong class="font-semibold">（3）自動的に収集される情報</strong><br />本サービスは、利便性の向上のため、ユーザーのご利用したサービスやソフトウェア、閲覧したページ、ご利用日時、ご利用方法、ご利用環境（携帯端末を通じてご利用の場合の当該端末の通信状態、利用に際しての各種設定情報等も含みます）、IPアドレス、Cookie、ローカルストレージ等の履歴情報および特性情報を、ユーザーが本サービスを利用し、またはページを閲覧する際に収集します。`,
    },
    {
      id: 3,
      ttl: "第3条（個人情報を収集・利用する目的）",
      txt: `当事業者が個人情報を収集・利用する目的は以下のとおりです。<br /><br />1. 本サービスの提供・運営のため<br />2. ユーザーからの予約受付および配送手配のため<br />3. 決済処理の実行および返金対応のため<br />4. ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）<br />5. ユーザーにお知らせや連絡をするため（配送状況の通知を含む）<br />6. 本サービスの不正利用の防止および不正利用発生時の対応のため<br />7. 本サービスのサービス向上のための調査、分析をするため<br />8. 上記の利用目的に付随する目的`,
    },
    {
      id: 4,
      ttl: "第4条（利用目的の変更）",
      txt: `当事業者は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。<br />利用目的の変更を行った場合には、変更後の目的について、当事業者所定の方法により、ユーザーに通知、または本ウェブサイト上に公表するものとします。`,
    },
    {
      id: 5,
      ttl: "第5条（個人情報の適正な取得）",
      txt: `当事業者は、適正に個人情報を取得し、偽りその他不正の手段により取得しません。`,
    },
    {
      id: 6,
      ttl: "第6条（個人情報の安全管理）",
      txt: `当事業者は、個人情報の紛失、破壊、改ざん及び漏洩等のリスクに対して、適切な個人情報の安全管理を行います。また、当事業者は、個人情報の取扱いの全部又は一部を委託する場合は、委託先において個人情報の安全管理が図られるよう、必要かつ適切な監督を行います。`,
    },
    {
      id: 7,
      ttl: "第7条（個人情報の第三者提供および委託）",
      txt: `当事業者は、次に掲げる場合を除いて、予めユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。<br /><br />1. 法令に基づく場合<br />2. 人の生命、身体又は財産の保護のために必要がある場合であって、ユーザーの同意を得ることが困難であるとき<br />3. 公衆衛生の向上又は児童の健全な育成の推進のために特に必要がある場合であって、ユーザーの同意を得ることが困難であるとき<br />4. 国の機関もしくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、ユーザーの同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき<br /><br />前項の定めにかかわらず、次に掲げる場合は当該情報の提供先は第三者に該当しないものとします。<br /><br />5. 当事業者が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合<br />6. 合併その他の事由による事業の承継に伴って個人情報が提供される場合<br />7. 個人情報保護法の定めに基づき共同利用する場合<br /><br /><strong class="font-semibold">（決済処理の委託）</strong><br />本サービスでは、決済処理をStripe Inc.（所在地：米国）に委託しています。クレジットカード情報、Apple Pay、Google Pay等のモバイル決済情報は、Stripe Inc.がPCI DSSに準拠した環境で直接取得・処理し、当事業者のサーバーには保存されません。Stripe Inc.における個人情報の取り扱いについては<a class='text-[#0f83fd]' href='https://stripe.com/jp/privacy' target='_blank' rel='nofollow noopener noreferrer'>Stripe Inc.のプライバシーポリシー</a>が適用されます。<br /><br /><strong class="font-semibold">（プラットフォーム運営者への委託）</strong><br />本サービスは、LugGo（プラットフォーム運営者）が提供するシステムを利用して運営されています。予約情報、配送情報等の個人情報は、サービスの運営に必要な範囲でプラットフォーム運営者のサーバーに保存されます。これは個人情報保護法における取扱いの委託に該当し、当事業者はプラットフォーム運営者に対し適切な監督を行います。`,
    },
    {
      id: 8,
      ttl: "第8条（外国にある第三者への提供）",
      txt: `本サービスでは、決済処理のためにStripe Inc.（所在地：米国）に個人情報の取扱いを委託しています。米国における個人情報の保護に関する制度については、個人情報保護委員会が公表する情報をご参照ください。<br /><br />Stripe Inc.は、EU-US Data Privacy Framework等の国際的な個人情報保護の枠組みに参加し、適切な保護措置を講じています。`,
    },
    {
      id: 9,
      ttl: "第9条（個人情報の保存期間）",
      txt: `当事業者は、利用目的の達成に必要な期間に限り個人情報を保存します。具体的な保存期間は以下のとおりです。<br /><br />・予約に関する情報（氏名、連絡先、配送先等）：サービス提供完了後、法令に基づく保存義務期間（最長7年間）<br />・決済に関する記録：法令に基づく保存義務期間<br />・お問い合わせに関する情報：対応完了後1年間<br />・Cookie等の履歴情報：取得から最長1年間<br /><br />上記の保存期間を経過した個人情報は、速やかに消去または匿名化いたします。`,
    },
    {
      id: 10,
      ttl: "第10条（Cookieおよび類似技術の利用）",
      txt: `本サービスでは、ユーザーの利便性向上およびサービスの改善のために、Cookie、ローカルストレージ等の技術を使用しています。<br /><br />ユーザーは、ブラウザの設定によりCookieの受け入れを拒否することができます。ただし、Cookieを無効にした場合、本サービスの一部の機能がご利用いただけなくなる場合があります。<br /><br />Cookieの設定方法は、ご利用のブラウザのヘルプ機能をご参照ください。`,
    },
    {
      id: 11,
      ttl: "第11条（個人情報の開示）",
      txt: `当事業者は、ユーザー本人から個人情報の開示を求められたときは、ユーザー本人に対し遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合にはその旨を遅滞なく通知します。<br /><br />1. ユーザー本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合<br />2. 当事業者の業務の適正な実施に著しい支障を及ぼすおそれがある場合<br />3. その他法令に違反することとなる場合<br /><br />前項の定めにかかわらず、履歴情報および特性情報等、個人情報以外の情報については原則として開示いたしません。`,
    },
    {
      id: 12,
      ttl: "第12条（個人情報の訂正および削除）",
      txt: `ユーザーは、当事業者の保有する自己の個人情報が誤った情報である場合には、個人情報の訂正、追加または削除（以下「訂正等」といいます）を請求することができます。<br />当事業者は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。<br />当事業者は、前項の規定に基づき訂正等を行った場合、または個人情報保護法その他の法令により訂正等を行わない旨の決定をしたときは遅滞なく、これをユーザーに通知します。`,
    },
    {
      id: 13,
      ttl: "第13条（個人情報の利用停止等）",
      txt: `ユーザーは、ユーザー本人の個人情報が「あらかじめ公表された利用目的の範囲を超えて取り扱われているという理由」又は「偽りその他不正の手段により取得されたものであるという理由」により、個人情報保護法の定めに基づきその利用の停止又は消去（以下「利用停止等」といいます）を求めることができます。当事業者は、ユーザーから前項の請求を受けて、そのご請求に理由があることが判明した場合には、本人からのご請求であることを確認の上で、遅滞なく個人情報の利用停止等を行い、その旨をユーザーに通知します。但し、個人情報保護法その他の法令により、当事業者が利用停止等の義務を負わない場合は、この限りではありません。`,
    },
    {
      id: 14,
      ttl: "第14条（継続的改善）",
      txt: `当事業者は、個人情報の取り扱いに関する運用状況を適宜見直し、継続的な改善に努めるものとし、必要に応じて、プライバシーポリシーを変更することがあります。本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができるものとします。<br />変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。`,
    },
    {
      id: 15,
      ttl: "第15条（お問い合わせ窓口）",
      txt: `開示等のお申出、ご意見、ご質問、苦情、その他個人情報の取り扱いに関するお問い合わせは、下記の窓口までお願いいたします。<br />Eメールアドレス：<a class="text-[#0f83fd]" href="mailto:${email}">${email}</a>`,
    },
  ];
});

// ホスト名またはクエリから事業者のサブドメインを取得
const resolveSubdomain = (): string | null => {
  if (import.meta.server) return null;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (
    parts.length >= 3 &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1")
  ) {
    return parts[0] || null;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("subdomain");
};

// サブドメインに紐づくプライバシーポリシーデータを API から取得
onMounted(async () => {
  try {
    const subdomain = resolveSubdomain();
    if (!subdomain) {
      fetchErr.value = "事業者情報を取得できませんでした。";
      return;
    }

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    const res = await fetch(
      `${apiBase}/api/business/subdomain/transaction-law?subdomain=${encodeURIComponent(subdomain)}`,
      { method: "GET", credentials: "include" },
    );

    if (!res.ok) {
      fetchErr.value = "プライバシーポリシーの取得に失敗しました。";
      return;
    }

    const data = await res.json();
    companyName.value = data.company_name || "";
    supportEmail.value = data.support_email || "";
  } catch {
    fetchErr.value = "プライバシーポリシーの取得に失敗しました。";
  } finally {
    isLoading.value = false;
  }
});

useHead({
  title: "プライバシーポリシー",
  meta: [
    {
      name: "description",
      content: "プライバシーポリシー",
    },
  ],
});
</script>
