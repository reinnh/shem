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
      "Indangalasia Primary School",
      "Musembe Primary School",
      "Ebuchiebe Primary School",
      "Mirere Primary School",
      "Lunganyiro Primary School",
      "Mung'anga Primary School",
      "Onyalo Primary School",
      "St. Polycarp Sianyangu Primary School",
      "Mundobelwa Primary School",
      "Nalwang'a Primary School",
      "Eshiakhulo Primary School",
      "Eshikalame Primary School",
      "Manyala Primary School"
    ]
  },
  {
    ward: "Mayoni",
    registeredVoters: 15352,
    pollingStations: [
      "Matungu Primary School",
      "Mwira Primary School",
      "Mayoni Primary School",
      "Kholera Primary School",
      "Matungu Muslim Primary School",
      "Ekhuya Primary School",
      "Sega Primary School",
      "Makunga Primary School",
      "St. Paul's Shibale Primary School",
      "Mumias Sugar Company Complex Primary School"
    ]
  },
  {
    ward: "Namamali",
    registeredVoters: 15175,
    pollingStations: [
      "Mirere Secondary School",
      "Munami Primary School",
      "Namamali Muslim Primary School",
      "Shianda Primary School",
      "Bunyala Primary School",
      "Eshikulu Primary School",
      "St. Jude's Lung'anyiro Primary School",
      "Namamali AC Primary School",
      "Sango Primary School",
      "Mulembe Primary School",
      "St. Stephen's Shianda Primary School",
      "Eshirombe Primary School",
      "Nzoia Primary School",
      "St. Jacob's Sango Secondary School"
    ]
  },
  {
    ward: "Kholera",
    registeredVoters: 14513,
    pollingStations: [
      "Bulimbo Primary School",
      "Mukhweya Primary School",
      "Makunda Primary School",
      "Namulungu Muslim Primary School",
      "Wamukoya Muslim Primary School",
      "Namasanda Primary School",
      "Eshibanze Primary School",
      "Namulungu AC Primary School",
      "Namalenge Primary School",
      "Khabukoshe Primary School",
      "Shiyabo Primary School",
      "St. Ambrose Eshikhonesi Primary School",
      "Musango Primary School"
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
