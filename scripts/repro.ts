import { PrismaClient } from "@prisma/client";
import { transferMoney } from "../src/app/actions/transfer";

const prisma = new PrismaClient();

// Скрипт відтворення бага.
//
// Мета: показати проблему ДО виправлення, а після фіксу — довести, що її більше
// немає. Нижче один приклад-заготовка (списання в мінус). Додай свої сценарії
// для інших знайдених багів.

async function reset() {
  await prisma.transfer.deleteMany();
  await prisma.account.deleteMany();
  await prisma.account.createMany({
    data: [
      { id: "acc-alice", userId: "user-1", ownerName: "Alice", balance: 1000, currency: "USD" },
      { id: "acc-bob", userId: "user-2", ownerName: "Bob", balance: 500, currency: "USD" },
      { id: "acc-carol", userId: "user-3", ownerName: "Carol", balance: 0, currency: "EUR" },
    ],
  });
}

async function balances() {
  const accs = await prisma.account.findMany({ orderBy: { ownerName: "asc" } });
  return Object.fromEntries(accs.map((a) => [a.ownerName, a.balance]));
}

async function main() {
  await reset();

  console.log("Баланси до:", await balances());

  // Приклад бага: переказуємо більше, ніж є на рахунку.
  // Очікувано: система має відхилити переказ. Фактично — баланс іде в мінус.
  await transferMoney({
    fromAccountId: "acc-bob",
    toAccountId: "acc-alice",
    amount: 999999,
  });

  console.log("Баланси після:", await balances());
  console.log(
    "Якщо у Bob від'ємний баланс — баг відтворено. Після фіксу переказ має впасти з помилкою."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
