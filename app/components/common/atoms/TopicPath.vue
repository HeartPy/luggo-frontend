<template>
  <nav class="mb-10" aria-label="パンくずリスト">
    <ol
      class="m-0 flex list-none flex-wrap items-center p-0 text-xs text-gray-400"
    >
      <li class="inline">
        <nuxt-link
          to="/"
          class="underline hover:opacity-60 md:hover:opacity-100"
        >
          トップ
        </nuxt-link>
      </li>
      <li class="inline">
        <span class="mx-2" aria-hidden="true">&gt;</span>
        <span class="text-gray-600" aria-current="page"
          ><slot name="currentPath_name"
        /></span>
      </li>
    </ol>
  </nav>
</template>
