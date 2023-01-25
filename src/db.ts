//This file is a mock database, in your real app you would access your real database from inside these functions
export async function getUser(userId: string, hasOnboarded = false) {
  return {
    id: userId,
    name: "Kiera Ashley",
    email: "matt@trigger.dev",
    hasOnboarded,
  };
}
