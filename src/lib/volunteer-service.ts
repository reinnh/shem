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
    status: doc.status,
    notes: doc.notes,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export async function createVolunteer(input: VolunteerInput): Promise<Volunteer> {
  const mongo = await connectMongo();

  if (mongo) {
    // Check if phone already registered
    const existing = await VolunteerModel.findOne({ phoneNumber: input.phoneNumber });
    if (existing) {
      throw new Error(`Volunteer with phone ${input.phoneNumber} is already registered under ${existing.ward} (${existing.pollingStation}).`);
    }

    const created = await VolunteerModel.create({
      fullName: input.fullName.trim(),
      phoneNumber: input.phoneNumber.trim(),
      ward: input.ward,
      pollingStation: input.pollingStation,
      status: "active",
      notes: input.notes || "",
    });

    return docToVolunteer(created);
  }

  // Fallback in-memory
  const existingMem = inMemoryVolunteers.find((v) => v.phoneNumber === input.phoneNumber.trim());
  if (existingMem) {
    throw new Error(`Volunteer with phone ${input.phoneNumber} is already registered under ${existingMem.ward} (${existingMem.pollingStation}).`);
  }

  const newVolunteer: Volunteer = {
    _id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: input.fullName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    ward: input.ward,
    pollingStation: input.pollingStation,
    status: "active",
    notes: input.notes || "",
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
