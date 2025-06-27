import OrbitTitleLogo from "@/components/OrbitTitleLogo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-y-5">
      <OrbitTitleLogo className="fill-neutral-50" />
      <p>Get ready to keep a record of all your expenses and incomes!</p>
      <Link href="/init" className="px-4 py-2 font-bold bg-indigo-500 rounded-lg">let&apos;s do it</Link>
    </div>
  );
}
