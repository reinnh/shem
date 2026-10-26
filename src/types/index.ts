export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
}

export interface WardInfo {
  ward: string;
  registeredVoters: number;
  pollingStations: string[];
}

export interface Volunteer {
  _id: string;
  fullName: string;
  phoneNumber: string;
  ward: string;
  pollingStation: string;
  isOtherStation?: boolean;
  occupation?: string;
  educationLevel?: string;
  comment?: string;
  status: "verified" | "active" | "flagged";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerInput {
  fullName: string;
  phoneNumber: string;
  ward: string;
  pollingStation: string;
  isOtherStation?: boolean;
  occupation?: string;
  educationLevel?: string;
  comment?: string;
  notes?: string;
}

export interface WardStat {
  ward: string;
  registeredVoters: number;
  volunteerCount: number;
  stationBreakdown: { [station: string]: number };
}

export interface VolunteerStats {
  totalVolunteers: number;
  totalRegisteredVoters: number;
  wardStats: WardStat[];
  activeCount: number;
  verifiedCount: number;
  recentCount: number;
}
