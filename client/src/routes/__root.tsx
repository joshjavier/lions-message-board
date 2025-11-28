import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => {
  return (
    <>
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
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
