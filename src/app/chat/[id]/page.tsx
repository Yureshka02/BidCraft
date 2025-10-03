import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatClient from "./ui/ChatClient";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/chat/${params.id}`);
  return <ChatClient conversationId={params.id} />;
}
