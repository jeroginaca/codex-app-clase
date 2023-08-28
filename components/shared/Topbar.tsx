import Link from "next/link"
import Image from "next/image"
import { OrganizationSwitcher, SignOutButton, SignedIn, UserButton } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

const Topbar = () => {
  return (
    <nav className="topbar">
        <Link href="/" className="flex items-center gap-4">
            <Image src="/assets/logo.svg" alt="logo" width={128} height={66} />
        </Link>

        <div className="flex items-center gap-1">
            <div className="block md:hidden">
                <SignedIn>
                    <SignOutButton>
                        <div className="flex cursor-pointer">
                            <Image 
                                src="/assets/logout.svg"
                                alt="logout"
                                width={24}
                                height={24}
                            />
                        </div>
                    </SignOutButton>
                </SignedIn>
            </div>
            <div className="py-2 px-4">
                <UserButton 
                    afterSignOutUrl="/" 
                    appearance={{
                         baseTheme: dark
                    }}
                />
            </div>
        </div>
    </nav>
  )
}

export default Topbar