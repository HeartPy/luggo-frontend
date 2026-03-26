<template>
  <div class="min-h-screen">
    <div class="bg-white px-4 py-20">
      <div class="mx-auto max-w-4xl">
        <CommonAtomsTopicPath>
          <template #currentPath_name> 特定商取引法に基づく表記 </template>
        </CommonAtomsTopicPath>
        <div>
          <h1
            class="relative mb-8 text-2xl font-bold tracking-wide after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:bg-gray-600 after:content-['']"
          >
            特定商取引法に基づく表記
          </h1>
          <ul class="grid gap-6">
            <div
              v-for="transactionLawItem in transactionLawItems"
              :key="transactionLawItem.id"
            >
              <p class="mb-1 font-bold">
                {{ transactionLawItem.ttl }}
              </p>
              <p class="text-sm" v-html="transactionLawItem.txt" />
            </div>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type TransactionLawItem = {
  id: number;
  ttl: string;
  txt: string;
};

const transactionLawItems = ref<TransactionLawItem[]>([
  {
    id: 1,
    ttl: "事業者",
    txt: "呉本 心",
  },
  {
    id: 2,
    ttl: "事業者の所在地",
    txt: "〒586-0006<br />大阪府河内長野市松ヶ丘中町1593-39<br />Tel: 080-5770-0729<br />※お問い合わせは下記のメールアドレスからのみ受け付けています。",
  },
  {
    id: 3,
    ttl: "お問い合わせ先",
    txt: "luggo.register@gmail.com",
  },
  {
    id: 4,
    ttl: "販売価格と決済手数料",
    txt: "販売価格は各ユーザー(販売事業者)ページをご確認ください。ユーザー(販売事業者)に対して以下の手数料が課されます。<br /><br /><strong class='font-semibold'>決済手数料：10%</strong><br />※旅行客(購入者)の決済金額(税込)に対する手数料率です。",
  },
  {
    id: 5,
    ttl: "サービスの提供時期について",
    txt: "手荷物の集荷と配送は、旅行客(購入者)が定めた日時に、各ユーザー(販売事業者)が行います。",
  },
  {
    id: 6,
    ttl: "利用可能な決済方法",
    txt: "Apple Pay、Google Pay、クレジットカードで決済することができます。",
  },
  {
    id: 7,
    ttl: "キャンセルについて",
    txt: "・集荷日前日の22時59分までにご連絡いただいた場合：0%<br />・集荷日前日の23時以降にご連絡いただいた場合：100%<br />・事前連絡がなかった場合：100%",
  },
]);

useHead({
  title: "特定商取引法に基づく表記",
  meta: [
    {
      name: "description",
      content: "特定商取引法に基づく表記",
    },
    {
      key: "og:url",
      property: "og:url",
      content: "#",
    },
    {
      key: "og:title",
      property: "og:title",
      content: "特定商取引法に基づく表記 | LugGo(ラグゴー)",
    },
    {
      key: "og:description",
      property: "og:description",
      content: "特定商取引法に基づく表記のページです。",
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "特定商取引法に基づく表記 | LugGo(ラグゴー)",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: "特定商取引法に基づく表記のページです。",
    },
  ],
});

// useJsonld(() => [
//   {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: [
//       {
//         "@type": "ListItem",
//         position: 1,
//         item: "",
//         name: "トップ",
//       },
//       {
//         "@type": "ListItem",
//         position: 2,
//         item: "",
//         name: "特定商取引法に基づく表記",
//       },
//     ],
//   },
// ]);
</script>
