import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Чистимо стару демо-дату.
  await prisma.transfer.deleteMany();
  await prisma.account.deleteMany();

  await prisma.account.createMany({
    data: [
      {
        id: "acc-alice",
        userId: "user-1",
        ownerName: "Alice",
        balance: 1000,
        currency: "USD",
      },
      {
        id: "acc-bob",
        userId: "user-2",
        ownerName: "Bob",
        balance: 500,
        currency: "USD",
      },
      {
        id: "acc-carol",
        userId: "user-3",
        ownerName: "Carol",
        balance: 0,
        currency: "EUR",
      },
    ],
  });

  console.log("Seeded accounts:");
  console.log("  Alice (acc-alice): 1000 USD  <- поточний користувач (user-1)");
  console.log("  Bob   (acc-bob):    500 USD");
  console.log("  Carol (acc-carol):    0 EUR");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
