import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { error } from 'logging';

const Home: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkLoggedIn() {
      try {
        await fetch(`${process.env.REACT_APP_API_ROOT}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).then(response => response.json());
        setLoggedIn(true);
      } catch {
        // Intentionally empty - they're not logged in
      }
    }
    checkLoggedIn();
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get('access_token');
      const tokenType = params.get('token_type');
      const expiresIn = params.get('expires_in');
      const scope = params.get('scope');
      const data = {
        token,
        tokenType,
        expiresIn,
        scope,
      };
      async function logIn() {
        try {
          await fetch(`${process.env.REACT_APP_API_ROOT}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
          });
          window.history.replaceState(null, '', '#');
          await checkLoggedIn();
        } catch (err) {
          error('Error:', err);
        }
      }
      if (token) {
        logIn();
      }
    }
  }, []);

  async function handleLogOut() {
    try {
      await fetch(`${process.env.REACT_APP_API_ROOT}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      await setLoggedIn(false);
    } catch (err) {
      error('Error:', err);
    }
  }

  return (
    <div className="main-page">
      {loggedIn ? (
        <Button
          onClick={() => handleLogOut()}
          variant="contained"
        >
          Log Out
        </Button>
      ) : (
        <Button
          href={`https://discord.com/api/oauth2/authorize?client_id=${
            process.env.REACT_APP_DISCORD_BOT_CLIENT_ID
          }&redirect_uri=${
            encodeURIComponent(process.env.REACT_APP_REDIRECT_URI!)
          }&response_type=token&scope=identify%20guilds`}
          variant="contained"
        >
          Log In
        </Button>
      )}
    </div>
  );
};

export default Home;
