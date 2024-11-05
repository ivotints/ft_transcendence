import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

let setWinTableAccess = () => {};
let setTournamentGameAccess = () => {};

const ProtectedRoute = ({ isLoggedIn }) => {
  const location = useLocation();

  // Define permission states
  const [userPermissions, setUserPermissions] = useState({
    canAccessWinTable: false,
    canAccessTournamentGame: false,
  });

  // Update functions to modify permissions from outside
  setWinTableAccess = (access) => {
    setUserPermissions((prevPermissions) => ({
      ...prevPermissions,
      canAccessWinTable: access,
    }));
  };

  setTournamentGameAccess = (access) => {
    setUserPermissions((prevPermissions) => ({
      ...prevPermissions,
      canAccessTournamentGame: access,
    }));
  };

  // Access control based on route and permissions
  const currentPath = location.pathname;
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  if (
    (currentPath === "/win-table" && !userPermissions.canAccessWinTable) ||
    (currentPath === "/tournament-game" && !userPermissions.canAccessTournamentGame)
  ) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

// Export functions to update permissions from outside
export { setWinTableAccess, setTournamentGameAccess };
export default ProtectedRoute;
