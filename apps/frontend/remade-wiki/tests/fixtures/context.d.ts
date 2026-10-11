import type { CatalogData } from "../../src/lib/catalog";
import "vitest";

declare module "vitest" {
	export interface ProvidedContext {
		catalog: CatalogData;
	}
}
