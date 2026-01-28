<template>
  <header class="w-full bg-white">
    <div class="mx-[2vw] flex h-20 items-center">
      <NuxtLink
        class="flex items-center gap-2 p-2.5 hover:opacity-80"
        to="/business-owner/dashboard"
      >
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
  </header>
</template>
