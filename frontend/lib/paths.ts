import { Plant, Order } from "@/lib/api";

export function plantPath(plant: Pick<Plant, "slug" | "id"> | string | number): string {
  if (typeof plant === "string") return `/plants/${plant}`;
  if (typeof plant === "number") return `/plants/${plant}`;
  return `/plants/${plant.slug || plant.id}`;
}

export function plantEditPath(plant: Pick<Plant, "slug" | "id"> | string | number): string {
  if (typeof plant === "string") return `/admin/plants/${plant}/edit`;
  if (typeof plant === "number") return `/admin/plants/${plant}/edit`;
  return `/admin/plants/${plant.slug || plant.id}/edit`;
}

export function orderPath(order: Pick<Order, "order_number" | "id"> | string | number): string {
  if (typeof order === "string") return `/orders/${encodeURIComponent(order)}`;
  if (typeof order === "number") return `/orders/${order}`;
  return `/orders/${encodeURIComponent(order.order_number || String(order.id))}`;
}

export function parsePlantImages(plant: Plant): string[] {
  const urls: string[] = [];
  if (plant.image_url) urls.push(plant.image_url);
  if (plant.images) {
    try {
      const parsed = typeof plant.images === "string" ? JSON.parse(plant.images) : plant.images;
      if (Array.isArray(parsed)) {
        parsed.forEach((u: string) => {
          if (u && !urls.includes(u)) urls.push(u);
        });
      }
    } catch {
      /* ignore */
    }
  }
  return urls;
}

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest to Oldest" },
  { value: "oldest", label: "Oldest to Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
