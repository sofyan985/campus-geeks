import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { addDays, campusDayIndex, fromCampusLocal, startOfDay, toInputValue } from "../src/lib/format";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
if (process.env.ALLOW_SEED_RESET !== "1") {
  throw new Error(
    "The seed wipes every table. Set ALLOW_SEED_RESET=1 to confirm you want to reset this database.",
  );
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const IMAGES = {
  cinema: img("photo-1489599849927-2ee91cede3ba"),
  projector: img("photo-1478720568477-152d9b164e26"),
  auditorium: img("photo-1601758124510-52d02ddb7cbd"),
  football: img("photo-1574629810360-7efbbe195018"),
  futsalGoal: img("photo-1760174034302-e4e8177569ff"),
  futsalNight: img("photo-1517927033932-b3d18e61fb3a"),
  track: img("photo-1461896836934-ffe607ba8211"),
  runners: img("photo-1552674605-db6ffd4facb5"),
  basketball: img("photo-1546519638-68e109498ffc"),
  cricket: img("photo-1540747913346-19e32dc3e97e"),
  gym: img("photo-1574680096145-d05b474e2155"),
  cycling: img("photo-1517649763962-0c623066013b"),
  mountains: img("photo-1506905925346-21bda4d32df4"),
  ridge: img("photo-1470071459604-3b5ec3a7fe05"),
  climbing: img("photo-1564769662533-4f00a87b4056"),
  city: img("photo-1471306224500-6d0d218be372"),
  concert: img("photo-1470229722913-7c0e2dbbafd3"),
  stageLights: img("photo-1516450360452-9312f5e86fc7"),
  guitars: img("photo-1511379938547-c1f69419868d"),
  guitarHands: img("photo-1510915361894-db8b60106cb1"),
  microphone: img("photo-1516280440614-37939bbacd81"),
  dancer: img("photo-1547153760-18fc86324498"),
  paint: img("photo-1513364776144-60967b0f800f"),
  ink: img("photo-1541701494587-cb58502866ab"),
  textures: img("photo-1536924940846-227afb31e2a5"),
  craft: img("photo-1552674605-db6ffd4facb5"),
  pottery: img("photo-1565193566173-7a0ee3dbe261"),
  ceramics: img("photo-1610701596007-11502861dcfa"),
  illustration: img("photo-1452860606245-08befc0ff44b"),
  camera: img("photo-1607462109225-6b64ae2dd3cb"),
  circuit: img("photo-1518770660439-4636190af475"),
  code: img("photo-1581094794329-c8112a89af12"),
  codeDark: img("photo-1607799279861-4dd421887fb3"),
  lecture: img("photo-1524178232363-1fb2b075b655"),
  stickyNotes: img("photo-1552664730-d307ca884978"),
  laptops: img("photo-1519389950473-47ba0277781c"),
  esports: img("photo-1542751371-adc38448a05e"),
  chess: img("photo-1528819622765-d6bcf132f793"),
  dining: img("photo-1528605248644-14dd04022da1"),
  food: img("photo-1567593810070-7a3d471af022"),
  hands: img("photo-1582213782179-e0d53f98f2ca"),
  crowdOutdoor: img("photo-1531928351158-2f736078e0a1"),
  conference: img("photo-1523580494863-6f3031224c94"),
  coworking: img("photo-1531482615713-2afd69097998"),
};

function at(dayOffset: number, hour: number, minute = 0) {
  const day = addDays(startOfDay(new Date()), dayOffset);
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return fromCampusLocal(toInputValue(day), time)!;
}

/** Offset (in days from today) of the next occurrence of a weekday. 0 = Sunday. */
function nextWeekday(weekday: number, weeksAhead = 0) {
  const diff = (weekday - campusDayIndex(new Date()) + 7) % 7;
  return diff + weeksAhead * 7;
}

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoomMember.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.sportsMatch.deleteMany();
  await prisma.tournamentTeam.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.event.deleteMany();
  await prisma.society.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("campus1234", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Amina Raza",
      email: "admin@uetpeshawar.edu.pk",
      passwordHash: password,
      role: "ADMIN",
      department: "Student Affairs",
      interests: "sports,music,trips",
    },
  });

  const organizer = await prisma.user.create({
    data: {
      name: "Hamza Iqbal",
      email: "organizer@uetpeshawar.edu.pk",
      passwordHash: password,
      role: "ORGANIZER",
      department: "Computer Science",
      semester: "Semester 5",
      interests: "technology,gaming,sports",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Zara Ahmed",
      email: "student@uetpeshawar.edu.pk",
      passwordHash: password,
      role: "STUDENT",
      department: "Software Engineering",
      semester: "Semester 3",
      interests: "art,movies,trips,music",
    },
  });

  const societies = await Promise.all(
    [
      {
        slug: "computer-society",
        name: "Computer Society",
        shortName: "CS Soc",
        description:
          "Hackathons, coding nights, movie screenings and the loudest LAN parties on campus. Run by students from the CS and SE departments.",
        accent: "#4CC9F0",
        logoImage: IMAGES.circuit,
        instagram: "@cs.society",
        email: "cssociety@uetpeshawar.edu.pk",
      },
      {
        slug: "robotics-society",
        name: "Robotics Society",
        shortName: "Robotics",
        description:
          "Build bots, break bots, repeat. Arduino bootcamps, line-following races and the annual robo-futsal showdown.",
        accent: "#7C5CFF",
        logoImage: IMAGES.codeDark,
        instagram: "@robotics.campus",
        email: "robotics@uetpeshawar.edu.pk",
      },
      {
        slug: "music-society",
        name: "Music Society",
        shortName: "Music Soc",
        description:
          "Open mics, jam rooms, rooftop listening parties and the semester concert. Bring an instrument or just bring your voice.",
        accent: "#F0409C",
        logoImage: IMAGES.guitars,
        instagram: "@music.campus",
        email: "music@uetpeshawar.edu.pk",
      },
      {
        slug: "fine-arts-society",
        name: "Fine Arts Society",
        shortName: "Fine Arts",
        description:
          "Painting, pottery, texture art, crochet and calligraphy. The studio is open late and the mess is part of the process.",
        accent: "#FFD166",
        logoImage: IMAGES.paint,
        instagram: "@finearts.campus",
        email: "finearts@uetpeshawar.edu.pk",
      },
      {
        slug: "adventure-club",
        name: "Adventure Club",
        shortName: "Adventure",
        description:
          "Hikes, treks, lake days and 6 AM departures from the main gate. Transport, guides and food sorted.",
        accent: "#FF8A3D",
        logoImage: IMAGES.ridge,
        instagram: "@adventure.campus",
        email: "adventure@uetpeshawar.edu.pk",
      },
      {
        slug: "sports-board",
        name: "Sports Board",
        shortName: "Sports Board",
        description:
          "Every inter-semester, inter-department and inter-hostel fixture on campus is organised here.",
        accent: "#31E981",
        logoImage: IMAGES.football,
        instagram: "@sportsboard.campus",
        email: "sports@uetpeshawar.edu.pk",
      },
      {
        slug: "film-club",
        name: "Film Club",
        shortName: "Film Club",
        description:
          "Weekly screenings in the auditorium, documentary nights and a short film festival every spring.",
        accent: "#E23C3C",
        logoImage: IMAGES.cinema,
        instagram: "@filmclub.campus",
        email: "film@uetpeshawar.edu.pk",
      },
      {
        slug: "literary-society",
        name: "Literary Society",
        shortName: "Lit Soc",
        description:
          "Debates, spoken word, quiz nights and the campus magazine. Words, arguments and very strong tea.",
        accent: "#B892FF",
        logoImage: IMAGES.conference,
        instagram: "@litsoc.campus",
        email: "litsoc@uetpeshawar.edu.pk",
      },
    ].map((data) => prisma.society.create({ data })),
  );

  const bySlug = Object.fromEntries(societies.map((society) => [society.slug, society]));

  const form = (id: string) => `https://docs.google.com/forms/d/e/${id}/viewform`;

  type EventSeed = {
    slug: string;
    title: string;
    subtitle?: string;
    description: string;
    category: string;
    tag?: string;
    coverImage: string;
    startAt: Date;
    endAt?: Date;
    venue: string;
    campusLocation?: string;
    capacity?: number;
    participantCount?: number;
    cost?: number;
    costNote?: string;
    eligibility?: string;
    registrationRequired?: boolean;
    googleFormUrl?: string;
    organizerName: string;
    contactInfo?: string;
    society?: string;
    status?: string;
    featured?: boolean;
    interest?: number;
    createdById?: string;
    tripDeparture?: string;
    tripReturn?: string;
    tripDeparturePoint?: string;
    tripIncluded?: string;
    tripBring?: string;
    match?: {
      sport: string;
      teamA: string;
      teamB: string;
      teamAMeta?: string;
      teamBMeta?: string;
      matchType?: string;
      scoreA?: number;
      scoreB?: number;
      round?: string;
    };
  };

  const events: EventSeed[] = [
    {
      slug: "movie-night-interstellar",
      title: "Interstellar",
      subtitle: "Movie Night",
      description:
        "The Film Club rolls out the big screen for Nolan's Interstellar. Doors open at 7:30 PM, projector starts at 8:00 PM sharp. Popcorn and chai from the cafeteria counter outside the auditorium. Bring a hoodie, the AC is merciless.",
      category: "movies",
      tag: "Movie night",
      coverImage: IMAGES.cinema,
      startAt: at(nextWeekday(5), 20),
      endAt: at(nextWeekday(5), 23),
      venue: "University Auditorium",
      campusLocation: "Academic Block A",
      capacity: 120,
      participantCount: 85,
      cost: 0,
      eligibility: "Open to all students with a valid campus card",
      googleFormUrl: form("1FAIpQLSc-movie-night"),
      organizerName: "Film Club",
      contactInfo: "film@uetpeshawar.edu.pk",
      society: "film-club",
      status: "APPROVED",
      featured: true,
      interest: 214,
    },
    {
      slug: "texture-art-workshop",
      title: "Texture Art Workshop",
      subtitle: "Mixed materials, thick paint, no rules",
      description:
        "Learn texture painting using modelling paste, sand, jute and palette knives. All materials provided, including a 12x16 canvas you take home. No experience needed — the first hour is technique, the rest is your own piece.",
      category: "art",
      tag: "Texture art",
      coverImage: IMAGES.textures,
      startAt: at(nextWeekday(1), 15),
      endAt: at(nextWeekday(1), 18),
      venue: "Art Studio",
      campusLocation: "Design Block, Floor 2",
      capacity: 20,
      participantCount: 16,
      cost: 800,
      costNote: "Includes canvas and all materials",
      googleFormUrl: form("1FAIpQLSc-texture-art"),
      organizerName: "Fine Arts Society",
      contactInfo: "finearts@uetpeshawar.edu.pk",
      society: "fine-arts-society",
      status: "APPROVED",
      featured: true,
      interest: 96,
    },
    {
      slug: "semester-2-vs-semester-4-futsal",
      title: "Semester 2 vs Semester 4",
      subtitle: "Futsal · 5v5",
      description:
        "Midweek 5v5 futsal under the lights. Two halves of 20 minutes, rolling subs, referee from the Sports Board. Squad lists close the night before the match.",
      category: "sports",
      tag: "Futsal 5v5",
      coverImage: IMAGES.futsalGoal,
      startAt: at(nextWeekday(3), 16),
      endAt: at(nextWeekday(3), 18),
      venue: "Futsal Court",
      campusLocation: "Sports Complex",
      capacity: 24,
      participantCount: 21,
      googleFormUrl: form("1FAIpQLSc-futsal-s2-s4"),
      organizerName: "Sports Board",
      society: "sports-board",
      status: "APPROVED",
      interest: 143,
      match: {
        sport: "Futsal",
        teamA: "Semester 2",
        teamB: "Semester 4",
        teamAMeta: "Computer Science",
        teamBMeta: "Computer Science",
        matchType: "FRIENDLY",
      },
    },
    {
      slug: "open-mic-night",
      title: "Open Mic Night",
      subtitle: "Five minutes each, anything goes",
      description:
        "Poetry, stand-up, acoustic sets, that one song you have been practising in the hostel corridor. Sign-up sheet opens 30 minutes before. House guitar, cajon and two mics available.",
      category: "music",
      tag: "Open mic",
      coverImage: IMAGES.microphone,
      startAt: at(nextWeekday(6), 19, 30),
      endAt: at(nextWeekday(6), 22),
      venue: "Campus Courtyard",
      campusLocation: "Outside the Library",
      capacity: 150,
      participantCount: 64,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-open-mic"),
      organizerName: "Music Society",
      society: "music-society",
      status: "APPROVED",
      featured: true,
      interest: 178,
    },
    {
      slug: "mukshpuri-hike",
      title: "Mukshpuri Hike",
      subtitle: "Nathia Gali · 2,800m",
      description:
        "A full day on the Mukshpuri trail starting from Dunga Gali. Roughly 4 km of ascent through pine forest, lunch at the top, back on the bus by late afternoon. Moderate difficulty — if you can walk for three hours you can do this.",
      category: "trips",
      tag: "Hiking",
      coverImage: IMAGES.ridge,
      startAt: at(nextWeekday(0), 6),
      endAt: at(nextWeekday(0), 21),
      venue: "Mukshpuri Top, Nathia Gali",
      campusLocation: "Departs University Main Gate",
      capacity: 40,
      participantCount: 32,
      cost: 2500,
      costNote: "Per person, paid at the Adventure Club desk",
      eligibility: "Students and faculty. Under 18s need a signed consent form.",
      googleFormUrl: form("1FAIpQLSc-mukshpuri"),
      organizerName: "Adventure Club",
      contactInfo: "adventure@uetpeshawar.edu.pk · 0300 1234567",
      society: "adventure-club",
      status: "APPROVED",
      featured: true,
      interest: 302,
      tripDeparture: "6:00 AM",
      tripReturn: "9:00 PM",
      tripDeparturePoint: "University Main Gate",
      tripIncluded: "Transportation, Certified guide, Breakfast and lunch, First aid kit, Entry tickets",
      tripBring: "Water (2 litres), Comfortable shoes, Jacket, Cap, Personal medication",
    },
    {
      slug: "ai-hackathon-36",
      title: "AI Hackathon 36",
      subtitle: "36 hours · 4 tracks · Rs. 150,000 prize pool",
      description:
        "Build anything with an AI core: campus tooling, health, agriculture, accessibility. Teams of up to four. Mentors from three product companies float through the night. Judging at 6 PM on day two.",
      category: "technology",
      tag: "Hackathon",
      coverImage: IMAGES.code,
      startAt: at(nextWeekday(6, 1), 9),
      endAt: at(nextWeekday(0, 2), 21),
      venue: "Innovation Lab",
      campusLocation: "CS Block, Ground Floor",
      capacity: 100,
      participantCount: 88,
      cost: 500,
      costNote: "Per team, covers meals for 36 hours",
      eligibility: "Teams of 2-4, any department",
      googleFormUrl: form("1FAIpQLSc-ai-hackathon"),
      organizerName: "Computer Society",
      contactInfo: "cssociety@uetpeshawar.edu.pk",
      society: "computer-society",
      status: "APPROVED",
      featured: true,
      interest: 265,
      createdById: organizer.id,
    },
    {
      slug: "pottery-studio-session",
      title: "Pottery Studio Session",
      subtitle: "Wheel throwing for beginners",
      description:
        "Four wheels, two hours, one very patient instructor. You will centre clay, pull a wall and probably collapse your first three attempts. Pieces are fired and returned the following week.",
      category: "art",
      tag: "Pottery",
      coverImage: IMAGES.pottery,
      startAt: at(nextWeekday(2), 16),
      endAt: at(nextWeekday(2), 18),
      venue: "Ceramics Studio",
      campusLocation: "Design Block, Basement",
      capacity: 12,
      participantCount: 12,
      cost: 1200,
      googleFormUrl: form("1FAIpQLSc-pottery"),
      organizerName: "Fine Arts Society",
      society: "fine-arts-society",
      status: "APPROVED",
      interest: 74,
    },
    {
      slug: "semester-1-vs-semester-3-football",
      title: "Semester 1 vs Semester 3",
      subtitle: "Football",
      description:
        "The first inter-semester fixture of the season on the main ground. 11-a-side, two halves of 35 minutes. Stands open, bring noise.",
      category: "sports",
      tag: "Football",
      coverImage: IMAGES.football,
      startAt: at(nextWeekday(5), 17),
      endAt: at(nextWeekday(5), 19),
      venue: "University Ground",
      campusLocation: "Main Sports Ground",
      capacity: 30,
      participantCount: 27,
      googleFormUrl: form("1FAIpQLSc-football-s1-s3"),
      organizerName: "Sports Board",
      society: "sports-board",
      status: "APPROVED",
      featured: true,
      interest: 188,
      match: {
        sport: "Football",
        teamA: "Semester 1",
        teamB: "Semester 3",
        teamAMeta: "All departments",
        teamBMeta: "All departments",
        matchType: "FRIENDLY",
      },
    },
    {
      slug: "section-a-vs-section-b-futsal",
      title: "Section A vs Section B",
      subtitle: "Futsal 5v5 · CS Department",
      description:
        "Section rivalry week continues, five a side. Winner takes the department bragging rights and a very small trophy.",
      category: "sports",
      tag: "Futsal 5v5",
      coverImage: IMAGES.futsalGoal,
      startAt: at(nextWeekday(3, 1), 16),
      endAt: at(nextWeekday(3, 1), 17, 30),
      venue: "Futsal Court",
      campusLocation: "Sports Complex",
      capacity: 20,
      participantCount: 9,
      googleFormUrl: form("1FAIpQLSc-futsal-sections"),
      organizerName: "CS Department Sports Rep",
      status: "APPROVED",
      interest: 61,
      match: {
        sport: "Futsal",
        teamA: "Section A",
        teamB: "Section B",
        teamAMeta: "CS Department",
        teamBMeta: "CS Department",
        matchType: "FRIENDLY",
      },
    },
    {
      slug: "rooftop-listening-party",
      title: "Rooftop Listening Party",
      subtitle: "Full album, no phones",
      description:
        "One album, start to finish, on a proper sound system, on the library roof after sunset. Cushions provided. Phones in the basket at the door.",
      category: "music",
      tag: "Listening party",
      coverImage: IMAGES.stageLights,
      startAt: at(nextWeekday(4), 20),
      endAt: at(nextWeekday(4), 22),
      venue: "Library Rooftop",
      capacity: 60,
      participantCount: 47,
      cost: 300,
      googleFormUrl: form("1FAIpQLSc-listening-party"),
      organizerName: "Music Society",
      society: "music-society",
      status: "APPROVED",
      interest: 121,
    },
    {
      slug: "valorant-lan-night",
      title: "Valorant LAN Night",
      subtitle: "5v5 · Double elimination",
      description:
        "Sixteen teams, one lab, forty machines and terrible air conditioning. Peripherals allowed, bring your own mouse. Finals streamed to the common room.",
      category: "gaming",
      tag: "Esports",
      coverImage: IMAGES.esports,
      startAt: at(nextWeekday(6), 17),
      endAt: at(nextWeekday(6), 23, 30),
      venue: "Computer Lab 3",
      campusLocation: "CS Block, Floor 1",
      capacity: 80,
      participantCount: 80,
      cost: 1000,
      costNote: "Per team of five",
      googleFormUrl: form("1FAIpQLSc-valorant"),
      organizerName: "Computer Society",
      society: "computer-society",
      status: "APPROVED",
      interest: 194,
    },
    {
      slug: "arduino-bootcamp",
      title: "Arduino Bootcamp",
      subtitle: "Zero to line-following robot",
      description:
        "Two sessions across one weekend. Day one covers microcontrollers, sensors and soldering. Day two you build and race a line-following robot. Kits provided, teams of two.",
      category: "technology",
      tag: "Bootcamp",
      coverImage: IMAGES.circuit,
      startAt: at(nextWeekday(6, 1), 10),
      endAt: at(nextWeekday(6, 1), 17),
      venue: "Robotics Lab",
      campusLocation: "Engineering Block",
      capacity: 30,
      participantCount: 22,
      cost: 1500,
      costNote: "Includes kit rental",
      googleFormUrl: form("1FAIpQLSc-arduino"),
      organizerName: "Robotics Society",
      society: "robotics-society",
      status: "APPROVED",
      interest: 88,
    },
    {
      slug: "crochet-circle",
      title: "Crochet Circle",
      subtitle: "Bring yarn, leave with a granny square",
      description:
        "A slow, chatty two hours in the studio. Hooks and starter yarn available for the first fifteen people. Beginners welcome, experts welcome to show off.",
      category: "art",
      tag: "Crochet",
      coverImage: IMAGES.craft,
      startAt: at(nextWeekday(2, 1), 17),
      endAt: at(nextWeekday(2, 1), 19),
      venue: "Art Studio",
      capacity: 25,
      participantCount: 11,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-crochet"),
      organizerName: "Fine Arts Society",
      society: "fine-arts-society",
      status: "APPROVED",
      interest: 43,
    },
    {
      slug: "photography-walk",
      title: "Golden Hour Photo Walk",
      subtitle: "Campus architecture and light",
      description:
        "A two-hour walk around the older blocks chasing the last light of the day. Any camera, including phones. We end at the fountain for a quick review of everyone's three best frames.",
      category: "art",
      tag: "Photography",
      coverImage: IMAGES.camera,
      startAt: at(nextWeekday(4, 1), 16, 30),
      endAt: at(nextWeekday(4, 1), 18, 30),
      venue: "Meet at the Clock Tower",
      capacity: 30,
      participantCount: 18,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-photo-walk"),
      organizerName: "Fine Arts Society",
      society: "fine-arts-society",
      status: "APPROVED",
      interest: 67,
    },
    {
      slug: "documentary-night-cosmos",
      title: "Documentary Night",
      subtitle: "Science on the big screen",
      description:
        "A double bill of short science documentaries followed by an open discussion with two faculty members from the Physics department.",
      category: "movies",
      tag: "Documentary",
      coverImage: IMAGES.projector,
      startAt: at(nextWeekday(2, 1), 19),
      endAt: at(nextWeekday(2, 1), 21, 30),
      venue: "Seminar Hall 2",
      capacity: 70,
      participantCount: 24,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-documentary"),
      organizerName: "Film Club",
      society: "film-club",
      status: "APPROVED",
      interest: 39,
    },
    {
      slug: "khanpur-lake-day",
      title: "Khanpur Lake Day",
      subtitle: "Kayaks, cliff jumping, barbecue",
      description:
        "A full day at Khanpur with kayaks, boating and an evening barbecue by the water. Life jackets mandatory for all water activities.",
      category: "trips",
      tag: "Day trip",
      coverImage: IMAGES.mountains,
      startAt: at(nextWeekday(0, 2), 7),
      endAt: at(nextWeekday(0, 2), 20),
      venue: "Khanpur Lake",
      campusLocation: "Departs University Main Gate",
      capacity: 45,
      participantCount: 12,
      cost: 3200,
      googleFormUrl: form("1FAIpQLSc-khanpur"),
      organizerName: "Adventure Club",
      society: "adventure-club",
      status: "APPROVED",
      interest: 97,
      tripDeparture: "7:00 AM",
      tripReturn: "8:00 PM",
      tripDeparturePoint: "University Main Gate",
      tripIncluded: "Transportation, Kayak rental, Barbecue dinner, Life jackets",
      tripBring: "Change of clothes, Towel, Sunscreen, Water bottle",
    },
    {
      slug: "resume-clinic",
      title: "Resume Clinic",
      subtitle: "One page, reviewed line by line",
      description:
        "Bring a printed resume. Recruiters from two companies and the career office review it with you in fifteen-minute slots. Slots are assigned in the order forms are submitted.",
      category: "workshops",
      tag: "Career session",
      coverImage: IMAGES.stickyNotes,
      startAt: at(nextWeekday(1, 1), 11),
      endAt: at(nextWeekday(1, 1), 15),
      venue: "Career Services Office",
      capacity: 40,
      participantCount: 31,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-resume-clinic"),
      organizerName: "Career Services",
      status: "APPROVED",
      interest: 58,
    },
    {
      slug: "midnight-study-jam",
      title: "Midnight Study Jam",
      subtitle: "Library open until 3 AM",
      description:
        "The library stays open through the night before midterms. Free chai at midnight, quiet floor upstairs, group floor downstairs.",
      category: "workshops",
      tag: "Study jam",
      coverImage: IMAGES.laptops,
      startAt: at(nextWeekday(4, 1), 22),
      endAt: at(nextWeekday(5, 1), 3),
      venue: "Central Library",
      registrationRequired: false,
      cost: 0,
      organizerName: "Student Council",
      status: "APPROVED",
      interest: 46,
    },
    {
      slug: "chess-blitz-tournament",
      title: "Chess Blitz Tournament",
      subtitle: "5+3 · Swiss format",
      description:
        "Seven rounds of blitz across one afternoon. Boards and clocks provided. Ratings not required, trash talk optional.",
      category: "gaming",
      tag: "Chess",
      coverImage: IMAGES.chess,
      startAt: at(nextWeekday(2, 1), 14),
      endAt: at(nextWeekday(2, 1), 18),
      venue: "Student Centre Hall",
      capacity: 32,
      participantCount: 28,
      cost: 200,
      googleFormUrl: form("1FAIpQLSc-chess-blitz"),
      organizerName: "Chess Club",
      status: "APPROVED",
      interest: 52,
    },
    {
      slug: "society-mixer",
      title: "Society Mixer",
      subtitle: "Fourteen societies, one courtyard",
      description:
        "Every society sets up a stall, tells you what they actually do, and signs up new members. Food stalls along the west side.",
      category: "societies",
      tag: "Student meetup",
      coverImage: IMAGES.dining,
      startAt: at(nextWeekday(1, 1), 12),
      endAt: at(nextWeekday(1, 1), 16),
      venue: "Main Courtyard",
      registrationRequired: false,
      cost: 0,
      organizerName: "Student Council",
      status: "APPROVED",
      interest: 133,
    },
    {
      slug: "faculty-vs-students-cricket",
      title: "Faculty vs Students",
      subtitle: "T20 Cricket",
      description:
        "The annual fixture. Faculty have won two years running, which is mentioned in most lectures.",
      category: "sports",
      tag: "Cricket",
      coverImage: IMAGES.cricket,
      startAt: at(-6, 15),
      endAt: at(-6, 19),
      venue: "University Ground",
      capacity: 30,
      participantCount: 30,
      organizerName: "Sports Board",
      society: "sports-board",
      status: "COMPLETED",
      interest: 220,
      match: {
        sport: "Cricket",
        teamA: "Faculty XI",
        teamB: "Students XI",
        matchType: "FRIENDLY",
        scoreA: 142,
        scoreB: 146,
      },
    },
    {
      slug: "hostel-a-vs-hostel-b-basketball",
      title: "Hostel A vs Hostel B",
      subtitle: "Basketball",
      description: "Hostel derby on the outdoor court. Four quarters, full house every year.",
      category: "sports",
      tag: "Basketball",
      coverImage: IMAGES.basketball,
      startAt: at(-3, 18),
      endAt: at(-3, 20),
      venue: "Outdoor Basketball Court",
      capacity: 24,
      participantCount: 24,
      organizerName: "Sports Board",
      society: "sports-board",
      status: "COMPLETED",
      interest: 132,
      match: {
        sport: "Basketball",
        teamA: "Hostel A",
        teamB: "Hostel B",
        matchType: "FRIENDLY",
        scoreA: 58,
        scoreB: 61,
      },
    },
    {
      slug: "inter-society-athletics-meet",
      title: "Inter-Society Athletics Meet",
      subtitle: "Track and field",
      description:
        "Sprints, relays, long jump and the deeply competitive tug of war. Societies enter squads of up to twelve.",
      category: "sports",
      tag: "Athletics",
      coverImage: IMAGES.track,
      startAt: at(nextWeekday(6, 2), 8),
      endAt: at(nextWeekday(6, 2), 14),
      venue: "Athletics Track",
      capacity: 200,
      participantCount: 96,
      googleFormUrl: form("1FAIpQLSc-athletics"),
      organizerName: "Sports Board",
      society: "sports-board",
      status: "APPROVED",
      interest: 104,
    },
    {
      slug: "semester-concert",
      title: "Semester Concert",
      subtitle: "Four bands, one night",
      description:
        "The closing concert of the semester with four student bands and a headline set from an alumni group. Full stage, full lighting rig, outdoor amphitheatre.",
      category: "music",
      tag: "Concert",
      coverImage: IMAGES.concert,
      startAt: at(nextWeekday(5, 2), 19),
      endAt: at(nextWeekday(5, 2), 23),
      venue: "Open Air Amphitheatre",
      capacity: 500,
      participantCount: 388,
      cost: 500,
      googleFormUrl: form("1FAIpQLSc-semester-concert"),
      organizerName: "Music Society",
      society: "music-society",
      status: "APPROVED",
      featured: true,
      interest: 412,
    },
    {
      slug: "jam-room-sessions",
      title: "Jam Room Sessions",
      subtitle: "Drop in, plug in",
      description:
        "The jam room is open with a drum kit, two amps and a keyboard. Slots of forty minutes, first come first served, sign-up at the door.",
      category: "music",
      tag: "Jam session",
      coverImage: IMAGES.guitarHands,
      startAt: at(nextWeekday(3), 18),
      endAt: at(nextWeekday(3), 21),
      venue: "Jam Room",
      campusLocation: "Student Centre, Basement",
      registrationRequired: false,
      cost: 0,
      organizerName: "Music Society",
      society: "music-society",
      status: "APPROVED",
      interest: 35,
    },
    {
      slug: "calligraphy-basics",
      title: "Calligraphy Basics",
      subtitle: "Nib, ink, patience",
      description:
        "An introduction to broad-nib calligraphy. Pens, ink and practice sheets provided. You will leave with a finished piece on handmade paper.",
      category: "art",
      tag: "Calligraphy",
      coverImage: IMAGES.illustration,
      startAt: at(nextWeekday(0, 1), 15),
      endAt: at(nextWeekday(0, 1), 17),
      venue: "Art Studio",
      capacity: 18,
      participantCount: 5,
      cost: 600,
      googleFormUrl: form("1FAIpQLSc-calligraphy"),
      organizerName: "Fine Arts Society",
      society: "fine-arts-society",
      status: "APPROVED",
      interest: 27,
    },
    {
      slug: "robo-futsal-showdown",
      title: "Robo Futsal Showdown",
      subtitle: "Bots on a small pitch",
      description:
        "Teams build remote-controlled bots and play three-a-side futsal on a table-sized pitch. Chassis kits available from the lab two weeks in advance.",
      category: "technology",
      tag: "Robotics",
      coverImage: IMAGES.codeDark,
      startAt: at(nextWeekday(4, 2), 14),
      endAt: at(nextWeekday(4, 2), 18),
      venue: "Engineering Courtyard",
      capacity: 24,
      participantCount: 14,
      cost: 800,
      costNote: "Per team",
      googleFormUrl: form("1FAIpQLSc-robo-futsal"),
      organizerName: "Robotics Society",
      society: "robotics-society",
      status: "APPROVED",
      interest: 71,
    },
    {
      slug: "startup-pitch-night",
      title: "Startup Pitch Night",
      subtitle: "Six teams, five minutes each",
      description:
        "Student teams pitch to a panel of founders and one investor. Audience votes for a people's choice award. Networking with pizza afterwards.",
      category: "technology",
      tag: "Tech talk",
      coverImage: IMAGES.lecture,
      startAt: at(nextWeekday(3, 2), 18),
      endAt: at(nextWeekday(3, 2), 21),
      venue: "Auditorium B",
      capacity: 150,
      participantCount: 62,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-pitch-night"),
      organizerName: "Computer Society",
      society: "computer-society",
      status: "APPROVED",
      interest: 83,
    },
    {
      slug: "city-heritage-walk",
      title: "City Heritage Walk",
      subtitle: "Old quarter, on foot",
      description:
        "A guided walk through the old city with a historian from the Humanities department. Ends at a tea house. Comfortable shoes strongly advised.",
      category: "trips",
      tag: "City tour",
      coverImage: IMAGES.city,
      startAt: at(nextWeekday(6, 2), 9),
      endAt: at(nextWeekday(6, 2), 14),
      venue: "Old City",
      campusLocation: "Departs University Main Gate",
      capacity: 35,
      participantCount: 26,
      cost: 900,
      googleFormUrl: form("1FAIpQLSc-heritage-walk"),
      organizerName: "Literary Society",
      society: "literary-society",
      status: "APPROVED",
      interest: 49,
      tripDeparture: "9:00 AM",
      tripReturn: "2:00 PM",
      tripDeparturePoint: "University Main Gate",
      tripIncluded: "Transportation, Guide, Tea house stop",
      tripBring: "Comfortable shoes, Water, Camera",
    },
    {
      slug: "winter-trek-recruitment",
      title: "Winter Trek Briefing",
      subtitle: "Planning the December expedition",
      description:
        "An information session for the four-day December trek. Route, gear list, fitness expectations and costs. Attend before you apply.",
      category: "trips",
      tag: "Overnight trip",
      coverImage: IMAGES.climbing,
      startAt: at(nextWeekday(2, 2), 17),
      endAt: at(nextWeekday(2, 2), 18, 30),
      venue: "Seminar Hall 1",
      capacity: 60,
      participantCount: 40,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-winter-trek"),
      organizerName: "Adventure Club",
      society: "adventure-club",
      status: "APPROVED",
      interest: 58,
    },
    {
      slug: "debate-championship",
      title: "Inter-Department Debate",
      subtitle: "Championship round",
      description:
        "Eight departments, British parliamentary format, one very loud final. Spectators welcome without registration.",
      category: "societies",
      tag: "Panel",
      coverImage: IMAGES.conference,
      startAt: at(nextWeekday(5, 1), 14),
      endAt: at(nextWeekday(5, 1), 18),
      venue: "Auditorium B",
      capacity: 80,
      participantCount: 48,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-debate"),
      organizerName: "Literary Society",
      society: "literary-society",
      status: "APPROVED",
      interest: 64,
    },
    {
      slug: "volunteer-food-drive",
      title: "Campus Food Drive",
      subtitle: "Volunteers needed",
      description:
        "Collecting and packing food hampers for families in the nearby village. Two shifts, morning and afternoon. Volunteers get lunch and a very good afternoon.",
      category: "societies",
      tag: "Social gathering",
      coverImage: IMAGES.food,
      startAt: at(nextWeekday(6, 1), 10),
      endAt: at(nextWeekday(6, 1), 16),
      venue: "Student Centre",
      capacity: 50,
      participantCount: 37,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-food-drive"),
      organizerName: "Community Service Society",
      status: "APPROVED",
      interest: 55,
    },
    {
      slug: "badminton-doubles-ladder",
      title: "Badminton Doubles Ladder",
      subtitle: "Weekly ladder · Week 3",
      description:
        "Open doubles ladder in the indoor hall. Pairs play two matches per week, positions update every Sunday.",
      category: "sports",
      tag: "Badminton",
      coverImage: IMAGES.gym,
      startAt: at(nextWeekday(1), 18),
      endAt: at(nextWeekday(1), 21),
      venue: "Indoor Sports Hall",
      capacity: 32,
      participantCount: 30,
      cost: 300,
      googleFormUrl: form("1FAIpQLSc-badminton"),
      organizerName: "Sports Board",
      society: "sports-board",
      status: "APPROVED",
      interest: 42,
    },
    {
      slug: "sunrise-run-club",
      title: "Sunrise Run Club",
      subtitle: "5K around campus",
      description:
        "Every Tuesday at 6 AM, three pace groups, nobody left behind. Coffee at the cafeteria afterwards for anyone still standing.",
      category: "sports",
      tag: "Athletics",
      coverImage: IMAGES.runners,
      startAt: at(nextWeekday(2), 6),
      endAt: at(nextWeekday(2), 7, 30),
      venue: "Athletics Track",
      registrationRequired: false,
      cost: 0,
      organizerName: "Run Club",
      status: "APPROVED",
      interest: 31,
    },
    {
      slug: "spring-art-exhibition",
      title: "Student Art Exhibition",
      subtitle: "Forty works, one corridor",
      description:
        "Paintings, ceramics and photography from across the semester, hung along the main corridor of the Design Block. Open all week.",
      category: "art",
      tag: "Painting",
      coverImage: IMAGES.ink,
      startAt: at(nextWeekday(4, 2), 10),
      endAt: at(nextWeekday(4, 2), 18),
      venue: "Design Block Corridor",
      registrationRequired: false,
      cost: 0,
      organizerName: "Fine Arts Society",
      society: "fine-arts-society",
      status: "APPROVED",
      interest: 40,
    },
    {
      slug: "short-film-festival",
      title: "Short Film Festival",
      subtitle: "Twelve student films",
      description:
        "A full evening of student-made short films with an audience award at the end. Submissions closed, screening is open to everyone who registers.",
      category: "movies",
      tag: "Short film night",
      coverImage: IMAGES.auditorium,
      startAt: at(nextWeekday(5, 2), 18),
      endAt: at(nextWeekday(5, 2), 22),
      venue: "University Auditorium",
      capacity: 200,
      participantCount: 156,
      cost: 200,
      googleFormUrl: form("1FAIpQLSc-short-film"),
      organizerName: "Film Club",
      society: "film-club",
      status: "APPROVED",
      interest: 118,
    },
    {
      slug: "dance-night-rehearsal",
      title: "Cultural Night Auditions",
      subtitle: "Dance, music and drama",
      description:
        "Auditions for the cultural night showcase. Three minutes per act. Bring your own backing track on a USB drive.",
      category: "societies",
      tag: "Society event",
      coverImage: IMAGES.dancer,
      startAt: at(nextWeekday(3, 1), 15),
      endAt: at(nextWeekday(3, 1), 19),
      venue: "Drama Hall",
      capacity: 60,
      participantCount: 44,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-cultural-auditions"),
      organizerName: "Performing Arts Society",
      status: "APPROVED",
      interest: 72,
    },
    {
      slug: "gaming-console-night",
      title: "Console Night",
      subtitle: "FIFA, Tekken, Mario Kart",
      description:
        "Four consoles, two projectors and a knockout bracket per game. Casual, loud and open to complete beginners.",
      category: "gaming",
      tag: "Console night",
      coverImage: IMAGES.esports,
      startAt: at(nextWeekday(4), 19),
      endAt: at(nextWeekday(4), 23),
      venue: "Common Room",
      campusLocation: "Hostel B",
      capacity: 60,
      participantCount: 23,
      cost: 200,
      googleFormUrl: form("1FAIpQLSc-console-night"),
      organizerName: "Gaming Society",
      status: "APPROVED",
      interest: 47,
    },
    {
      slug: "pitch-perfect-workshop",
      title: "Public Speaking Workshop",
      subtitle: "Say it in ninety seconds",
      description:
        "A practical session on structure, pacing and nerves. Everyone speaks at least twice. Recorded so you can watch yourself later, which is the worst and best part.",
      category: "workshops",
      tag: "Masterclass",
      coverImage: IMAGES.hands,
      startAt: at(nextWeekday(0, 1), 11),
      endAt: at(nextWeekday(0, 1), 14),
      venue: "Seminar Hall 3",
      capacity: 25,
      participantCount: 19,
      cost: 400,
      googleFormUrl: form("1FAIpQLSc-public-speaking"),
      organizerName: "Literary Society",
      society: "literary-society",
      status: "APPROVED",
      interest: 36,
    },
    {
      slug: "campus-cleanup-drive",
      title: "Campus Cleanup Drive",
      subtitle: "Pending approval",
      description:
        "A morning cleanup of the lake path and the sports complex surroundings. Gloves and bags provided by the facilities office.",
      category: "societies",
      tag: "Social gathering",
      coverImage: IMAGES.crowdOutdoor,
      startAt: at(nextWeekday(6, 2), 8),
      endAt: at(nextWeekday(6, 2), 11),
      venue: "Lake Path",
      capacity: 80,
      participantCount: 0,
      cost: 0,
      googleFormUrl: form("1FAIpQLSc-cleanup"),
      organizerName: "Environment Society",
      status: "PENDING",
      createdById: organizer.id,
      interest: 3,
    },
    {
      slug: "esports-fifa-cup",
      title: "FIFA Campus Cup",
      subtitle: "Pending approval",
      description:
        "A 64-player single elimination FIFA tournament across two days with a live-commentated final.",
      category: "gaming",
      tag: "Esports",
      coverImage: IMAGES.esports,
      startAt: at(nextWeekday(5, 2), 16),
      endAt: at(nextWeekday(6, 2), 20),
      venue: "Student Centre Hall",
      capacity: 64,
      participantCount: 0,
      cost: 300,
      googleFormUrl: form("1FAIpQLSc-fifa-cup"),
      organizerName: "Gaming Society",
      status: "PENDING",
      createdById: organizer.id,
      interest: 1,
    },
    {
      slug: "monsoon-trip-cancelled",
      title: "Monsoon Waterfall Trip",
      subtitle: "Cancelled due to weather warnings",
      description:
        "This trip has been cancelled after a weather advisory for the region. Refunds are being processed at the Adventure Club desk.",
      category: "trips",
      tag: "Day trip",
      coverImage: IMAGES.mountains,
      startAt: at(4, 7),
      endAt: at(4, 19),
      venue: "Neelum Valley",
      capacity: 40,
      participantCount: 28,
      cost: 2800,
      googleFormUrl: form("1FAIpQLSc-monsoon-trip"),
      organizerName: "Adventure Club",
      society: "adventure-club",
      status: "CANCELLED",
      interest: 64,
    },
  ];

  const created = new Map<string, string>();

  for (const seed of events) {
    const { match, society, ...rest } = seed;
    const event = await prisma.event.create({
      data: {
        ...rest,
        participantCount: seed.participantCount ?? 0,
        cost: seed.cost ?? 0,
        registrationRequired: seed.registrationRequired ?? true,
        status: seed.status ?? "APPROVED",
        societyId: society ? bySlug[society].id : null,
        createdById: seed.createdById ?? admin.id,
        ...(match ? { match: { create: { ...match, resultRecordedAt: match.scoreA != null ? new Date() : null } } } : {}),
      },
    });
    created.set(seed.slug, event.id);
  }

  // Tournament with fixtures wired to real match events
  const tournament = await prisma.tournament.create({
    data: {
      slug: "inter-semester-futsal-cup",
      name: "Inter-Semester Futsal Cup",
      sport: "Futsal",
      description:
        "Eight semester squads, twelve matches, one trophy. Group stage runs for two weeks before the knockouts.",
      coverImage: IMAGES.futsalNight,
      teamCount: 8,
      startAt: at(-10, 16),
      finalAt: at(nextWeekday(6, 3), 17),
      status: "ONGOING",
      teams: {
        create: [
          { name: "Semester 1", played: 3, won: 2, drawn: 1, lost: 0, points: 7 },
          { name: "Semester 2", played: 3, won: 2, drawn: 0, lost: 1, points: 6 },
          { name: "Semester 3", played: 3, won: 2, drawn: 0, lost: 1, points: 6 },
          { name: "Semester 4", played: 3, won: 1, drawn: 2, lost: 0, points: 5 },
          { name: "Semester 5", played: 3, won: 1, drawn: 1, lost: 1, points: 4 },
          { name: "Semester 6", played: 3, won: 1, drawn: 0, lost: 2, points: 3 },
          { name: "Semester 7", played: 3, won: 0, drawn: 2, lost: 1, points: 2 },
          { name: "Semester 8", played: 3, won: 0, drawn: 0, lost: 3, points: 0 },
        ],
      },
    },
  });

  const fixtures: Array<{
    slug: string;
    title: string;
    teamA: string;
    teamB: string;
    round: string;
    startAt: Date;
    scoreA?: number;
    scoreB?: number;
    status: string;
  }> = [
    {
      slug: "futsal-cup-quarter-final-1",
      title: "Quarter Final 1",
      teamA: "Semester 1",
      teamB: "Semester 3",
      round: "Quarter Final",
      startAt: at(nextWeekday(2, 1), 17),
      status: "APPROVED",
    },
    {
      slug: "futsal-cup-quarter-final-2",
      title: "Quarter Final 2",
      teamA: "Semester 2",
      teamB: "Semester 4",
      round: "Quarter Final",
      startAt: at(nextWeekday(2, 1), 18, 30),
      status: "APPROVED",
    },
    {
      slug: "futsal-cup-group-semester-5-vs-8",
      title: "Semester 5 vs Semester 8",
      teamA: "Semester 5",
      teamB: "Semester 8",
      round: "Group Stage",
      startAt: at(-5, 17),
      scoreA: 4,
      scoreB: 2,
      status: "COMPLETED",
    },
    {
      slug: "futsal-cup-group-semester-6-vs-7",
      title: "Semester 6 vs Semester 7",
      teamA: "Semester 6",
      teamB: "Semester 7",
      round: "Group Stage",
      startAt: at(-2, 17),
      scoreA: 1,
      scoreB: 1,
      status: "COMPLETED",
    },
    {
      slug: "futsal-cup-final",
      title: "Final",
      teamA: "TBD",
      teamB: "TBD",
      round: "Final",
      startAt: at(nextWeekday(6, 3), 17),
      status: "APPROVED",
    },
  ];

  for (const fixture of fixtures) {
    await prisma.event.create({
      data: {
        slug: fixture.slug,
        title: `${fixture.teamA} vs ${fixture.teamB}`,
        subtitle: `Inter-Semester Futsal Cup · ${fixture.round}`,
        description:
          "Part of the Inter-Semester Futsal Cup. Squad lists are confirmed by the Sports Board the night before each fixture.",
        category: "sports",
        tag: "Futsal",
        coverImage: IMAGES.futsalGoal,
        startAt: fixture.startAt,
        endAt: new Date(fixture.startAt.getTime() + 90 * 60 * 1000),
        venue: "Main Sports Ground",
        campusLocation: "Sports Complex",
        capacity: 24,
        participantCount: 20,
        registrationRequired: fixture.status === "APPROVED",
        googleFormUrl: form("1FAIpQLSc-futsal-cup"),
        organizerName: "Sports Board",
        societyId: bySlug["sports-board"].id,
        createdById: admin.id,
        status: fixture.status,
        interest: 90,
        match: {
          create: {
            sport: "Futsal",
            teamA: fixture.teamA,
            teamB: fixture.teamB,
            matchType: "TOURNAMENT",
            round: fixture.round,
            scoreA: fixture.scoreA ?? null,
            scoreB: fixture.scoreB ?? null,
            resultRecordedAt: fixture.scoreA != null ? new Date() : null,
            tournamentId: tournament.id,
          },
        },
      },
    });
  }

  await prisma.bookmark.createMany({
    data: [
      { userId: student.id, eventId: created.get("mukshpuri-hike")! },
      { userId: student.id, eventId: created.get("movie-night-interstellar")! },
      { userId: student.id, eventId: created.get("texture-art-workshop")! },
      { userId: organizer.id, eventId: created.get("ai-hackathon-36")! },
    ],
  });

  const rooms = [
    {
      slug: "futsal-court",
      name: "Futsal Court",
      topic: "Find a fifth, fix a fixture, argue about the scoreline.",
      category: "sports",
    },
    {
      slug: "trail-heads",
      name: "Trail Heads",
      topic: "Hikes, treks and weekend escapes. Carpools posted here.",
      category: "trips",
    },
    {
      slug: "green-room",
      name: "Green Room",
      topic: "Bands, open mics and jam sessions looking for players.",
      category: "music",
    },
    {
      slug: "back-row",
      name: "Back Row",
      topic: "Movie night picks, screening plans and spoiler-free reactions.",
      category: "movies",
    },
    {
      slug: "build-lab",
      name: "Build Lab",
      topic: "Hackathon teams, project help and late-night debugging.",
      category: "technology",
    },
    {
      slug: "studio-floor",
      name: "Studio Floor",
      topic: "Paint, clay, film and everything drying on the studio shelf.",
      category: "art",
    },
    {
      slug: "lan-party",
      name: "LAN Party",
      topic: "Squads, chess ladders and console nights.",
      category: "gaming",
    },
    {
      slug: "society-desk",
      name: "Society Desk",
      topic: "Organizers coordinating events, venues and volunteers.",
      category: "societies",
    },
  ];

  for (const room of rooms) {
    const record = await prisma.chatRoom.create({ data: room });
    await prisma.chatRoomMember.createMany({
      data: [
        { roomId: record.id, userId: student.id },
        { roomId: record.id, userId: organizer.id },
      ],
    });
  }

  const futsalRoom = await prisma.chatRoom.findUniqueOrThrow({
    where: { slug: "futsal-court" },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        roomId: futsalRoom.id,
        userId: organizer.id,
        body: "Semester 2 vs Semester 4 is confirmed for Wednesday 4 PM, 5v5 on the indoor court.",
      },
      {
        roomId: futsalRoom.id,
        userId: student.id,
        body: "We are one short for the Section A squad. Anyone free Wednesday?",
      },
      {
        roomId: futsalRoom.id,
        userId: organizer.id,
        body: "Bring both kits, the referee wants contrasting colours this time.",
      },
    ],
  });

  console.log("Seeded", await prisma.event.count(), "events and", rooms.length, "rooms");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
