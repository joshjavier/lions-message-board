import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      {/* <div> */}
      {/*   <Link to="/" className="[&.active]:font-bold"> */}
      {/*     Home */}
      {/*   </Link>{' '} */}
      {/*   <Link to="/about" className="[&.active]:font-bold"> */}
      {/*     About */}
      {/*   </Link>{' '} */}
      {/*   <Link to="/board" className="[&.active]:font-bold"> */}
      {/*     Board */}
      {/*   </Link> */}
      {/* </div> */}
      {/* <hr /> */}
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
};

export const Route = createRootRoute({ component: RootLayout });
