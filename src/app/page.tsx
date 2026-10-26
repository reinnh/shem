"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  MapPin,
  Vote,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Shield,
  Briefcase,
  MessageSquare,
  HelpCircle,
  GraduationCap,
} from "lucide-react";
import { matunguWards, totalPollingStations } from "@/constants/matungu-wards";
import { ApiResponse, Volunteer } from "@/types";

const OTHER_STATION = "__OTHER__";

export default function VolunteerRegistrationPage() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ward, setWard] = useState("");
  const [pollingStation, setPollingStation] = useState("");
  const [isOtherStation, setIsOtherStation] = useState(false);
  const [otherStationText, setOtherStationText] = useState("");
  const [occupation, setOccupation] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successVolunteer, setSuccessVolunteer] = useState<Volunteer | null>(null);
  const [showWardsAccordion, setShowWardsAccordion] = useState(false);

  // Cascading polling stations based on selected ward
  const selectedWardData = matunguWards.find((w) => w.ward === ward);
  const availableStations = selectedWardData ? selectedWardData.pollingStations : [];

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWard = e.target.value;
    setWard(newWard);
    setPollingStation(""); // Reset cascading dropdown
    setIsOtherStation(false);
    setOtherStationText("");
    setError(null);
  };

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === OTHER_STATION) {
      setIsOtherStation(true);
      setPollingStation(OTHER_STATION);
    } else {
      setIsOtherStation(false);
      setOtherStationText("");
      setPollingStation(val);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please provide your full legal name (at least 2 characters).");
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      setError("Please provide a valid active phone number.");
      return;
    }

    if (!ward) {
      setError("Please select your Ward.");
      return;
    }

    if (!pollingStation) {
      setError("Please select your Polling Station.");
      return;
    }

    if (isOtherStation && !otherStationText.trim()) {
      setError("Please describe your polling station / location.");
      return;
    }

    const finalStation = isOtherStation ? otherStationText.trim() : pollingStation;

    setLoading(true);

    try {
      const response = await fetch("/api/v1/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: cleanPhone,
          ward,
          pollingStation: finalStation,
          isOtherStation,
          occupation: occupation.trim(),
          educationLevel: educationLevel.trim(),
          comment: comment.trim(),
        }),
      });

      const result: ApiResponse<Volunteer> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit registration");
      }

      setSuccessVolunteer(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setPhoneNumber("");
    setWard("");
    setPollingStation("");
    setIsOtherStation(false);
    setOtherStationText("");
    setOccupation("");
    setEducationLevel("");
    setComment("");
    setError(null);
    setSuccessVolunteer(null);
  };

  return (
    <div className="min-h-screen bg-[#f9f8f7] text-[#191414] flex flex-col justify-between pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e6dfdc] px-4 py-2.5">
        <div className="max-w-md lg:max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 overflow-hidden border border-[#e6dfdc] shrink-0 bg-white rounded-sm">
              <img
                src="/images/lmm-logo.jpg"
                alt="Linda Mwananchi Movement"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-tight text-[#191414] leading-none">
                Matungu Volunteer Hub
              </h1>
              <p className="text-[10px] text-[#6b6463] mt-0.5">
                Hon. Shemaiah Kong&apos;ani
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8e524d] bg-[#8e524d]/10 px-2.5 py-0.5 rounded-sm border border-[#8e524d]/25 uppercase tracking-wide">
              2027 &bull; 2028
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md lg:max-w-6xl mx-auto w-full px-3.5 lg:px-6 pt-3 lg:pt-6 flex-1">
        {successVolunteer ? (
          /* Success Receipt Card */
          <div className="ios-card max-w-md lg:max-w-lg mx-auto p-6 mt-3 lg:mt-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#8e524d]/10 text-[#8e524d] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#8e524d] bg-[#8e524d]/10 px-2.5 py-0.5 rounded-sm mb-2">
              Registration Confirmed
            </span>

            <h2 className="text-lg font-bold text-[#191414]">
              Welcome, {successVolunteer.fullName}!
            </h2>
            <p className="text-xs text-[#6b6463] mt-0.5 mb-5">
              You are registered as a volunteer agent for Matungu Constituency (2027 - 2028).
            </p>

            {/* Receipt Summary Details */}
            <div className="bg-[#f4efed] rounded-sm p-3.5 text-left border border-[#e6dfdc] space-y-2.5 mb-5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6b6463]">Ward</span>
                <span className="font-semibold text-[#191414]">{successVolunteer.ward}</span>
              </div>
              <div className="h-px bg-[#e6dfdc]" />
              <div className="flex justify-between items-start text-xs">
                <span className="text-[#6b6463]">Polling Station</span>
                <span className="font-semibold text-[#191414] text-right max-w-[65%]">
                  {successVolunteer.pollingStation}
                  {successVolunteer.isOtherStation && (
                    <span className="text-[#8e524d] text-[10px] block">Not in list</span>
                  )}
                </span>
              </div>
              <div className="h-px bg-[#e6dfdc]" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6b6463]">Phone</span>
                <span className="font-semibold text-[#191414]">{successVolunteer.phoneNumber}</span>
              </div>
              {successVolunteer.occupation && (
                <>
                  <div className="h-px bg-[#e6dfdc]" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6b6463]">Occupation</span>
                    <span className="font-semibold text-[#191414]">{successVolunteer.occupation}</span>
                  </div>
                </>
              )}
              {successVolunteer.educationLevel && (
                <>
                  <div className="h-px bg-[#e6dfdc]" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6b6463]">Education</span>
                    <span className="font-semibold text-[#191414]">{successVolunteer.educationLevel}</span>
                  </div>
                </>
              )}
              <div className="h-px bg-[#e6dfdc]" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6b6463]">Status</span>
                <span className="font-semibold text-[#8e524d] capitalize">
                  {successVolunteer.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleReset}
                className="ios-button-primary cursor-pointer"
              >
                Register Another Volunteer
              </button>

              <Link
                href="/admin"
                className="ios-button-secondary w-full text-xs"
              >
                View Polling Station Team
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          /* Normal Registration: Stacked on mobile, 2-column side-by-side on LG screens */
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
            {/* Left Column (Hero & Geographic Accordion on LG) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Hero Banner */}
              <div className="ios-card overflow-hidden bg-white border border-[#e6dfdc]">
                {/* Image Container */}
                <div className="relative w-full h-[47vh] min-h-[350px] max-h-[520px] lg:h-[440px] bg-[#2a1e1d] overflow-hidden">
                  <img
                    src="/images/candidate.jpg"
                    alt="Hon. Shemaiah S. Kong'ani"
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Subtle contrast gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    {/* Movement Badge */}
                    <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-sm border border-white/20 text-white shadow-sm">
                      <div className="w-4 h-4 overflow-hidden rounded-xs shrink-0">
                        <img
                          src="/images/lmm-logo.jpg"
                          alt="LMM"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-semibold tracking-wide">
                        Linda Mwananchi
                      </span>
                    </div>

                    {/* Year Tag */}
                    <div className="bg-[#8e524d] text-white px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wider uppercase border border-white/20 shadow-sm">
                      2027 &bull; 2028
                    </div>
                  </div>

                  {/* Bottom Floating Info - Light translucent frosted glass */}
                  <div className="absolute bottom-3 inset-x-3 bg-black/30 backdrop-blur-md p-3 rounded-sm border border-white/15 text-white shadow-md">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e6c1bd] drop-shadow-sm">
                      Matungu Constituency
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight mt-0.5 drop-shadow-sm">
                      Hon. Shemaiah S. Kong&apos;ani
                    </h2>
                    <p className="text-[11px] text-white/90 mt-0.5 drop-shadow-sm">
                      Official Volunteer Mobilization Portal
                    </p>
                  </div>
                </div>

                {/* Constituency Stats Strip */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-white text-center border-t border-[#e6dfdc]">
                  <div className="bg-[#f4efed] py-1.5 px-1 rounded-sm border border-[#e6dfdc]">
                    <p className="text-[10px] text-[#6b6463] uppercase font-semibold">Wards</p>
                    <p className="text-xs font-bold text-[#191414]">{matunguWards.length} Wards</p>
                  </div>
                  <div className="bg-[#f4efed] py-1.5 px-1 rounded-sm border border-[#e6dfdc]">
                    <p className="text-[10px] text-[#6b6463] uppercase font-semibold">Centers</p>
                    <p className="text-xs font-bold text-[#191414]">{totalPollingStations} Stations</p>
                  </div>
                </div>
              </div>

              {/* Geographical Mappings - Smooth Accordion */}
              <div className="ios-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowWardsAccordion((prev) => !prev)}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#f4efed] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-sm bg-[#8e524d]/10 text-[#8e524d] flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#191414]">
                        Constituency Wards & Polling Stations
                      </h4>
                      <p className="text-[10px] text-[#6b6463]">
                        {showWardsAccordion
                          ? "Tap to collapse mappings"
                          : `${matunguWards.length} Wards • ${totalPollingStations} Centers (Tap to explore)`}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-1 text-[#6b6463] transition-transform duration-300 ${
                      showWardsAccordion ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Smooth Grid Accordion Content */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    showWardsAccordion
                      ? "grid-rows-[1fr] opacity-100 border-t border-[#e6dfdc]"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-3 space-y-2.5 bg-[#f4efed]">
                      <p className="text-[10px] text-[#6b6463]">
                        Tap any polling center below to pre-select it in the registration form:
                      </p>

                      <div className="space-y-2">
                        {matunguWards.map((w) => (
                          <div
                            key={w.ward}
                            className="bg-white rounded-sm border border-[#e6dfdc] p-2.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-[#191414]">
                                  {w.ward} Ward
                                </p>
                                <p className="text-[10px] text-[#6b6463]">
                                  {w.pollingStations.length} Designated Centers
                                </p>
                              </div>
                            </div>

                            {/* Station Buttons */}
                            <div className="pt-1 border-t border-[#e6dfdc] flex flex-wrap gap-1">
                              {w.pollingStations.map((station) => (
                                <button
                                  key={station}
                                  type="button"
                                  onClick={() => {
                                    setWard(w.ward);
                                    setPollingStation(station);
                                    setIsOtherStation(false);
                                    setOtherStationText("");
                                    window.scrollTo({ top: 120, behavior: "smooth" });
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-sm border transition-all cursor-pointer ${
                                    ward === w.ward && pollingStation === station
                                      ? "bg-[#8e524d] text-white border-[#8e524d] font-semibold"
                                      : "bg-[#f4efed] text-[#191414] border-[#e6dfdc] hover:bg-[#e6dfdc]"
                                  }`}
                                >
                                  {station}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Volunteer Registration Form on LG) */}
            <div className="lg:col-span-7">
              {/* Error Banner */}
              {error && (
                <div className="bg-white border-l-4 border-red-600 text-red-800 p-3 rounded-sm border border-[#e6dfdc] text-xs flex items-start gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#191414]">Notice</p>
                    <p className="text-[#6b6463] mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Registration Form Card */}
              <form onSubmit={handleSubmit} className="ios-card p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="border-b border-[#e6dfdc] pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#191414]">
                        Volunteer Registration
                      </h3>
                      <p className="text-xs text-[#6b6463] mt-0.5">
                        Join the ground mobilization network across Matungu Constituency.
                      </p>
                    </div>
                    <span className="hidden sm:inline-block text-[11px] font-semibold text-[#8e524d] bg-[#8e524d]/10 px-2.5 py-1 rounded-sm border border-[#8e524d]/20">
                      Team Shemaiah
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#191414] mb-1.5">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b6463]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Wycliffe Omwitsa"
                        className="ios-input ios-input-icon !pl-11"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-[#191414] mb-1.5">
                      Mobile Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b6463]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712 345 678 or +254 7..."
                        className="ios-input ios-input-icon !pl-11"
                      />
                    </div>
                    <p className="text-[10px] text-[#6b6463] mt-1 pl-0.5">
                      Used for SMS station alerts and direct WhatsApp coordination.
                    </p>
                  </div>

                  {/* Occupation (Kazi) & Education Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Occupation (Kazi) - Optional */}
                    <div>
                      <label className="block text-xs font-semibold text-[#191414] mb-1.5 flex items-center gap-1.5">
                        <span>Kazi</span>
                        <span className="text-[10px] font-normal text-[#6b6463] line-through decoration-[#8e524d]/50">Occupation</span>
                        <span className="text-[10px] font-normal text-[#6b6463]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b6463]">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="e.g. Teacher, Farmer, Business..."
                          className="ios-input ios-input-icon !pl-11"
                        />
                      </div>
                    </div>

                    {/* Level of Education - Optional */}
                    <div>
                      <label className="block text-xs font-semibold text-[#191414] mb-1.5 flex items-center gap-1.5">
                        <span>Level of Education</span>
                        <span className="text-[10px] font-normal text-[#6b6463]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b6463]">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className="ios-input ios-input-icon ios-select-icon !pl-11 !pr-9 appearance-none bg-white cursor-pointer"
                        >
                          <option value="">-- Choose Level --</option>
                          <option value="Primary School">Primary School (KCPE)</option>
                          <option value="Secondary School">Secondary School (KCSE)</option>
                          <option value="Certificate / TVET">Certificate / TVET</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Undergraduate Degree">Undergraduate Degree (Bachelors)</option>
                          <option value="Postgraduate">Postgraduate (Masters / PhD)</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#6b6463]">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2 Cascading Dropdowns: Ward & Polling Station */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Ward Selection (Dropdown 1) */}
                    <div>
                      <label className="block text-xs font-semibold text-[#191414] mb-1.5">
                        Select Ward <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b6463]">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <select
                          required
                          value={ward}
                          onChange={handleWardChange}
                          className="ios-input ios-input-icon ios-select-icon !pl-11 !pr-9 appearance-none bg-white cursor-pointer"
                        >
                          <option value="">-- Choose Ward --</option>
                          {matunguWards.map((w) => (
                            <option key={w.ward} value={w.ward}>
                              {w.ward} Ward
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#6b6463]">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Polling Station (Dropdown 2 - Cascading) */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-[#191414]">
                          Polling Station <span className="text-red-500">*</span>
                        </label>
                        {selectedWardData && (
                          <span className="text-[10px] text-[#8e524d] font-semibold">
                            {availableStations.length} in {ward}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b6463]">
                          <Vote className="w-4 h-4" />
                        </div>
                        <select
                          required
                          disabled={!ward}
                          value={pollingStation}
                          onChange={handleStationChange}
                          className="ios-input ios-input-icon ios-select-icon !pl-11 !pr-9 appearance-none bg-white cursor-pointer disabled:bg-[#f4efed] disabled:text-[#6b6463] disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {ward
                              ? `-- Choose station in ${ward} --`
                              : "-- Select Ward First --"}
                          </option>
                          {availableStations.map((station) => (
                            <option key={station} value={station}>
                              {station}
                            </option>
                          ))}
                          {ward && (
                            <option value={OTHER_STATION}>
                              ⚠ My station is not listed above
                            </option>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#6b6463]">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* "Other" Station Text Input — shown when user selects "not listed" */}
                  {isOtherStation && (
                    <div className="bg-[#f4efed] border border-[#e6dfdc] rounded-sm p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-[#8e524d] shrink-0 mt-0.5" />
                        <p className="text-[11px] text-[#6b6463]">
                          No problem — please type the name of your polling station or the nearest landmark below. Our team will verify and update your details.
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b6463]">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={otherStationText}
                          onChange={(e) => setOtherStationText(e.target.value)}
                          placeholder="e.g. Lugari Primary, near Matungu Market..."
                          className="ios-input ios-input-icon !pl-11"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Comment / Message - Optional */}
                  <div>
                    <label className="block text-xs font-semibold text-[#191414] mb-1.5 flex items-center gap-1.5">
                      <span>Message / Comment</span>
                      <span className="text-[10px] font-normal text-[#6b6463]">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-[#6b6463]">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Any message or additional information for the team..."
                        rows={3}
                        maxLength={1000}
                        className="ios-input ios-input-icon !pl-11 !pt-2.5 resize-none text-xs"
                      />
                    </div>
                    {comment.length > 0 && (
                      <p className="text-[10px] text-[#6b6463] mt-1 text-right">
                        {comment.length}/1000
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ios-button-primary cursor-pointer disabled:opacity-60 text-sm py-3"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Registration...
                      </span>
                    ) : (
                      <>
                        <span>Join as Volunteer</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-center text-[#6b6463] pt-1">
                  Official volunteer registry for Matungu Constituency &bull; 2027 - 2028.
                </p>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Coordinator Dock */}
      <footer className="max-w-md lg:max-w-lg mx-auto w-full px-3.5 mt-6">
        <div className="bg-white rounded-sm border border-[#e6dfdc] p-1.5 flex items-center justify-around shadow-xs">
          <Link
            href="/"
            className="flex-1 py-1.5 text-center rounded-sm bg-[#8e524d] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            Volunteer Form
          </Link>
          <Link
            href="/admin"
            className="flex-1 py-1.5 text-center rounded-sm text-[#191414] hover:bg-[#f4efed] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#6b6463]" />
            Coordinator Admin
          </Link>
        </div>
        <p className="text-[10px] text-center text-[#6b6463] mt-2.5">
          Matungu Constituency &bull; Team Hon. Shemaiah Kong&apos;ani 2027 - 2028
        </p>
      </footer>
    </div>
  );
}
