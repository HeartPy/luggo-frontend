<template>
  <div class="min-h-screen">
    <TopVisual />
    <TopService />
    <TopFee />
    <TopRegister />
  </div>
</template>

<script setup lang="ts">
import {
  LUGO_DEFAULT_DESCRIPTION,
  LUGO_DEFAULT_TITLE,
  useAppSeo,
} from "~/composables/useAppSeo";

useAppSeo({
  title: LUGO_DEFAULT_TITLE,
  description: LUGO_DEFAULT_DESCRIPTION,
  isHome: true,
});
</script>
