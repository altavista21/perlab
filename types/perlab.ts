export const BANSOS_TYPES = [
  "BPNT",
  "PKH",
  "KIP",
  "SUBSIDI_LISTRIK",
  "SUBSIDI_BBM",
  "SUBSIDI_GAS",
  "LANSIA"
] as const;

export type BansosType = (typeof BANSOS_TYPES)[number];

export type ApplicationStatus =
  | "PENDING"
  | "LAYAK"
  | "TIDAK_LAYAK"
  | "MENUNGGU_VERIFIKASI_AGEN";

export type DayaListrik = "450VA" | "900VA" | "1300VA" | "2200VA" | ">2200VA";

export interface SanggahData {
  hartaBergerak: number;
  hartaTidakBergerak: number;
  alasan: string;
  submittedAt: string;
}

export interface PayoutDetail {
  phone: string;
  bankName: string;
  accountNumber: string;
}

export interface UserProfile {
  nik: string;
  nama: string;
  alamat: string;
  dayaListrik: DayaListrik;
  jumlahMotor: number;
  jumlahMobil: number;
  hasSchoolMember: boolean;
  hasElderlyMember: boolean;
  selectedBansos: BansosType[];
  status: ApplicationStatus;
  sanggahData?: SanggahData;
  payoutDetail?: PayoutDetail;
}

export interface AgentProfile {
  nip: string;
  nama: string;
  wilayahTugas: string;
}
