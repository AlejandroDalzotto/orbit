import Link, { LinkProps } from 'next/link'

type NavLinkProps = LinkProps & { children: React.ReactNode };

export default function NavLink({ children, ...props }: NavLinkProps) {
  return (
    <Link {...props} className='hover:underline'>{children}</Link>
  )
}
