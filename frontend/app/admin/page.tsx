"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { apiClient, Order, Plant, ContactMessage, Review } from "@/lib/api";
import { ORDER_STATUSES, getStatusConfig } from "@/lib/orderStatus";
import { formatPKR } from "@/lib/currency";
import { plantEditPath } from "@/lib/paths";
import { FormSelect } from "@/components/ui/FormSelect";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { FiChevronLeft, FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiBarChart2, FiPackage, FiTrendingUp } from "react-icons/fi";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "plants" | "orders" | "messages" | "reviews">("overview");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<Set<number>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    plantId?: number;
    plantName?: string;
    isBulk?: boolean;
    bulkCount?: number;
  }>({ isOpen: false });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAdmin) { router.push("/"); return; }
    Promise.all([
      apiClient.getOrders().catch(() => []),
      apiClient.getPlants().catch(() => []),
      apiClient.getContactMessages().catch(() => []),
      apiClient.getPendingReviews().catch(() => []),
    ]).then(([o, p, m, r]) => { setOrders(o); setPlants(p); setMessages(m); setPendingReviews(r); }).finally(() => setLoading(false));
  }, [isAdmin, router]);

  const handleDeletePlant = async (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId);
    setDeleteDialog({
      isOpen: true,
      plantId,
      plantName: plant?.name || "Unknown Plant",
      isBulk: false,
    });
  };

  const handleBulkDelete = async () => {
    if (selectedPlants.size === 0) {
      toast.error("No plants selected");
      return;
    }

    setDeleteDialog({
      isOpen: true,
      isBulk: true,
      bulkCount: selectedPlants.size,
    });
  };

  const handleOrderStatusChange = async (order: Order, newStatus: string) => {
    const identifier = order.order_number || order.id;
    setUpdatingOrder(order.id);
    try {
      const updated = await apiClient.updateOrderStatus(identifier, newStatus);
      setOrders(orders.map((o) => (o.id === order.id ? updated : o)));
      toast.success(`Order ${order.order_number || `#${order.id}`} updated to ${getStatusConfig(newStatus).label}`);
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleApproveReview = async (reviewId: number) => {
    try {
      await apiClient.approveReview(reviewId);
      setPendingReviews(pendingReviews.filter((r) => r.id !== reviewId));
      toast.success("Review approved");
    } catch {
      toast.error("Failed to approve review");
    }
  };

  const handleMarkMessageRead = async (messageId: number) => {
    try {
      const updated = await apiClient.markContactMessageRead(messageId);
      setMessages(messages.map((m) => (m.id === messageId ? updated : m)));
    } catch {
      toast.error("Failed to update message");
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      if (deleteDialog.isBulk && deleteDialog.bulkCount) {
        // Bulk delete
        const toastId = toast.loading(`Deleting ${deleteDialog.bulkCount} plants...`);
        let successCount = 0;
        let failureCount = 0;

        for (const plantId of selectedPlants) {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/plants/${plantId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
              }
            );
            if (res.ok) {
              successCount++;
            } else {
              failureCount++;
            }
          } catch {
            failureCount++;
          }
        }

        toast.dismiss(toastId);
        if (successCount > 0) {
          setPlants(plants.filter((p) => !selectedPlants.has(p.id)));
          setSelectedPlants(new Set());
          toast.success(`${successCount} plant${successCount > 1 ? "s" : ""} deleted successfully`);
        }
        if (failureCount > 0) {
          toast.error(`Failed to delete ${failureCount} plant${failureCount > 1 ? "s" : ""}`);
        }
      } else if (deleteDialog.plantId) {
        // Single delete
        const toastId = toast.loading("Deleting plant...");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/plants/${deleteDialog.plantId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          }
        );
        if (!res.ok) throw new Error();
        toast.dismiss(toastId);
        toast.success("Plant deleted successfully");
        setPlants(plants.filter((p) => p.id !== deleteDialog.plantId));
      }
    } catch {
      toast.error("Failed to delete plant");
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false });
    }
  };

  const toggleSelectPlant = (plantId: number) => {
    const newSelection = new Set(selectedPlants);
    if (newSelection.has(plantId)) {
      newSelection.delete(plantId);
    } else {
      newSelection.add(plantId);
    }
    setSelectedPlants(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPlants.size === plants.length) {
      setSelectedPlants(new Set());
    } else {
      setSelectedPlants(new Set(plants.map((p) => p.id)));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Loading dashboard…</p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const lowStockPlants = plants.filter((p) => p.stock < 5);

  const STATS = [
    { label: "Total Revenue", value: formatPKR(totalRevenue), sub: "All time", icon: FiTrendingUp, color: "var(--color-terracotta)" },
    { label: "Total Orders", value: orders.length.toString(), sub: `${orders.filter(o => o.status === "order_confirmed").length} confirmed`, icon: FiPackage, color: "var(--color-forest)" },
    { label: "Plant Species", value: plants.length.toString(), sub: `${lowStockPlants.length} low stock`, icon: FiBarChart2, color: "var(--color-sage)" },
    { label: "Avg Order Value", value: orders.length ? formatPKR(totalRevenue / orders.length) : formatPKR(0), sub: "Per order", icon: FiTrendingUp, color: "#7c3aed" },
  ];

  return (
    <div style={{ background: "var(--color-cream)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--color-sand)", padding: "clamp(24px, 4vw, 40px) 20px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{
              fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: "8px",
            }}>Admin Control Center</p>
            <h1 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: "600",
              color: "var(--color-forest)",
            }}>Vendor Dashboard</h1>
          </div>
          <Link href="/" style={{
            fontSize: "12px", color: "var(--color-forest)", textDecoration: "none",
            border: "1px solid var(--color-sand)", borderRadius: "4px",
            padding: "10px 16px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px",
          }}>
            <FiChevronLeft /> Back
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(20px, 4vw, 40px)" }}>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}>
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{
                background: "white",
                border: "1px solid var(--color-sand)",
                borderRadius: "6px",
                padding: "24px",
                display: "flex",
                justifyContent: "space-between",
              alignItems: "flex-start",
            }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "8px" }}>{stat.label}</p>
                <p style={{
                  fontFamily: "var(--font-playfair, serif)",
                  fontSize: "28px", fontWeight: "600",
                  color: stat.color, lineHeight: 1,
                }}>{stat.value}</p>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>{stat.sub}</p>
              </div>
              <span style={{
                fontSize: "24px",
                background: "var(--color-cream-dark)",
                width: "48px", height: "48px",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: stat.color,
              }}>
                <Icon size={24} />
              </span>
            </div>
            );
          })}
        </div>

        {/* Low Stock Alert */}
        {lowStockPlants.length > 0 && (
          <div style={{
            background: "var(--color-terracotta-pale)",
            border: "1px solid var(--color-terracotta-light)",
            borderRadius: "6px",
            padding: "16px 20px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <FiAlertTriangle size={20} />
            <p style={{ fontSize: "14px", color: "var(--color-charcoal)" }}>
              <strong>{lowStockPlants.length} plant{lowStockPlants.length > 1 ? "s" : ""}</strong> {lowStockPlants.length > 1 ? "are" : "is"} running low on stock:{" "}
              {lowStockPlants.map((p) => p.name).join(", ")}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid var(--color-sand)", marginBottom: "32px", display: "flex", gap: "0", overflowX: "auto" }}>
          {(["overview", "plants", "orders", "messages", "reviews"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)",
                border: "none", background: "transparent",
                fontSize: "13px", fontWeight: "600",
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: "pointer",
                color: tab === t ? "var(--color-forest)" : "var(--color-text-muted)",
                borderBottom: `2px solid ${tab === t ? "var(--color-forest)" : "transparent"}`,
                fontFamily: "inherit",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}>
              {t === "overview" ? "Overview"
                : t === "plants" ? `Inventory (${plants.length})`
                : t === "orders" ? `Orders (${orders.length})`
                : t === "messages" ? `Messages (${messages.filter(m => !m.is_read).length})`
                : `Reviews (${pendingReviews.length})`}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "24px" }} className="admin-overview">
            {/* Quick Actions */}
            <div style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "28px" }}>
              <h2 style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "20px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "20px",
              }}>Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Add New Plant", href: "/admin/plants/new", icon: FiPlus },
                  { label: "View All Orders", href: "/orders", icon: FiPackage },
                  { label: "Update Inventory", href: "/admin?tab=plants", icon: FiEdit2 },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      background: "var(--color-cream-dark)",
                      borderRadius: "4px",
                      textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--color-sage-pale)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--color-cream-dark)"}
                    >
                      <Icon size={18} style={{ color: "var(--color-forest)" }} />
                      <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-forest)" }}>{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders */}
            <div style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "28px" }}>
              <h2 style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "20px", fontWeight: "600", color: "var(--color-forest)", marginBottom: "20px",
              }}>Recent Orders</h2>
              {orders.length === 0 ? (
                <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>No orders yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid var(--color-sand)",
                    }}>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-forest)" }}>
                          Order #{order.id}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{
                          fontFamily: "var(--font-playfair, serif)",
                          fontSize: "15px", fontWeight: "600", color: "var(--color-terracotta)",
                        }}>{formatPKR(order.total_amount)}</p>
                        <span style={{
                          fontSize: "10px", fontWeight: "600",
                          color: "var(--color-forest-muted)",
                          background: "var(--color-sage-pale)",
                          padding: "2px 8px", borderRadius: "2px",
                          textTransform: "capitalize",
                        }}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plants */}
        {tab === "plants" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{
                fontFamily: "var(--font-playfair, serif)",
                fontSize: "clamp(20px, 4vw, 26px)", fontWeight: "600", color: "var(--color-forest)",
              }}>Plant Inventory</h2>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {selectedPlants.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    style={{
                      background: "#dc2626",
                      color: "white",
                      padding: "10px 16px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <FiTrash2 />
                    Delete {selectedPlants.size} {selectedPlants.size === 1 ? "Plant" : "Plants"}
                  </button>
                )}
                <Link href="/admin/plants/new" style={{
                  background: "var(--color-forest)", color: "var(--color-cream)",
                  padding: "10px 20px", borderRadius: "4px",
                  fontSize: "13px", fontWeight: "600", textDecoration: "none",
                  letterSpacing: "0.03em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <FiPlus />
                  Add Plant
                </Link>
              </div>
            </div>
            {plants.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>No plants yet</p>
            ) : (
              <>
                {/* Bulk Actions */}
                {plants.length > 0 && (
                  <div style={{
                    background: "var(--color-cream-dark)",
                    border: "1px solid var(--color-sand)",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedPlants.size === plants.length && plants.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-forest)" }}>
                        Select All ({plants.length})
                      </span>
                    </label>
                    {selectedPlants.size > 0 && (
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        {selectedPlants.size} selected
                      </span>
                    )}
                  </div>
                )}

                {/* Plants Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
                  gap: "16px",
                }}>
                  {plants.map((plant) => (
                    <div
                      key={plant.id}
                      style={{
                        background: "white",
                        border: selectedPlants.has(plant.id) ? "2px solid var(--color-forest)" : "1px solid var(--color-sand)",
                        borderRadius: "6px",
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* Checkbox Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          zIndex: 10,
                        }}
                      >
                        <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedPlants.has(plant.id)}
                            onChange={() => toggleSelectPlant(plant.id)}
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                              accentColor: "var(--color-forest)",
                            }}
                          />
                        </label>
                      </div>

                      <div
                        style={{
                          height: "160px",
                          background: "var(--color-sage-pale)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {plant.image_url ? (
                          <img
                            src={plant.image_url}
                            alt={plant.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: "48px" }}>🌿</span>
                        )}
                        {plant.stock < 5 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              background: "var(--color-terracotta)",
                              color: "white",
                              fontSize: "10px",
                              fontWeight: "700",
                              padding: "3px 8px",
                              borderRadius: "2px",
                            }}
                          >
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <div style={{ padding: "16px" }}>
                        <h3
                          style={{
                            fontFamily: "var(--font-playfair, serif)",
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "var(--color-forest)",
                            marginBottom: "2px",
                          }}
                        >
                          {plant.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "11px",
                            fontStyle: "italic",
                            color: "var(--color-text-muted)",
                            marginBottom: "10px",
                          }}
                        >
                          {plant.botanical_name}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-playfair, serif)",
                              fontSize: "18px",
                              fontWeight: "600",
                              color: "var(--color-terracotta)",
                            }}
                          >
                            {formatPKR(plant.price)}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--color-text-muted)",
                              background: "var(--color-cream-dark)",
                              padding: "3px 10px",
                              borderRadius: "2px",
                            }}
                          >
                            {plant.stock} in stock
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link
                            href={plantEditPath(plant)}
                            style={{
                              flex: 1,
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              background: "var(--color-cream-dark)",
                              color: "var(--color-charcoal)",
                              padding: "8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              textDecoration: "none",
                            }}
                          >
                            <FiEdit2 size={14} />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDeletePlant(plant.id)}
                            style={{
                              flex: 1,
                              background: "#fef2f2",
                              color: "#dc2626",
                              border: "none",
                              padding: "8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            <FiTrash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Delete Dialog */}
            <DeleteConfirmDialog
              isOpen={deleteDialog.isOpen}
              title={deleteDialog.isBulk ? "Delete Multiple Plants" : "Delete Plant"}
              message={
                deleteDialog.isBulk
                  ? `Are you sure you want to delete ${deleteDialog.bulkCount} plant${deleteDialog.bulkCount === 1 ? "" : "s"}? This action cannot be undone.`
                  : "Are you sure you want to delete this plant? This action cannot be undone."
              }
              itemName={!deleteDialog.isBulk ? deleteDialog.plantName : undefined}
              isLoading={isDeleting}
              onConfirm={confirmDelete}
              onCancel={() => setDeleteDialog({ isOpen: false })}
            />
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            <h2 style={{
              fontFamily: "var(--font-playfair, serif)",
              fontSize: "clamp(20px, 4vw, 26px)", fontWeight: "600", color: "var(--color-forest)", marginBottom: "24px",
            }}>All Orders</h2>
            {orders.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>No orders yet</p>
            ) : (
              <div style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--color-cream-dark)", borderBottom: "1px solid var(--color-sand)" }}>
                      {["Order ID", "Items", "Amount", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} style={{
                          padding: "14px 20px", textAlign: "left",
                          fontSize: "11px", fontWeight: "700",
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: "var(--color-text-muted)",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => {
                      const statusCfg = getStatusConfig(order.status);
                      return (
                        <tr key={order.id} style={{ borderBottom: i < orders.length - 1 ? "1px solid var(--color-sand)" : "none" }}>
                          <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "600", color: "var(--color-forest)" }}>
                            #{order.id}
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--color-charcoal-light)" }}>
                            {order.item_count ?? order.items?.length ?? 0} item{(order.item_count ?? order.items?.length ?? 0) !== 1 ? "s" : ""}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{
                              fontFamily: "var(--font-playfair, serif)",
                              fontSize: "15px", fontWeight: "600", color: "var(--color-terracotta)",
                            }}>{formatPKR(order.total_amount, 2)}</span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{
                              background: statusCfg.bg, color: statusCfg.color,
                              padding: "4px 12px", borderRadius: "100px",
                              fontSize: "11px", fontWeight: "600",
                            }}>{statusCfg.label}</span>
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--color-text-muted)" }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <FormSelect
                              value={order.status}
                              disabled={updatingOrder === order.id}
                              onValueChange={(v) => handleOrderStatusChange(order, v)}
                              options={ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                              className="h-8 text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {tab === "messages" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "clamp(20px, 4vw, 26px)", fontWeight: "600", color: "var(--color-forest)", marginBottom: "24px" }}>Contact Messages</h2>
            {messages.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>No messages yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ background: msg.is_read ? "white" : "var(--color-sage-pale)", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-forest)" }}>{msg.name} — {msg.subject}</p>
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{msg.email} · {new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                      {!msg.is_read && (
                        <button onClick={() => handleMarkMessageRead(msg.id)} style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Mark Read</button>
                      )}
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--color-charcoal)", lineHeight: 1.6 }}>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {tab === "reviews" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "clamp(20px, 4vw, 26px)", fontWeight: "600", color: "var(--color-forest)", marginBottom: "24px" }}>Pending Reviews</h2>
            {pendingReviews.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>No pending reviews</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingReviews.map((review) => (
                  <div key={review.id} style={{ background: "white", border: "1px solid var(--color-sand)", borderRadius: "6px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-forest)" }}>{review.title}</p>
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Plant #{review.plant_id} · {"⭐".repeat(Math.round(review.rating))} · {new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleApproveReview(review.id)} style={{ background: "var(--color-forest)", color: "white", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--color-charcoal)", lineHeight: 1.6 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
