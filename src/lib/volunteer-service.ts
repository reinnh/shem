import { connectMongo } from "./mongodb";
import { VolunteerModel, IVolunteer } from "@/models/volunteer";
import { Volunteer, VolunteerInput, VolunteerStats, WardStat } from "@/types";
import { matunguWards, totalConstituencyVoters } from "@/constants/matungu-wards";

// Fallback in-memory storage for resilient local/offline operation
let inMemoryVolunteers: Volunteer[] = [
  {
    _id: "demo-v1",
    fullName: "Wycliffe Omwitsa",
    phoneNumber: "+254712345678",
    ward: "Koyonzo",
    pollingStation: "Koyonzo Primary School",
    status: "verified",
    notes: "Youth mobilize lead",
    occupation: "Teacher",
    comment: "",
    isOtherStation: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    _id: "demo-v2",
    fullName: "Amina Makokha",
    phoneNumber: "+254722987654",
    ward: "Mayoni",
    pollingStation: "Matungu Primary School",
    status: "active",
    notes: "Women representative coordinator",
    occupation: "Business",
    comment: "",
    isOtherStation: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: "demo-v3",
    fullName: "David Baraza",
    phoneNumber: "+254733555111",
    ward: "Namamali",
    pollingStation: "Mirere Primary School",
    status: "verified",
    notes: "Station captain",
    occupation: "Farmer",
    comment: "",
    isOtherStation: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

function docToVolunteer(doc: IVolunteer): Volunteer {
  return {
    _id: (doc._id as unknown as { toString(): string }).toString(),
    fullName: doc.fullName,
    phoneNumber: doc.phoneNumber,
    ward: doc.ward,
    pollingStation: doc.pollingStation,
    isOtherStation: doc.isOtherStation || false,
    occupation: doc.occupation || "",
    comment: doc.comment || "",
    status: doc.status,
    notes: doc.notes,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export function normalizePhoneNumber(raw: string): string {
  // Strip all whitespace, dashes, parentheses
  let cleaned = raw.trim().replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "+254" + cleaned.slice(1);
  } else if (cleaned.startsWith("254") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+") && cleaned.length === 9) {
    cleaned = "+254" + cleaned;
  }
  return cleaned;
}

export async function createVolunteer(input: VolunteerInput): Promise<Volunteer> {
  const normalizedPhone = normalizePhoneNumber(input.phoneNumber);
  const trimmedName = input.fullName.trim();
  const mongo = await connectMongo();

  if (mongo) {
    // 1. Check if phone is already registered (checking canonical, raw, or local variations)
    const rawDigits = input.phoneNumber.replace(/\D/g, "");
    const existingByPhone = await VolunteerModel.findOne({
      $or: [
        { phoneNumber: normalizedPhone },
        { phoneNumber: input.phoneNumber.trim() },
        { phoneNumber: { $regex: new RegExp(rawDigits.slice(-9) + "$") } },
      ],
    });

    if (existingByPhone) {
      throw new Error(
        `A volunteer with phone number ${input.phoneNumber} (${existingByPhone.fullName}) is already registered under ${existingByPhone.ward} Ward (${existingByPhone.pollingStation}). Duplicate entries are not allowed.`
      );
    }

    // 2. Check if identical name is already registered in the same Ward and Polling Station
    const existingByNameAndStation = await VolunteerModel.findOne({
      ward: input.ward,
      pollingStation: input.pollingStation,
      fullName: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (existingByNameAndStation) {
      throw new Error(
        `Volunteer "${trimmedName}" is already registered at ${input.pollingStation} in ${input.ward} Ward. Duplicate submission rejected.`
      );
    }

    try {
      const created = await VolunteerModel.create({
        fullName: trimmedName,
        phoneNumber: normalizedPhone,
        ward: input.ward,
        pollingStation: input.pollingStation,
        isOtherStation: input.isOtherStation || false,
        occupation: input.occupation?.trim() || "",
        comment: input.comment?.trim() || "",
        status: "active",
        notes: input.notes?.trim() || "",
      });

      return docToVolunteer(created);
    } catch (dbErr: unknown) {
      // Catch MongoDB unique constraint error E11000
      const err = dbErr as { code?: number; message?: string };
      if (err.code === 11000) {
        throw new Error(`Phone number ${normalizedPhone} is already registered in the system. Duplicate entries are not allowed.`);
      }
      throw dbErr;
    }
  }

  // Fallback in-memory duplicate validation
  const existingMemPhone = inMemoryVolunteers.find(
    (v) =>
      normalizePhoneNumber(v.phoneNumber) === normalizedPhone ||
      v.phoneNumber.replace(/\D/g, "").slice(-9) === input.phoneNumber.replace(/\D/g, "").slice(-9)
  );

  if (existingMemPhone) {
    throw new Error(
      `A volunteer with phone number ${input.phoneNumber} (${existingMemPhone.fullName}) is already registered under ${existingMemPhone.ward} Ward (${existingMemPhone.pollingStation}). Duplicate entries are not allowed.`
    );
  }

  const existingMemNameStation = inMemoryVolunteers.find(
    (v) =>
      v.ward === input.ward &&
      v.pollingStation === input.pollingStation &&
      v.fullName.toLowerCase() === trimmedName.toLowerCase()
  );

  if (existingMemNameStation) {
    throw new Error(
      `Volunteer "${trimmedName}" is already registered at ${input.pollingStation} in ${input.ward} Ward. Duplicate submission rejected.`
    );
  }

  const newVolunteer: Volunteer = {
    _id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: trimmedName,
    phoneNumber: normalizedPhone,
    ward: input.ward,
    pollingStation: input.pollingStation,
    isOtherStation: input.isOtherStation || false,
    occupation: input.occupation?.trim() || "",
    comment: input.comment?.trim() || "",
    status: "active",
    notes: input.notes?.trim() || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryVolunteers.unshift(newVolunteer);
  return newVolunteer;
}

export async function getVolunteers(filter?: {
  ward?: string;
  pollingStation?: string;
  search?: string;
  status?: string;
}): Promise<Volunteer[]> {
  const mongo = await connectMongo();

  if (mongo) {
    const query: Record<string, unknown> = {};
    if (filter?.ward && filter.ward !== "ALL") {
      query.ward = filter.ward;
    }
    if (filter?.pollingStation && filter.pollingStation !== "ALL") {
      query.pollingStation = filter.pollingStation;
    }
    if (filter?.status && filter.status !== "ALL") {
      query.status = filter.status;
    }
    if (filter?.search) {
      const searchRegex = new RegExp(filter.search.trim(), "i");
      query.$or = [{ fullName: searchRegex }, { phoneNumber: searchRegex }];
    }

    const docs = await VolunteerModel.find(query).sort({ createdAt: -1 }).limit(1000);
    return docs.map(docToVolunteer);
  }

  // Fallback
  let results = [...inMemoryVolunteers];

  if (filter?.ward && filter.ward !== "ALL") {
    results = results.filter((v) => v.ward === filter.ward);
  }
  if (filter?.pollingStation && filter.pollingStation !== "ALL") {
    results = results.filter((v) => v.pollingStation === filter.pollingStation);
  }
  if (filter?.status && filter.status !== "ALL") {
    results = results.filter((v) => v.status === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    results = results.filter(
      (v) =>
        v.fullName.toLowerCase().includes(q) ||
        v.phoneNumber.toLowerCase().includes(q)
    );
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteVolunteer(id: string): Promise<boolean> {
  const mongo = await connectMongo();

  if (mongo) {
    const res = await VolunteerModel.findByIdAndDelete(id);
    return !!res;
  }

  const initialLen = inMemoryVolunteers.length;
  inMemoryVolunteers = inMemoryVolunteers.filter((v) => v._id !== id);
  return inMemoryVolunteers.length < initialLen;
}

export async function updateVolunteerStatus(
  id: string,
  status: "verified" | "active" | "flagged"
): Promise<Volunteer | null> {
  const mongo = await connectMongo();

  if (mongo) {
    const updated = await VolunteerModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return updated ? docToVolunteer(updated) : null;
  }

  const found = inMemoryVolunteers.find((v) => v._id === id);
  if (found) {
    found.status = status;
    found.updatedAt = new Date().toISOString();
    return { ...found };
  }
  return null;
}

export async function getVolunteerStatistics(): Promise<VolunteerStats> {
  const all = await getVolunteers();

  const wardStats: WardStat[] = matunguWards.map((ward) => {
    const wardVolunteers = all.filter((v) => v.ward === ward.ward);
    const stationBreakdown: { [station: string]: number } = {};

    ward.pollingStations.forEach((st) => {
      stationBreakdown[st] = wardVolunteers.filter(
        (v) => v.pollingStation === st
      ).length;
    });

    return {
      ward: ward.ward,
      registeredVoters: ward.registeredVoters,
      volunteerCount: wardVolunteers.length,
      stationBreakdown,
    };
  });

  const activeCount = all.filter((v) => v.status === "active").length;
  const verifiedCount = all.filter((v) => v.status === "verified").length;

  // Volunteers in the last 24h
  const oneDayAgo = Date.now() - 24 * 3600 * 1000;
  const recentCount = all.filter(
    (v) => new Date(v.createdAt).getTime() >= oneDayAgo
  ).length;

  return {
    totalVolunteers: all.length,
    totalRegisteredVoters: totalConstituencyVoters,
    wardStats,
    activeCount,
    verifiedCount,
    recentCount,
  };
}
