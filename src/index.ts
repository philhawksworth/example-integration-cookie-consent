// src/index.ts
import { NetlifyIntegration } from "@netlify/sdk";
 
const integration = new NetlifyIntegration();
 
integration.addEdgeFunctions("./src/edge-functions", {
  prefix: "ph_cookie_consent",
});
 
export { integration };
