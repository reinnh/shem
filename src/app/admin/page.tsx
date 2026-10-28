"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle,
  Phone,
  User,
  MapPin,
  RefreshCw,
  ArrowLeft,
  X,
  ExternalLink,
  ChevronRight,
  Vote,
  Unlock,
  Lock,
} from "lucide-react";
import { matunguWards, totalConstituencyVoters } from "@/constants/matungu-wards";
import { ApiResponse, Volunteer, VolunteerStats } from "@/types";

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedStation, setSelectedStation] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Volunteer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check initial session or default unlock for development convenience
  useEffect(() => {
    const saved = localStorage.getItem("matungu_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim();
    if (clean === "@shem36" || clean.toLowerCase() === "@shem36") {
      setIsAuthenticated(true);
      localStorage.setItem("matungu_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Incorrect coordinator passcode.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("matungu_admin_auth");
  };

  // Load volunteers & stats
  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [volRes, statsRes] = await Promise.all([
        fetch("/api/v1/volunteers"),
        fetch("/api/v1/volunteers/stats"),
      ]);

      const volJson: ApiResponse<Volunteer[]> = await volRes.json();
      const statsJson: ApiResponse<VolunteerStats> = await statsRes.json();

      if (volJson.success && volJson.data) {
        setVolunteers(volJson.data);
      }
      if (statsJson.success && statsJson.data) {
        setStats(statsJson.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Available stations based on chosen ward
  const availableStationsForFilter = useMemo(() => {
    if (selectedWard === "ALL") {
      return matunguWards.flatMap((w) => w.pollingStations);
    }
    const wardObj = matunguWards.find((w) => w.ward === selectedWard);
    return wardObj ? wardObj.pollingStations : [];
  }, [selectedWard]);

  // Client-side filtering
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((item) => {
      if (selectedWard !== "ALL" && item.ward !== selectedWard) return false;
      if (selectedStation !== "ALL" && item.pollingStation !== selectedStation) return false;
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesPhone = item.phoneNumber.toLowerCase().includes(q);
        const matchesStation = item.pollingStation.toLowerCase().includes(q);
        const matchesOccupation = (item.occupation || "").toLowerCase().includes(q);
        const matchesEducation = (item.educationLevel || "").toLowerCase().includes(q);
        const matchesRole = (item.volunteerRole || "").toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesStation && !matchesOccupation && !matchesEducation && !matchesRole) return false;
      }
      return true;
    });
  }, [volunteers, selectedWard, selectedStation, selectedStatus, search]);

  // Toggle status
  const handleToggleStatus = async (volunteer: Volunteer) => {
    const nextStatus = volunteer.status === "verified" ? "active" : "verified";
    try {
      const res = await fetch(`/api/v1/volunteers/${volunteer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data: ApiResponse<Volunteer> = await res.json();
      if (data.success && data.data) {
        setVolunteers((prev) =>
          prev.map((v) => (v._id === volunteer._id ? data.data! : v))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Delete volunteer
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/volunteers/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVolunteers((prev) => prev.filter((v) => v._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (selectedWard !== "ALL") params.append("ward", selectedWard);
    if (selectedStation !== "ALL") params.append("pollingStation", selectedStation);
    window.open(`/api/v1/volunteers/export?${params.toString()}`, "_blank");
  };

  // If not authenticated, show sleek iOS passcode screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f9f8f7] text-[#111827] flex items-center justify-center p-4 selection:bg-[#8e524d]/10">
        <div className="ios-card max-w-sm w-full p-6 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-[#8e524d]/10 text-[#8e524d] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-[#111827]">Coordinator Access</h2>
          <p className="text-xs text-[#6b7280] mt-1 mb-5">
            Admin console for managing Matungu volunteer rosters.
          </p>

          {authError && (
            <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-lg mb-4 border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-3.5">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Passcode"
                className="ios-input text-center text-lg tracking-widest"
                autoFocus
              />
            </div>

            <button type="submit" className="ios-button-primary">
              <Unlock className="w-4 h-4 mr-1" />
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#e6dfdc] flex items-center justify-between text-xs">
            <Link href="/" className="text-[#6b7280] hover:text-[#111827] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Volunteer Form
            </Link>
            <span className="text-[#6b7280]">Coordinator Access</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f7] text-[#111827] flex flex-col selection:bg-[#8e524d]/10 pb-16">
      {/* Top iOS Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e6dfdc] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg hover:bg-[#f9f8f7] text-[#6b7280] hover:text-[#111827] transition-colors"
              title="Return to Volunteer Form"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e6dfdc] shrink-0 bg-white">
              <img
                src="/images/lmm-logo.jpg"
                alt="LMM"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#111827] tracking-tight">
                  Coordinator Command
                </h1>
                <span className="text-[10px] font-semibold bg-[#8e524d]/10 text-[#8e524d] px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[#6b7280]">
                Matungu Constituency &bull; Hon. Shemaiah Kong&apos;ani 2027
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white border border-[#e6dfdc] text-[#111827] hover:bg-[#f9f8f7] active:scale-95 transition-all text-xs flex items-center gap-1"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#8e524d]" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="p-2 px-3 rounded-xl bg-[#8e524d] text-white hover:bg-[#7d423d] active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              title="Export filtered list to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#6b7280] hover:text-[#111827] hover:bg-[#f9f8f7] text-xs"
              title="Lock Admin"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-4 flex-1 space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="ios-card p-3.5 sm:col-span-1 lg:col-span-1">
            <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">
              Total
            </p>
            <p className="text-2xl font-bold text-[#111827] mt-0.5">
              {volunteers.length}
            </p>
            <p className="text-[10px] text-[#8e524d] mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {volunteers.filter((v) => v.status === "verified").length} Verified
            </p>
          </div>

          {matunguWards.map((w) => (
            <div key={w.ward} className="ios-card p-3.5">
              <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider truncate">
                {w.ward}
              </p>
              <p className="text-xl font-bold text-[#111827] mt-0.5">
                {volunteers.filter((v) => v.ward === w.ward).length}
              </p>
              <p className="text-[10px] text-[#6b7280] mt-1">
                {w.pollingStations.length} landmarks
              </p>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="ios-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b7280]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search volunteer, phone, landmark, role..."
                className="ios-input ios-input-icon !pl-10 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6b7280] hover:text-[#111827]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ward Selector */}
            <select
              value={selectedWard}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                setSelectedStation("ALL");
              }}
              className="ios-input sm:w-44 text-xs bg-white cursor-pointer"
            >
              <option value="ALL">All Wards ({matunguWards.length})</option>
              {matunguWards.map((w) => (
                <option key={w.ward} value={w.ward}>
                  {w.ward}
                </option>
              ))}
            </select>

            {/* Station / Landmark Selector */}
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="ios-input sm:w-56 text-xs bg-white cursor-pointer"
            >
              <option value="ALL">All Landmarks</option>
              {availableStationsForFilter.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="ios-input sm:w-32 text-xs bg-white cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6b7280] pt-1 border-t border-[#e6dfdc]">
            <span>
              Showing <strong className="text-[#111827]">{filteredVolunteers.length}</strong> of {volunteers.length} volunteers
            </span>

            {(selectedWard !== "ALL" || selectedStation !== "ALL" || selectedStatus !== "ALL" || search) && (
              <button
                onClick={() => {
                  setSelectedWard("ALL");
                  setSelectedStation("ALL");
                  setSelectedStatus("ALL");
                  setSearch("");
                }}
                className="text-[#8e524d] hover:underline font-medium text-[11px]"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Volunteers List (Responsive Cards for mobile, Table for wide screens) */}
        {loading ? (
          <div className="ios-card p-12 text-center text-[#6b7280]">
            <div className="w-8 h-8 border-2 border-[#8e524d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading volunteer records...</p>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="ios-card p-10 text-center">
            <User className="w-10 h-10 text-[#6b7280] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#111827]">No volunteers found</p>
            <p className="text-xs text-[#6b7280] mt-1">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Mobile Cards (Shown on small screens) */}
            <div className="space-y-2.5 sm:hidden">
              {filteredVolunteers.map((vol) => (
                <div key={vol._id} className="ios-card p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-[#111827]">{vol.fullName}</h4>
                        <span className="text-[10px] font-semibold bg-[#8e524d]/10 text-[#8e524d] px-2 py-0.5 rounded-sm border border-[#8e524d]/20">
                          {vol.volunteerRole || "Mobilizer"}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#8e524d]" />
                        <span>{vol.ward} &bull; {vol.pollingStation}</span>
                        {vol.isOtherStation && (
                          <span className="text-[#8e524d] text-[10px]">(Custom)</span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(vol)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                        vol.status === "verified"
                          ? "bg-[#8e524d]/10 text-[#8e524d] border-[#8e524d]/30"
                          : "bg-[#f9f8f7] text-[#6b7280] border-[#e6dfdc]"
                      }`}
                    >
                      {vol.status}
                    </button>
                  </div>

                  {vol.notes && (
                    <p className="text-xs bg-[#f9f8f7] p-2 rounded-lg text-[#111827] italic border border-[#e6dfdc]">
                      &quot;{vol.notes}&quot;
                    </p>
                  )}

                  {vol.comment && (
                    <p className="text-xs bg-[#8e524d]/5 p-2 rounded-sm text-[#191414] border border-[#8e524d]/15">
                      💬 {vol.comment}
                    </p>
                  )}

                  {vol.occupation && (
                    <p className="text-[11px] text-[#6b7280] flex items-center gap-1">
                      <span className="font-semibold text-[#191414]">Kazi:</span> {vol.occupation}
                    </p>
                  )}

                  {vol.educationLevel && (
                    <p className="text-[11px] text-[#6b7280] flex items-center gap-1">
                      <span className="font-semibold text-[#191414]">Education:</span> {vol.educationLevel}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#e6dfdc] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${vol.phoneNumber}`}
                        className="px-2.5 py-1.5 rounded-lg bg-[#f9f8f7] text-[#111827] hover:bg-[#e6dfdc] font-semibold flex items-center gap-1 border border-[#e6dfdc]"
                      >
                        <Phone className="w-3 h-3 text-[#8e524d]" />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${vol.phoneNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-[#8e524d]/10 text-[#8e524d] font-semibold flex items-center gap-1 border border-[#8e524d]/20"
                      >
                        WhatsApp
                      </a>
                    </div>

                    <button
                      onClick={() => setDeleteTarget(vol)}
                      className="p-1.5 text-[#6b7280] hover:text-red-600 rounded-lg transition-colors"
                      title="Delete volunteer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Shown on sm+ screens) */}
            <div className="hidden sm:block ios-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9f8f7] border-b border-[#e6dfdc] text-[#6b7280] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Volunteer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Kazi</th>
                    <th className="px-4 py-3">Education</th>
                    <th className="px-4 py-3">Ward</th>
                    <th className="px-4 py-3">Landmark</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dfdc]">
                  {filteredVolunteers.map((vol) => (
                    <tr key={vol._id} className="hover:bg-[#f9f8f7]/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#111827]">{vol.fullName}</p>
                        {vol.notes && (
                          <p className="text-[10px] text-[#6b7280] italic truncate max-w-xs">
                            {vol.notes}
                          </p>
                        )}
                        {vol.comment && (
                          <p className="text-[10px] text-[#8e524d] truncate max-w-xs">
                            💬 {vol.comment}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#111827]">
                        <a
                          href={`tel:${vol.phoneNumber}`}
                          className="hover:text-[#8e524d] hover:underline"
                        >
                          {vol.phoneNumber}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold bg-[#8e524d]/10 text-[#8e524d] px-2 py-0.5 rounded-sm whitespace-nowrap">
                          {vol.volunteerRole || "Mobilizer"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{vol.occupation || <span className="text-[#d8cfcb]">—</span>}</td>
                      <td className="px-4 py-3 text-[#6b7280]">{vol.educationLevel || <span className="text-[#d8cfcb]">—</span>}</td>
                      <td className="px-4 py-3 text-[#111827] font-medium">{vol.ward}</td>
                      <td className="px-4 py-3 text-[#6b7280]">
                        {vol.pollingStation}
                        {vol.isOtherStation && (
                          <span className="ml-1 text-[10px] text-[#8e524d] font-semibold">(Other)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(vol)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                            vol.status === "verified"
                              ? "bg-[#8e524d]/10 text-[#8e524d] border-[#8e524d]/30 hover:bg-[#8e524d]/20"
                              : "bg-[#f9f8f7] text-[#6b7280] border-[#e6dfdc] hover:bg-[#e6dfdc]"
                          }`}
                          title="Click to toggle status"
                        >
                          {vol.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <a
                          href={`https://wa.me/${vol.phoneNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#8e524d] hover:underline font-semibold"
                        >
                          WhatsApp
                        </a>
                        <button
                          onClick={() => setDeleteTarget(vol)}
                          className="text-[#6b7280] hover:text-red-600 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal for Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ios-card max-w-xs w-full p-5 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">Remove Volunteer?</h3>
            <p className="text-xs text-[#6b7280] mt-1 mb-5">
              Are you sure you want to remove{" "}
              <strong className="text-[#111827]">{deleteTarget.fullName}</strong> ({deleteTarget.pollingStation})?
            </p>

            <div className="space-y-2">
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-xl active:scale-98 transition-all text-xs disabled:opacity-50"
              >
                {actionLoading ? "Removing..." : "Yes, Remove"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="ios-button-secondary w-full text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
