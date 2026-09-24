import { memo } from 'react';
import type { Location } from 'react-router';
import { Route, Routes, useLocation } from 'react-router';
import NotFound404 from '@/NotFound404';
import ListingsRoute from '@/components/listings/ListingsRoute';
import { ListingsActiveContext, useOverlayRouting } from '@/contexts';
import { ROUTES } from '@/utils/navigationState';
import type { RouteConfig } from '@/utils/navigationState';
import type { BackgroundLocation } from '@/types/navigation';
import PostDetailOverlay from './PostDetailOverlay';

function extractArgs(path: string): string[] {
  return [...path.matchAll(/\/:(\w+)/g)].map((match) => match[1]);
}

function filterValidations(
  args: string[],
  validations: RouteConfig['validations']
): Record<string, string[] | string | undefined> {
  return Object.keys(validations)
    .filter((key) => args.includes(key))
    .reduce(
      (obj, key) => ({
        ...obj,
        [key]: validations[key as keyof typeof validations],
      }),
      {} as Record<string, string[] | string | undefined>
    );
}

function buildRoutes(configs: RouteConfig[]): React.JSX.Element[] {
  return configs.flatMap((route) => {
    const { paths, overrides, validations } = route;
    return paths.map((path) => {
      const filteredValidations = filterValidations(
        extractArgs(path),
        validations
      );
      return (
        <Route
          element={
            <ListingsRoute
              overrides={overrides}
              validations={filteredValidations}
            />
          }
          key={path}
          path={path}
        />
      );
    });
  });
}

// Routes that render inside the post-detail overlay. Their paths come from
// navigationState's shared pattern constants, so isOverlayPath and this tree
// cannot drift apart.
const detailRouteConfigs = ROUTES.filter((route) =>
  ['comments', 'duplicates'].includes(route.overrides.listType)
);

// The route configs are module constants, so build the <Route> elements once
// instead of on every navigation-driven re-render.
const mainRouteElements = buildRoutes(ROUTES);
const detailRouteElements = buildRoutes(detailRouteConfigs);

interface BackgroundRoutesProps {
  location: Location | BackgroundLocation;
}

/**
 * The always-mounted primary tree, memoized on the location KEY (unique per
 * history entry). While the overlay is open, navigations within it change
 * only the real location — the background stays on the same history entry,
 * and re-rendering <Routes> would hand every post row a fresh
 * LocationContext identity (react-router rebuilds the context value on each
 * <Routes> render), re-rendering the whole memoized list for identical
 * output. Context updates from above (Redux, ListingsActiveContext) still
 * propagate through the memo boundary.
 *
 * NOTE: the key comparison is load-bearing — if this component ever grows
 * another prop, extend the comparator or its updates will be silently
 * swallowed.
 */
const BackgroundRoutes = memo(
  function BackgroundRoutes({
    location,
  }: BackgroundRoutesProps): React.JSX.Element {
    return (
      <Routes location={location}>
        {mainRouteElements}
        <Route element={<NotFound404 />} key="NotFound404" path="*" />
      </Routes>
    );
  },
  (prev, next) => prev.location.key === next.location.key
);

function RedditRoutes(): React.JSX.Element {
  const location = useLocation();
  const { overlayOpen, background } = useOverlayRouting();

  return (
    <>
      <ListingsActiveContext value={!overlayOpen}>
        <div inert={overlayOpen}>
          <BackgroundRoutes location={background ?? location} />
        </div>
      </ListingsActiveContext>
      {/* The overlay tree sits OUTSIDE the provider above, so it reads the
          ListingsActiveContext default (active) — while open, the overlay IS
          the active tree. */}
      {overlayOpen && (
        <PostDetailOverlay>
          <Routes>{detailRouteElements}</Routes>
        </PostDetailOverlay>
      )}
    </>
  );
}

export default RedditRoutes;
