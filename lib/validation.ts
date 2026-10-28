import { z } from "zod";

export const nikSchema = z.string().regex(/^\d{16}$/, "NIK demo harus berisi 16 digit angka.");
export const nipSchema = z.string().regex(/^\d{18}$/, "NIP demo harus berisi 18 digit angka.");

export const assessmentSchema = z.object({
  dayaListrik: z.enum(["450VA", "900VA", "1300VA", "2200VA", ">2200VA"]),
  jumlahMotor: z.coerce.number().int().min(0).max(99),
  jumlahMobil: z.coerce.number().int().min(0).max(99),
  hasSchoolMember: z.boolean(),
  hasElderlyMember: z.boolean(),
  selectedBansos: z.array(z.enum([
    "BPNT", "PKH", "KIP", "SUBSIDI_LISTRIK", "SUBSIDI_BBM", "SUBSIDI_GAS", "LANSIA"
  ])).min(1, "Pilih setidaknya satu program.")
});

export const sanggahSchema = z.object({
  hartaBergerak: z.coerce.number().finite().min(0).max(1_000_000_000_000),
  hartaTidakBergerak: z.coerce.number().finite().min(0).max(1_000_000_000_000),
  alasan: z.string().trim().min(10).max(2000)
});
