import { shopify } from "@trigger.dev/integrations";
import { customEvent, Trigger } from "@trigger.dev/sdk";
import { z } from "zod";

new Trigger({
  id: "shopify-product-variants",
  name: "Shopify product variants",
  apiKey: "trigger_development_mLpn9DEEqCRR",
  logLevel: "debug",
  on: customEvent({
    name: "shopify.product-variants",
    schema: z.object({}),
  }),
  run: async (event, ctx) => {
    await ctx.logger.info("Get Shopify products variants");

    const results = await shopify.searchProductVariants(
      "get-shopify-variants",
      {
        filter: {
          productId: ["gid://shopify/Product/8098295546157"],
          sku: ["variant-1"],
        },
      }
    );

    const newVariant = await shopify.createProductVariant("create-variant", {
      productId: results.productVariants[0].product.id,
      inventoryQuantities: [
        {
          availableQuantity: 10,
          locationId: "gid://shopify/Location/76187369773",
        },
      ],
      price: "12.34",
      sku: `variant-${Math.floor(Math.random() * 1000)}`,
      options: ["large", "cotton"],
    });

    return newVariant;
  },
}).listen();
