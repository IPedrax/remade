import { createContext, useContext } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export interface ExploreFilters {
	q: string;
	category: string;
	language: string;
	platform: string;
	status: string;
	compatibility: string;
	sort: string;
}

export const defaultFilters: ExploreFilters = {
	q: "",
	category: "",
	language: "",
	platform: "",
	status: "",
	compatibility: "",
	sort: "recent",
};

export const fields = [
	"q",
	"category",
	"language",
	"platform",
	"status",
	"compatibility",
	"sort",
] as const;

interface ExploreState {
	filters: ExploreFilters;
	setFilters: (filters: ExploreFilters) => void;
	change: (key: keyof ExploreFilters, value: string) => void;
	clear: () => void;
}

export function createExploreStore() {
	return createStore<ExploreState>()((set) => ({
		filters: { ...defaultFilters },
		setFilters: (filters) => set({ filters }),
		change: (key, value) =>
			set((state) => ({ filters: { ...state.filters, [key]: value } })),
		clear: () => set({ filters: { ...defaultFilters } }),
	}));
}

export const ExploreContext = createContext<ReturnType<
	typeof createExploreStore
> | null>(null);

export function useExploreStore<T>(selector: (state: ExploreState) => T): T {
	const store = useContext(ExploreContext);

	if (!store) throw new Error("ExploreProvider is required");

	return useStore(store, selector);
}
