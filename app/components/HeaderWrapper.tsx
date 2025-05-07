import { auth } from "@clerk/nextjs/server";
import Header from "./Header";
import { Metadata } from "next";

export default async function HeaderWrapper() {
  const { userId } = await auth();
  return <Header userId={userId} />;
}