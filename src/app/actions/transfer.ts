"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface TransferResult {
  success: boolean;
  error?: string;
}

export async function transferMoney(
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<TransferResult> {
  try {
    const session = await auth();
    if (!session || !session.userId) {
      return { success: false, error: "Неавторизований користувач" };
    }

    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Сума переказу повинна бути більшою за нуль" };
    }

    if (fromAccountId === toAccountId) {
      return { success: false, error: "Неможливо виконати переказ на той самий рахунок" };
    }

    return await prisma.$transaction(async (tx) => {
      const fromAccountArray = await tx.$queryRaw<any[]>`
        SELECT * FROM "Account" 
        WHERE "id" = ${fromAccountId} 
        LIMIT 1 
        FOR UPDATE
      `;
      const fromAccount = fromAccountArray[0];

      if (!fromAccount) {
        throw new Error("Рахунок відправника не знайдено");
      }

      if (fromAccount.ownerId !== session.userId) {
        throw new Error("Ви не є власником цього рахунку");
      }

      if (fromAccount.balance < amount) {
        throw new Error("Недостатньо коштів на рахунку");
      }

      const toAccountArray = await tx.$queryRaw<any[]>`
        SELECT * FROM "Account" 
        WHERE "id" = ${toAccountId} 
        LIMIT 1 
        FOR UPDATE
      `;
      const toAccount = toAccountArray[0];

      if (!toAccount) {
        throw new Error("Рахунок отримувача не знайдено");
      }

      if (fromAccount.currency !== toAccount.currency) {
        throw new Error(
          `Неможливо переказати кошти: несумісність валют (${fromAccount.currency} -> ${toAccount.currency})`
        );
      }

      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });

      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      await tx.transfer.create({
        data: {
          fromAccountId,
          toAccountId,
          amount,
        },
      });

      return { success: true };
    });
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Сталася невідома помилка під час переказу",
    };
  }
}
