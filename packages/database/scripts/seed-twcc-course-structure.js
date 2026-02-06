/**
 * Seed chapters and lessons for the "Product Management Fundamentals" course
 * for tenant twcc-corp.
 *
 * Run from repo root (loads .env from root):
 *   node packages/database/scripts/seed-twcc-course-structure.js
 *
 * Or from packages/database:
 *   node scripts/seed-twcc-course-structure.js
 */
const { config } = require("dotenv");
const { resolve } = require("path");
const { PrismaClient } = require("@prisma/client");

const rootDir = resolve(__dirname, "../../..");
for (const name of [".env.local", ".env"]) {
  config({ path: resolve(rootDir, name) });
}

const TENANT_SLUG = "twcc-corp";
const COURSE_TITLE = "Product Management Fundamentals";

const MOCK_CHAPTERS = [
  {
    title: "Introduction to Product Management",
    description: "What product management is and why it matters.",
    lessons: [
      { title: "What is Product Management?", description: "Definition and scope." },
      { title: "The Role of a Product Manager", description: "Responsibilities and skills." },
      { title: "Product vs Project vs Program", description: "Key distinctions." },
    ],
  },
  {
    title: "User Research & Discovery",
    description: "Understanding users and validating problems.",
    lessons: [
      { title: "Conducting User Interviews", description: "Best practices for interviews." },
      { title: "Surveys and Analytics", description: "Quantitative discovery." },
      { title: "Personas and Journey Maps", description: "Synthesizing research." },
    ],
  },
  {
    title: "Roadmapping & Prioritization",
    description: "Planning and deciding what to build.",
    lessons: [
      { title: "Building a Product Roadmap", description: "Now, next, later." },
      { title: "Prioritization Frameworks", description: "RICE, MoSCoW, value vs effort." },
      { title: "Stakeholder Alignment", description: "Getting buy-in on priorities." },
    ],
  },
  {
    title: "Working with Stakeholders",
    description: "Communication and influence.",
    lessons: [
      { title: "Managing Up and Across", description: "Working with leadership and peers." },
      { title: "Running Effective Meetings", description: "Agendas and outcomes." },
      { title: "Handling Conflict and Tradeoffs", description: "Saying no and negotiating." },
    ],
  },
  {
    title: "Metrics & Success",
    description: "Measuring outcomes and iterating.",
    lessons: [
      { title: "North Star and Key Metrics", description: "Choosing what to measure." },
      { title: "A/B Testing and Experimentation", description: "Running experiments." },
      { title: "Retrospectives and Iteration", description: "Learning and improving." },
    ],
  },
];

async function main(prisma) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (!tenant) {
    console.error(`Tenant not found: ${TENANT_SLUG}. Create the tenant first.`);
    process.exit(1);
  }

  const course = await prisma.course.findFirst({
    where: {
      title: COURSE_TITLE,
      tenantId: tenant.id,
    },
    include: { chapters: true },
  });

  if (!course) {
    console.error(`Course not found: "${COURSE_TITLE}" for tenant ${TENANT_SLUG}. Create the course first.`);
    process.exit(1);
  }

  if (course.chapters && course.chapters.length > 0) {
    console.log(`Course "${COURSE_TITLE}" already has ${course.chapters.length} chapter(s). Skipping seed.`);
    console.log("To re-seed, delete existing chapters and lessons for this course, then run again.");
    return;
  }

  console.log(`Seeding chapters and lessons for "${COURSE_TITLE}" (tenant: ${TENANT_SLUG})...\n`);

  for (let c = 0; c < MOCK_CHAPTERS.length; c++) {
    const ch = MOCK_CHAPTERS[c];
    const position = c + 1;

    const chapter = await prisma.courseChapter.create({
      data: {
        title: ch.title,
        position,
        description: ch.description ?? null,
        courseId: course.id,
      },
    });
    console.log(`  Chapter ${position}: ${ch.title}`);

    for (let l = 0; l < ch.lessons.length; l++) {
      const lesson = ch.lessons[l];
      await prisma.courseLesson.create({
        data: {
          title: lesson.title,
          position: l + 1,
          description: lesson.description ?? null,
          courseChapterId: chapter.id,
        },
      });
      console.log(`    - Lesson ${l + 1}: ${lesson.title}`);
    }
  }

  console.log(`\nDone. Created ${MOCK_CHAPTERS.length} chapters and ${MOCK_CHAPTERS.reduce((acc, ch) => acc + ch.lessons.length, 0)} lessons.`);
}

let prisma;

async function run() {
  prisma = new PrismaClient();
  await main(prisma);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
