import { Header } from "./Header"
import { MainNavigation } from "./MainNavigate"

export const Layout = ( { children }: { children: React.ReactNode } ) => {
  return ( <>
    <MainNavigation /><main>{children}</main>
  </>
  )
}