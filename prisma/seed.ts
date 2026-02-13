import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "default-user" },
    update: {},
    create: {
      id: "default-user",
      name: "Default User",
    },
  });

  await prisma.board.upsert({
    where: { id: "default-board" },
    update: {},
    create: {
      id: "default-board",
      userId: user.id,
      name: "Inspiration",
    },
  });

  console.log("Seed complete: default user + board created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
