import { createEntityClient } from "../utils/entityWrapper";
import schema from "./YogurtProgress.json";
export const YogurtProgress = createEntityClient("YogurtProgress", schema);
