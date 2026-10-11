import { isLive } from "../env";
import { demoGateway } from "./demo";
import { liveGateway } from "./live";

export const gateway = isLive ? liveGateway : demoGateway;
export * from "./types";
