import { WardInfo } from "@/types";

export const matunguWards: WardInfo[] = [
  {
    ward: "Koyonzo",
    registeredVoters: 19476,
    pollingStations: [
      "Koyonzo Primary School",
      "Eshirumbwe Primary School",
      "Itete Primary School",
      "St. Paul's Ejinja Primary School",
      "Indangalasia Primary School"
    ]
  },
  {
    ward: "Mayoni",
    registeredVoters: 15352,
    pollingStations: [
      "Matungu Primary School",
      "Mwira Primary School",
      "Mayoni Primary School",
      "Kholera Primary School"
    ]
  },
  {
    ward: "Namamali",
    registeredVoters: 15175,
    pollingStations: [
      "Mirere Primary School",
      "Munami Primary School",
      "Namamali Muslim Primary School"
    ]
  }
];

export const totalConstituencyVoters = matunguWards.reduce(
  (sum, ward) => sum + ward.registeredVoters,
  0
);

export const allPollingStations = matunguWards.flatMap(
  (w) => w.pollingStations.map((station) => ({ ward: w.ward, station }))
);
