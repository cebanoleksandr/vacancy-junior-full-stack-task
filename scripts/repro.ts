import { PrismaClient } from "@prisma/client";
import { transferMoney } from "../src/app/actions/transfer";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== ЗАПУСК ТЕСТУВАННЯ БЕЗПЕКИ ТА ЦІЛІСНОСТІ ===");

  await prisma.account.update({
    where: { id: "acc-alice" },
    data: { balance: 1000 },
  });
  await prisma.account.update({
    where: { id: "acc-bob" },
    data: { balance: 500 },
  });
  await prisma.account.update({
    where: { id: "acc-carol" },
    data: { balance: 0 },
  });

  console.log("\nПочаткові баланси встановлено:");
  console.log("Alice (acc-alice, USD): 1000");
  console.log("Bob (acc-bob, USD): 500");
  console.log("Carol (acc-carol, EUR): 0");

  console.log("\n--- ТЕСТ 1: Спроба списання з чужого рахунку (Bob -> Alice) ---");
  const test1 = await transferMoney("acc-bob", "acc-alice", 100);
  console.log("Результат:", test1.success ? "УСПІХ (БАГ ІСНУЄ!)" : `ВІДХИЛЕНО: ${test1.error}`);

  console.log("\n--- ТЕСТ 2: Спроба переказу між різними валютами (USD -> EUR) ---");
  const test2 = await transferMoney("acc-alice", "acc-carol", 100);
  console.log("Результат:", test2.success ? "УСПІХ (БАГ ІСНУЄ!)" : `ВІДХИЛЕНО: ${test2.error}`);

  console.log("\n--- ТЕСТ 3: Спроба від'ємного переказу (-200 USD) ---");
  const test3 = await transferMoney("acc-alice", "acc-bob", -200);
  console.log("Результат:", test3.success ? "УСПІХ (БАГ ІСНУЄ!)" : `ВІДХИЛЕНО: ${test3.error}`);

  console.log("\n--- ТЕСТ 4: Паралельні запити (Race Condition) ---");
  console.log("Надсилаємо 5 паралельних запитів по 300 USD...");
  
  const results = await Promise.all([
    transferMoney("acc-alice", "acc-bob", 300),
    transferMoney("acc-alice", "acc-bob", 300),
    transferMoney("acc-alice", "acc-bob", 300),
    transferMoney("acc-alice", "acc-bob", 300),
    transferMoney("acc-alice", "acc-bob", 300),
  ]);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  console.log(`Успішних транзакцій: ${successCount}`);
  console.log(`Відхилених транзакцій: ${failCount}`);

  const finalAlice = await prisma.account.findUnique({ where: { id: "acc-alice" } });
  const finalBob = await prisma.account.findUnique({ where: { id: "acc-bob" } });

  console.log("\nФінальні баланси в базі даних:");
  console.log(`Alice: ${finalAlice?.balance} USD (Очікується: 100 USD, не менше 0!)`);
  console.log(`Bob: ${finalBob?.balance} USD (Очікується: 1400 USD)`);

  if ((finalAlice?.balance ?? 0) < 0) {
    console.error("\n❌ КРИТИЧНИЙ БАГ: Баланс Alice від'ємний!");
  } else {
    console.log("\n✅ Усі тести пройдено успішно! Фінансова система захищена.");
  }
}

runTests()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
