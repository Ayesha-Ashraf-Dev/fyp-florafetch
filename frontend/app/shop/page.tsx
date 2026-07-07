"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient, Plant } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AdvancedSearchFilters, SearchFilters } from "@/components/AdvancedSearchFilters";
import { FiGrid, FiList, FiSearch, FiSettings, FiHome, FiTrendingUp, FiDroplet, FiStar } from "react-icons/fi";
import { toast } from "sonner";
import { formatPKR } from "@/lib/currency";
import { plantPath, SORT_OPTIONS, SortOption } from "@/lib/paths";
import { FormSelect } from "@/components/ui/FormSelect";

const CATEGORIES = [
  { id: "indoor", label: "Indoor", icon: FiHome },
  { id: "outdoor", label: "Outdoor", icon: FiTrendingUp },
  { id: "succulents", label: "Succulents", icon: FiDroplet },
  { id: "flowering", label: "Flowering", icon: FiStar },
  { id: "medicinal", label: "Medicinal", icon: FiTrendingUp },
];

export default function ShopPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<{ [key: string | number]: number }>({});
  const [addingToCart, setAddingToCart] = useState<string | number | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadPlants();
  }, [selectedCategory, search, filters, sort]);

  const loadPlants = async () => {
    setLoading(true);
    try {
      let data = await apiClient.getPlants(selectedCategory, search || undefined, sort);

      // Apply advanced filters
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        data = data.filter((p) => {
          if (filters.priceMin !== undefined && p.price < filters.priceMin) return false;
          if (filters.priceMax !== undefined && p.price > filters.priceMax) return false;
          return true;
        });
      }

      if (filters.wateringFrequency) {
        data = data.filter((p) => p.watering_frequency === filters.wateringFrequency);
      }

      if (filters.sunlight) {
        data = data.filter((p) => p.sunlight_requirement === filters.sunlight);
      }

      if (filters.petFriendly) {
        data = data.filter((p) => p.is_pet_friendly);
      }

      if (filters.lowMaintenance) {
        data = data.filter((p) => p.is_low_maintenance);
      }

      setPlants(data);
    } catch {
      toast.error("Failed to load plants");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, plantId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error("Please sign in to add items to cart");
      router.push("/login");
      return;
    }
    const qty = quantity[plantId] || 1;
    setAddingToCart(plantId);
    const loadingToast = toast.loading("Adding to cart…");
    try {
      await addToCart(plantId, qty);
      toast.dismiss(loadingToast);
      toast.success("Added to cart");
      setQuantity({ ...quantity, [plantId]: 1 });
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{
        borderBottom: "1px solid var(--color-sand)",
        padding: "clamp(32px, 4vw, 48px) 20px clamp(24px, 3vw, 36px)",
        maxWidth: "1280px",
        margin: "0 auto",
      }}>
        <p style={{
          fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "12px",
        }}>
          All Plants
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: "16px" }}>
          <h1 style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: "600",
            color: "var(--color-forest)",
            lineHeight: 1.1,
          }}>
            Discover the<br />
            <em style={{ fontStyle: "italic", color: "var(--color-forest-muted)" }}>Collection</em>
          </h1>
          {/* Search, Filters, and Layout Toggle */}
          <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: isMobile ? "1" : "0 1 200px", minWidth: "160px" }}>
              <FiSearch style={{
                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                fontSize: "16px", color: "var(--color-text-muted)", pointerEvents: "none",
              }} />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  background: "white",
                  border: "1px solid var(--color-sand)",
                  borderRadius: "6px",
                  padding: "10px 12px 10px 38px",
                  fontSize: "13px",
                  color: "var(--color-charcoal)",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--color-sage)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--color-sand)"}
              />
            </div>

            {/* Sort */}
            <div style={{ minWidth: isMobile ? "100%" : "200px" }}>
              <FormSelect
                value={sort}
                onValueChange={(v) => setSort(v as SortOption)}
                options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                placeholder="Sort by"
              />
            </div>

            {/* Advanced Filter Button */}
            <button
              onClick={() => setShowAdvancedFilters(true)}
              title="Advanced Filters"
              style={{
                padding: "10px 12px",
                background: "var(--color-cream-dark)",
                border: "1px solid var(--color-sand)",
                borderRadius: "6px",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-sage-pale)";
                e.currentTarget.style.borderColor = "var(--color-sage)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-cream-dark)";
                e.currentTarget.style.borderColor = "var(--color-sand)";
              }}
            >
              <FiSettings />
            </button>

            {/* Layout Toggle Buttons */}
            <div style={{ display: "flex", gap: "4px", background: "var(--color-cream-dark)", borderRadius: "6px", padding: "4px", border: "1px solid var(--color-sand)" }}>
              <button
                onClick={() => setLayoutMode("grid")}
                title="Grid Layout"
                style={{
                  padding: "6px 10px",
                  background: layoutMode === "grid" ? "white" : "transparent",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  color: layoutMode === "grid" ? "var(--color-forest)" : "var(--color-text-muted)",
                  transition: "all 0.2s",
                }}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setLayoutMode("list")}
                title="List Layout"
                style={{
                  padding: "6px 10px",
                  background: layoutMode === "list" ? "white" : "transparent",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  color: layoutMode === "list" ? "var(--color-forest)" : "var(--color-text-muted)",
                  transition: "all 0.2s",
                }}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
          <FilterChip active={!selectedCategory} onClick={() => setSelectedCategory(undefined)}>
            All Plants
          </FilterChip>
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <FilterChip
                key={cat.id}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <IconComponent style={{ marginRight: "6px" }} />
                {cat.label}
              </FilterChip>
            );
          })}
        </div>
      </div>

      {/* ── Plants Section ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(20px, 4vw, 40px)" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <LoadingSpinner />
          </div>
        )}

        {!loading && plants.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              <FiSearch size={48} style={{ margin: "0 auto" }} />
            </div>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "clamp(24px, 4vw, 28px)", color: "var(--color-forest)", marginBottom: "8px",
            }}>No plants found</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Try adjusting your search or selecting a different category</p>
          </div>
        )}

        {!loading && plants.length > 0 && (
          <>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
              Showing <strong style={{ color: "var(--color-forest)" }}>{plants.length}</strong> plant{plants.length !== 1 ? "s" : ""}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
            
            {layoutMode === "grid" ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
                gap: "16px",
              }}>
                {plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    quantity={quantity[plant.id] || 1}
                    onQuantityChange={(q) => setQuantity({ ...quantity, [plant.id]: q })}
                    onAddToCart={(e) => handleAddToCart(e, plant.id)}
                    isAdding={addingToCart === plant.id}
                    onViewDetail={() => router.push(plantPath(plant))}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {plants.map((plant) => (
                  <PlantListItem
                    key={plant.id}
                    plant={plant}
                    quantity={quantity[plant.id] || 1}
                    onQuantityChange={(q) => setQuantity({ ...quantity, [plant.id]: q })}
                    onAddToCart={(e) => handleAddToCart(e, plant.id)}
                    isAdding={addingToCart === plant.id}
                    onViewDetail={() => router.push(plantPath(plant))}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedSearchFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onFiltersChange={setFilters}
      />
    </div>
  );
}

function FilterChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: "100px",
        border: active ? "none" : "1px solid var(--color-sand)",
        background: active ? "var(--color-forest)" : "white",
        color: active ? "var(--color-cream)" : "var(--color-charcoal-light)",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.03em",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function PlantCard({
  plant, quantity, onQuantityChange, onAddToCart, isAdding, onViewDetail,
}: {
  plant: Plant;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  isAdding: boolean;
  onViewDetail: () => void;
}) {
  return (
    <div 
      onClick={onViewDetail}
      style={{
      background: "white",
      border: "1px solid var(--color-sand)",
      display: "flex",
      flexDirection: "column",
      transition: "box-shadow 0.25s",
      cursor: "pointer",
    }}
    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(27,46,36,0.10)"}
    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
    >
      {/* Image */}
      <div style={{
        width: "100%",
        height: "220px",
        background: "var(--color-sage-pale)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {plant.image_url ? (
          <img src={plant.image_url} alt={plant.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "64px" }}>🌿</span>
        )}
        {/* Category badge */}
        <span style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: "var(--color-forest)",
          color: "var(--color-cream)",
          fontSize: "10px",
          fontWeight: "600",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: "2px",
        }}>
          {plant.category}
        </span>
        {/* Out of stock overlay */}
        {plant.stock === 0 && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-muted)" }}>Out of Stock</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontFamily: "var(--font-playfair, serif)",
          fontSize: "18px",
          fontWeight: "600",
          color: "var(--color-forest)",
          marginBottom: "4px",
          lineHeight: 1.3,
        }}>
          {plant.name}
        </h3>
        <p style={{
          fontSize: "12px",
          fontStyle: "italic",
          color: "var(--color-text-muted)",
          marginBottom: "12px",
        }}>{plant.botanical_name}</p>
        <p style={{
          fontSize: "13px",
          color: "var(--color-charcoal-light)",
          lineHeight: 1.5,
          flex: 1,
          marginBottom: "16px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {plant.description}
        </p>

        {/* Price & stock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "22px",
            fontWeight: "600",
            color: "var(--color-terracotta)",
          }}>{formatPKR(plant.price)}</p>
          <span style={{
            fontSize: "11px",
            color: plant.stock > 0 ? "var(--color-forest-muted)" : "var(--color-text-muted)",
            background: plant.stock > 0 ? "var(--color-sage-pale)" : "var(--color-cream-dark)",
            padding: "3px 10px",
            borderRadius: "2px",
            fontWeight: "500",
          }}>
            {plant.stock > 0 ? `${plant.stock} left` : "Sold out"}
          </span>
        </div>

        {/* Add to cart */}
        {plant.stock > 0 ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid var(--color-sand)",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                style={{
                  width: "32px", height: "40px",
                  background: "transparent", border: "none",
                  color: "var(--color-charcoal-light)", cursor: "pointer",
                  fontSize: "16px", fontWeight: "300",
                }}>−</button>
              <span style={{
                width: "32px", textAlign: "center",
                fontSize: "14px", fontWeight: "600", color: "var(--color-forest)",
              }}>{quantity}</span>
              <button onClick={() => onQuantityChange(Math.min(plant.stock, quantity + 1))}
                style={{
                  width: "32px", height: "40px",
                  background: "transparent", border: "none",
                  color: "var(--color-charcoal-light)", cursor: "pointer",
                  fontSize: "16px", fontWeight: "300",
                }}>+</button>
            </div>
            <button onClick={onAddToCart} disabled={isAdding}
              style={{
                flex: 1,
                background: isAdding ? "var(--color-sage)" : "var(--color-forest)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isAdding ? "not-allowed" : "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "background 0.2s",
                fontFamily: "inherit",
              }}>
              {isAdding ? "Adding…" : "Add to Cart"}
            </button>
          </div>
        ) : (
          <button disabled style={{
            width: "100%",
            background: "var(--color-cream-dark)",
            color: "var(--color-text-muted)",
            border: "none", borderRadius: "4px",
            padding: "11px",
            fontSize: "13px", fontWeight: "600",
            cursor: "not-allowed", fontFamily: "inherit",
          }}>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

function PlantListItem({
  plant, quantity, onQuantityChange, onAddToCart, isAdding, onViewDetail,
}: {
  plant: Plant;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  isAdding: boolean;
  onViewDetail: () => void;
}) {
  return (
    <div
      onClick={onViewDetail}
      style={{
        background: "white",
        border: "1px solid var(--color-sand)",
        borderRadius: "6px",
        padding: "16px",
        display: "flex",
        gap: "16px",
        alignItems: "center",
        cursor: "pointer",
        transition: "box-shadow 0.25s",
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(27,46,36,0.10)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
    >
      {/* Image */}
      <div style={{
        width: "100px",
        height: "100px",
        minWidth: "100px",
        background: "var(--color-sage-pale)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "4px",
        position: "relative",
      }}>
        {plant.image_url ? (
          <img src={plant.image_url} alt={plant.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "32px" }}>🌿</span>
        )}
        {plant.stock < 5 && plant.stock > 0 && (
          <span style={{
            position: "absolute", top: "4px", right: "4px",
            background: "var(--color-terracotta)", color: "white",
            fontSize: "9px", fontWeight: "700",
            padding: "2px 6px", borderRadius: "2px",
          }}>LOW STOCK</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "4px" }}>
          <h3 style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "16px",
            fontWeight: "600",
            color: "var(--color-forest)",
            margin: 0,
          }}>
            {plant.name}
          </h3>
          <p style={{
            fontFamily: "var(--font-playfair, serif)",
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--color-terracotta)",
            margin: 0,
            whiteSpace: "nowrap",
          }}>{formatPKR(plant.price)}</p>
        </div>
        <p style={{
          fontSize: "12px",
          fontStyle: "italic",
          color: "var(--color-text-muted)",
          margin: "0 0 8px 0",
        }}>{plant.botanical_name}</p>
        <p style={{
          fontSize: "13px",
          color: "var(--color-charcoal-light)",
          lineHeight: 1.5,
          margin: 0,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {plant.description}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", minWidth: "fit-content" }}>
        {plant.stock > 0 ? (
          <>
            <div style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid var(--color-sand)",
              borderRadius: "4px",
              overflow: "hidden",
              background: "white",
            }}>
              <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                style={{
                  width: "28px", height: "32px",
                  background: "transparent", border: "none",
                  color: "var(--color-charcoal-light)", cursor: "pointer",
                  fontSize: "14px", fontWeight: "300", fontFamily: "inherit",
                }}>−</button>
              <span style={{
                width: "28px", textAlign: "center",
                fontSize: "13px", fontWeight: "600", color: "var(--color-forest)",
              }}>{quantity}</span>
              <button onClick={() => onQuantityChange(Math.min(plant.stock, quantity + 1))}
                style={{
                  width: "28px", height: "32px",
                  background: "transparent", border: "none",
                  color: "var(--color-charcoal-light)", cursor: "pointer",
                  fontSize: "14px", fontWeight: "300", fontFamily: "inherit",
                }}>+</button>
            </div>
            <button onClick={onAddToCart} disabled={isAdding}
              style={{
                background: isAdding ? "var(--color-sage)" : "var(--color-forest)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: isAdding ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}>
              {isAdding ? "Adding…" : "Add"}
            </button>
          </>
        ) : (
          <span style={{
            fontSize: "12px",
            color: "var(--color-text-muted)",
            background: "var(--color-cream-dark)",
            padding: "6px 12px",
            borderRadius: "4px",
          }}>Sold out</span>
        )}
      </div>
    </div>
  );
}
