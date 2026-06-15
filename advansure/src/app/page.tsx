import { redirect } from "next/navigation";

// Root redirect → Start-Screen
export default function Home() {
  redirect("/start");
}
