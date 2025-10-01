import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MePage() {
  const session = await getServerSession(authOptions);

  return (
    <pre className="p-4 bg-gray-100 rounded">
      {JSON.stringify(session, null, 2)}
    </pre>
  );
}
