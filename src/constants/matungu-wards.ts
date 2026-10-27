import { WardInfo } from "@/types";

export const matunguWards: WardInfo[] = [
  {
    ward: "Koyonzo",
    registeredVoters: 19476,
    pollingStations: [
      "Koyonzo Special Sch. for the V.I.",
      "Ikulumbyo",
      "Ogalo Market",
      "Nyamalula",
      "Emuberi",
      "Nyapora",
      "Nanyeni",
      "Ebutaliko",
      "Eshirumbwe",
      "Indangalasia",
      "Itete",
      "Sayangwe",
      "Ejinja",
      "Ngairwe",
      "Koyonzo",
      "St. Paul's Ejinja",
      "Eshikhondi"
    ]
  },
  {
    ward: "Mayoni",
    registeredVoters: 15352,
    pollingStations: [
      "St. Benedicts Buloma",
      "Bukasia",
      "Chibanga",
      "Munange",
      "Ebubambula",
      "Bumwalo",
      "Matungu",
      "Emakale",
      "Emanani",
      "Mwira",
      "Mayoni",
      "Marinda",
      "Kholera"
    ]
  },
  {
    ward: "Namamali",
    registeredVoters: 15175,
    pollingStations: [
      "Vuwo Primary",
      "Bulanda Primary",
      "Namange",
      "Mungakha",
      "Namamali Muslim",
      "Mirere",
      "Mukunyuka",
      "Namalasire",
      "Namayikalo",
      "Nyapwaka",
      "Nambanekega",
      "Mungore Primary",
      "Munami",
      "Lubanga",
      "Lunganyiro",
      "Kadima"
    ]
  },
  {
    ward: "Kholera",
    registeredVoters: 14513,
    pollingStations: [
      "Musango",
      "St. Ambrose Eshikhonesi",
      "Wamukoya Muslim",
      "Namasanda",
      "Namalenge",
      "Namulungu Muslim",
      "Namulungu AC",
      "Mukhweya",
      "Khabukoshe",
      "Shiyabo",
      "Eshibanze",
      "Bulimbo",
      "Makunda"
    ]
  },
  {
    ward: "Khalaba",
    registeredVoters: 9414,
    pollingStations: [
      "Namamba Primary School",
      "Busombi Primary School",
      "Khalaba Primary School",
      "Makokhwe Primary School",
      "Lutasio Primary School",
      "Busambe Primary School",
      "Bulonga Primary School",
      "Kandai Primary School",
      "Mabolo Primary School",
      "ACK Malanga Primary School"
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

export const totalPollingStations = allPollingStations.length;
export const totalLandmarks = totalPollingStations;
