<template>
  <header class="w-full bg-white">
    <div class="mx-[2vw] flex h-20 items-center justify-between">
      <div>
        <NuxtLink class="flex items-center gap-2 p-2.5 hover:opacity-80" to="/">
          <figure class="h-6 w-6">
            <img
              src="/img/luggo.svg"
              alt="LugGo"
              class="h-full w-full object-contain"
            />
          </figure>
          <span class="whitespace-nowrap text-xl font-bold text-gray-800">
            LugGo
          </span>
        </NuxtLink>
      </div>
      <div>
        <nav>
          <ul class="flex items-center gap-4">
            <li>
              <NuxtLink
                class="flex items-center rounded border border-gray-300 p-2.5 hover:opacity-80"
                to="/account/login"
              >
                ログイン
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                class="flex items-center rounded bg-gray-800 p-2.5 text-white hover:bg-gray-900"
                to="/account/register/email"
              >
                無料登録
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>
