import { navbarLinks } from "@/lib/constants";
import Link from "next/link";


export default function Navbar() {
  return (
    <nav className="flex flex-col justify-center gap-y-5">
      {
        navbarLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="py-2 px-3 rounded-lg transition-colors hover:bg-white/5"
          >
            {link.label}
          </Link>
        ))
      }
    </nav>
  )
}
