import { describe, expect, it } from "vitest";
import {
  extractSubdomainFromHostname,
  isTenantHostPathAllowed,
  isTenantHostname,
} from "~/composables/useSubdomain";

describe("extractSubdomainFromHostname", () => {
  it("apex と www はテナントではない", () => {
    expect(extractSubdomainFromHostname("luggo.delivery")).toBeNull();
    expect(extractSubdomainFromHostname("www.luggo.delivery")).toBeNull();
  });

  it("事業者サブドメインを取り出す", () => {
    expect(extractSubdomainFromHostname("acme.luggo.delivery")).toBe("acme");
    expect(extractSubdomainFromHostname("test.luggo.delivery")).toBe("test");
  });

  it("localhost はテナントではない", () => {
    expect(extractSubdomainFromHostname("localhost")).toBeNull();
    expect(extractSubdomainFromHostname("127.0.0.1")).toBeNull();
  });
});

describe("isTenantHostPathAllowed", () => {
  it("予約関連のパスだけ許可する", () => {
    expect(isTenantHostPathAllowed("/booking")).toBe(true);
    expect(isTenantHostPathAllowed("/booking/1")).toBe(true);
    expect(isTenantHostPathAllowed("/booking/privacy")).toBe(true);
  });

  it("LugGo 本体のページは許可しない", () => {
    expect(isTenantHostPathAllowed("/")).toBe(false);
    expect(isTenantHostPathAllowed("/account/login")).toBe(false);
    expect(isTenantHostPathAllowed("/privacy")).toBe(false);
    expect(isTenantHostPathAllowed("/business-owner/dashboard")).toBe(false);
  });
});

describe("isTenantHostname", () => {
  it("事業者サブドメインだけ true", () => {
    expect(isTenantHostname("acme.luggo.delivery")).toBe(true);
    expect(isTenantHostname("www.luggo.delivery")).toBe(false);
    expect(isTenantHostname("luggo.delivery")).toBe(false);
    expect(isTenantHostname("localhost")).toBe(false);
  });
});
