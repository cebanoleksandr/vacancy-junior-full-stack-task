"use client";

import { useState } from "react";
import { transferMoney } from "./actions/transfer";

type AccountOption = { id: string; label: string };

export function TransferForm({ accounts }: { accounts: AccountOption[] }) {
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("100");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await transferMoney({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
      });
      setMessage(res.success ? "Переказ виконано" : "Не вдалося");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Помилка");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <label>
        Звідки
        <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Куди
        <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Сума
        <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>

      <button type="submit">Надіслати</button>

      {message && <p>{message}</p>}
    </form>
  );
}
