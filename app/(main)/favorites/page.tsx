import type { Metadata } from "next";
import { FavoritesView } from "@/components/views/FavoritesView";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved titles on RanzzNeko.",
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
