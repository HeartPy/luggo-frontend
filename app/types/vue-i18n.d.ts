import type { i18n } from "vue-i18n";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $i18n: i18n;
    $t: typeof i18n.prototype.t;
  }
}
