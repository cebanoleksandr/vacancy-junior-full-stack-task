// Спрощена імітація сесії. У реальному застосунку це повертало б
// автентифікованого користувача (NextAuth / Clerk / власна сесія).
// Зараз "залогінений" user-1 (Alice).
export async function auth() {
  return { userId: "user-1" };
}
