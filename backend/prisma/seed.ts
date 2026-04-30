import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: "SUPER_ADMIN", nameBm: "Pentadbir sistem", nameEn: "Super admin" },
    { code: "MOSQUE_ADMIN", nameBm: "Pentadbir masjid", nameEn: "Mosque admin" },
    { code: "AUTHORITY_OFFICER", nameBm: "Pegawai majlis", nameEn: "Authority officer" },
    { code: "REGISTERED_USER", nameBm: "Pengguna berdaftar", nameEn: "Registered user" },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      create: r,
      update: { nameBm: r.nameBm, nameEn: r.nameEn },
    });
  }

  const sgr = await prisma.state.upsert({
    where: { code: "MY-10" },
    create: { code: "MY-10", nameBm: "Selangor", nameEn: "Selangor" },
    update: {},
  });
  const wly = await prisma.state.upsert({
    where: { code: "MY-14" },
    create: { code: "MY-14", nameBm: "Wilayah Persekutuan", nameEn: "Federal Territory" },
    update: {},
  });

  const dPetaling = await prisma.district.upsert({
    where: { id: "seed-district-petaling" },
    create: {
      id: "seed-district-petaling",
      stateId: sgr.id,
      nameBm: "Petaling",
      nameEn: "Petaling",
    },
    update: {},
  });

  const dWp = await prisma.district.upsert({
    where: { id: "seed-district-wpkl" },
    create: {
      id: "seed-district-wpkl",
      stateId: wly.id,
      nameBm: "Kuala Lumpur",
      nameEn: "Kuala Lumpur",
    },
    update: {},
  });

  const zoneSgr = await prisma.prayerZone.upsert({
    where: { stateId_zoneCode: { stateId: sgr.id, zoneCode: "SGR01" } },
    create: {
      stateId: sgr.id,
      zoneCode: "SGR01",
      zoneNameBm: "Zon Petaling (contoh)",
      zoneNameEn: "Petaling sample zone",
      districtsCovered: "Petaling",
    },
    update: {},
  });

  const zoneWly = await prisma.prayerZone.upsert({
    where: { stateId_zoneCode: { stateId: wly.id, zoneCode: "WLY01" } },
    create: {
      stateId: wly.id,
      zoneCode: "WLY01",
      zoneNameBm: "Zon WP Kuala Lumpur (contoh)",
      zoneNameEn: "WP KL sample zone",
      districtsCovered: "Kuala Lumpur",
    },
    update: {},
  });

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const d0 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12));

  const batch = await prisma.importBatch.create({
    data: { type: "PRAYER_TIMES", status: "COMPLETED", rowCount: 2 },
  });

  const times = [
    { zoneId: zoneSgr.id, date: d0, subuh: "05:52", syuruk: "07:08", zohor: "13:15", asar: "16:28", maghrib: "19:22", isyak: "20:32" },
    { zoneId: zoneWly.id, date: d0, subuh: "05:54", syuruk: "07:10", zohor: "13:16", asar: "16:29", maghrib: "19:23", isyak: "20:33" },
  ];
  for (const t of times) {
    await prisma.prayerTime.upsert({
      where: { zoneId_date: { zoneId: t.zoneId, date: t.date } },
      create: { ...t, source: "IMPORTED", importBatchId: batch.id },
      update: {
        subuh: t.subuh,
        syuruk: t.syuruk,
        zohor: t.zohor,
        asar: t.asar,
        maghrib: t.maghrib,
        isyak: t.isyak,
        importBatchId: batch.id,
      },
    });
  }

  const masjidKl = await prisma.mosque.upsert({
    where: { id: "seed-mosque-mn" },
    create: {
      id: "seed-mosque-mn",
      type: "MASJID",
      nameBm: "Masjid Negara (contoh data)",
      nameEn: "National Mosque (sample)",
      addressLine1: "Jalan Perdana",
      postcode: "50480",
      districtId: dWp.id,
      stateId: wly.id,
      latitude: 3.1417,
      longitude: 101.6915,
      phone: "03-2383 9288",
      websiteUrl: "https://www.masjidnegara.gov.my",
      malePrayerCapacity: 15000,
      femalePrayerCapacity: 4000,
      parkingCapacity: 800,
      facilitiesJson: ["Wuduk", "OKU", "Tempat letak kereta", "Ruang solat wanita"],
      okuAccess: true,
      khairatAvailable: true,
      publicStatus: "ACTIVE",
      prayerZoneId: zoneWly.id,
    },
    update: {
      prayerZoneId: zoneWly.id,
      publicStatus: "ACTIVE",
    },
  });

  const surauShahAlam = await prisma.mosque.upsert({
    where: { id: "seed-mosque-sa" },
    create: {
      id: "seed-mosque-sa",
      type: "SURAU",
      nameBm: "Surau Al-Hidayah (contoh)",
      nameEn: "Al-Hidayah Surau (sample)",
      addressLine1: "Seksyen 7",
      postcode: "40000",
      districtId: dPetaling.id,
      stateId: sgr.id,
      latitude: 3.0733,
      longitude: 101.5185,
      malePrayerCapacity: 120,
      femalePrayerCapacity: 80,
      parkingCapacity: 40,
      facilitiesJson: ["Wuduk", "Ruang solat wanita"],
      okuAccess: false,
      khairatAvailable: false,
      publicStatus: "ACTIVE",
      prayerZoneId: zoneSgr.id,
    },
    update: { publicStatus: "ACTIVE", prayerZoneId: zoneSgr.id },
  });

  await prisma.mosqueJamaatTime.upsert({
    where: { mosqueId_date: { mosqueId: masjidKl.id, date: d0 } },
    create: {
      mosqueId: masjidKl.id,
      date: d0,
      zohor: "13:30",
      asar: "16:35",
      maghrib: "19:12",
      isyak: "20:45",
    },
    update: {},
  });

  const superRole = await prisma.role.findUniqueOrThrow({ where: { code: "SUPER_ADMIN" } });
  const regRole = await prisma.role.findUniqueOrThrow({ where: { code: "REGISTERED_USER" } });
  const mosqueRole = await prisma.role.findUniqueOrThrow({ where: { code: "MOSQUE_ADMIN" } });
  const hash = await bcrypt.hash("Imarah2026!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@imarah.local" },
    create: {
      email: "admin@imarah.local",
      passwordHash: hash,
      fullName: "Pentadbir IMARAH",
      languagePref: "ms",
      roles: { create: [{ roleId: superRole.id }] },
    },
    update: { passwordHash: hash },
  });

  await prisma.user.upsert({
    where: { email: "demo@imarah.local" },
    create: {
      email: "demo@imarah.local",
      passwordHash: hash,
      fullName: "Pengguna Demo",
      languagePref: "ms",
      roles: { create: [{ roleId: regRole.id }] },
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "masjid-admin@imarah.local" },
    create: {
      email: "masjid-admin@imarah.local",
      passwordHash: hash,
      fullName: "Pentadbir Masjid Negara",
      languagePref: "ms",
      roles: { create: [{ roleId: mosqueRole.id, mosqueId: masjidKl.id }] },
    },
    update: { passwordHash: hash },
  });

  await prisma.mosque.upsert({
    where: { id: "seed-mosque-pending" },
    create: {
      id: "seed-mosque-pending",
      type: "MASJID",
      nameBm: "Masjid Belum Diluluskan (contoh)",
      nameEn: "Pending mosque (hidden from public)",
      addressLine1: "Jalan Contoh",
      postcode: "50000",
      districtId: dWp.id,
      stateId: wly.id,
      latitude: 3.15,
      longitude: 101.7,
      publicStatus: "PENDING",
      prayerZoneId: zoneWly.id,
    },
    update: { publicStatus: "PENDING" },
  });

  console.log("Seed OK:", { admin: admin.email, masjidKl: masjidKl.id, surauShahAlam: surauShahAlam.id, isoDate: iso(d0) });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
