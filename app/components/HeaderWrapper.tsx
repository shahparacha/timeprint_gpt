import { auth } from "@clerk/nextjs/server";
import Header from "./Header";

export default async function HeaderWrapper() {
  const { userId } = await auth();
  return <Header userId={userId} />;
} 