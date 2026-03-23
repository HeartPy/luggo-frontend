<script setup lang="ts">
const route = useRoute();
const query: Record<string, string> = {};
if (typeof route.query.subdomain === "string" && route.query.subdomain) {
  query.subdomain = route.query.subdomain;
}
await navigateTo({ path: "/booking/1", query }, { replace: true });
</script>
