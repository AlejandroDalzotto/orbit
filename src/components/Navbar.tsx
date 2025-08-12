import NavLink from "@/components/NavLink";
import OrbitTitleLogo from "@/components/OrbitTitleLogo";

export default function Navbar() {
  return (
    <nav className="backdrop-blur-lg py-2 px-6 flex justify-between items-center">
      <OrbitTitleLogo className="fill-neutral-50 w-20 h-fit" />
      <div className="flex items-center gap-x-10 text-sm">
        <NavLink href="/wallet">wallet</NavLink>
        <NavLink href="/">record list</NavLink>
        <NavLink href="#">graphs</NavLink>
        <NavLink href="#">investments</NavLink>
      </div>
    </nav>
  )
}
