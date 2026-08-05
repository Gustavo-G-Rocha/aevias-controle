import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Safety net for password reset links.
 *
 * If the platform's reset email sends the user to any page other than
 * /reset-password (e.g. the home page "/") with a ?token= query param,
 * this guard redirects them to /reset-password?token=... so the
 * ResetPassword component can render the form.
 *
 * Only triggers when:
 *  - current path is NOT /reset-password (avoid loops)
 *  - URL has a ?token= parameter
 *  - the token looks like a reset token (non-empty string, not a JWT)
 */
export default function PasswordResetTokenGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/reset-password") return;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token || token.length < 8) return;
    // JWT tokens contain dots; reset tokens don't — skip OAuth/OIDC tokens.
    if (token.split(".").length > 2) return;

    navigate(`/reset-password?token=${encodeURIComponent(token)}`, {
      replace: true,
    });
  }, [location, navigate]);

  return null;
}