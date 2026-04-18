import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  return {
    locale: "hu",
    messages: (await import("../../messages/hu.json")).default,
  };
});
