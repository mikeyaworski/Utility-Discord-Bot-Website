import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import './styles.css';

import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import cx from 'clsx';
import get from 'lodash.get';
import uniqBy from 'lodash.uniqby';
import { Chess, Color } from 'chess.js';
import Chessground from '@react-chess/chessground';
import type { Dests, Key } from 'chessground/types';
import useResizeObserver from 'use-resize-observer';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material';
import { Check, Clear, Handshake, Undo } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChessKing } from '@fortawesome/free-solid-svg-icons';
import ResizableBox from 'components/ResizableBox';
import { ChessGame, Option } from 'types';
import { fetchApi } from 'utils';
import { AuthContext } from 'contexts/auth';
import { useConfirmationModal, useIsMobile, useSet, useSocket } from 'hooks';
import { ChessGameForfeitData, ChessGameIdData, SocketEventTypes } from 'types/sockets';
import { useAlert } from 'alerts';
import ChallengeModal from './ChallengeModal';

const localStorageKey = 'selectedChessGameId';

function getDestinations(game: Chess, color: Color): Dests {
  const dests: Dests = new Map();
  game.moves({ verbose: true }).forEach(move => {
    if (typeof move !== 'string' && move.color === color) {
      const currentMoves = dests.get(move.from as Key);
      dests.set(move.from as Key, currentMoves ? currentMoves.concat(move.to as Key) : [move.to as Key]);
    }
  });
  return dests;
}

function getTurnInfo(userId: string, game: ChessGame) {
  const chess = new Chess();
  chess.loadPgn(game.model.pgn);
  const currentTurnUser = chess.turn() === 'w' ? game.model.white_user_id : game.model.black_user_id;
  chess.undo();
  const lastTurnUser = chess.turn() === 'w' ? game.model.white_user_id : game.model.black_user_id;
  return {
    currentTurnUser,
    isMyTurn: currentTurnUser === userId,
    madeLastMove: lastTurnUser === userId,
  };
}

const ChessView: React.FC = () => {
  const { user } = useContext(AuthContext);
  const alert = useAlert();
  const isMobile = useIsMobile();

  // TODO: Support board color and piece preferences
  const boardClasses = [
    'brown',
    'merida',
  ];

  const [busy, setBusy] = useState(false);
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const {
    open: openConfirmationModal,
    node: confirmationModal,
  } = useConfirmationModal({
    confirmColor: 'error',
    confirmText: 'Resign',
  });

  const [games, setGames] = useState<ChessGame[]>([]);
  const filteredGames = useMemo(() => uniqBy(games.reverse(), g => g.model.id).reverse(), [games]);
  const playableGames = useMemo<ChessGame[]>(() => filteredGames.filter(g => g.model.started), [filteredGames]);
  const incomingChallenges = useMemo<ChessGame[]>(() => filteredGames
    .filter(g => !g.model.started && g.model.challenged_user_id === user?.id), [filteredGames, user]);
  const outgoingChallenges = useMemo<ChessGame[]>(() => filteredGames
    .filter(g => !g.model.started && g.model.owner_user_id === user?.id), [filteredGames, user]);
  const {
    data: resignedGames,
    add: addForfeitedGame,
  } = useSet();

  const [selectedGameId, setSelectedGameId] = useState<ChessGame['model']['id'] | null>(() => {
    const pref = window.localStorage.getItem(localStorageKey);
    if (pref) return Number(pref);
    return null;
  });
  const selectedGame = useMemo<ChessGame | undefined>(() => filteredGames.find(g => g.model.id === selectedGameId), [filteredGames, selectedGameId]);
  useEffect(() => {
    if (selectedGameId) window.localStorage.setItem(localStorageKey, String(selectedGameId));
  }, [selectedGameId]);

  useEffect(() => {
    fetchApi<ChessGame[]>({
      method: 'GET',
      path: '/chess',
    }).then(res => {
      setGames(res);
    });
  }, []);

  useEffect(() => {
    if (playableGames.length > 0 && !selectedGameId) {
      setSelectedGameId(playableGames[0].model.id);
    }
  }, [playableGames, selectedGameId]);

  const { ref: containerRef, width: containerWidth, height: containerHeight } = useResizeObserver<HTMLDivElement>();
  const { ref: resizableBoxRef, width: resizableBoxWidth, height: resizableBoxHeight } = useResizeObserver<HTMLDivElement>();

  const game = useMemo(() => {
    const game = new Chess();
    if (selectedGame) game.loadPgn(selectedGame.model.pgn);
    return game;
  }, [selectedGame]);
  const dests = getDestinations(game, game.turn());
  const orientation: 'white' | 'black' = selectedGame?.model.white_user_id === user?.id ? 'white' : 'black';
  const turnColor = game.turn() === 'w' ? 'white' : 'black';
  const turnInfo = user
    && selectedGame
    && getTurnInfo(user.id, selectedGame);

  const handleGameUpdate = useCallback(async (game: ChessGame): Promise<void> => {
    setGames(old => {
      const newGames = old.map(oldGame => (oldGame.model.id === game.model.id ? game : oldGame));
      if (!old.find(g => g.model.id === game.model.id)) newGames.push(game);
      return newGames;
    });
  }, []);

  const lastMove = useMemo<Key[] | undefined>(() => {
    if (!selectedGame) return undefined;
    const game = new Chess();
    game.loadPgn(selectedGame.model.pgn);
    const lastMove = game.history({ verbose: true }).slice(-1)[0];
    if (!lastMove || typeof lastMove === 'string') return undefined;
    return [lastMove.from as Key, lastMove.to as Key];
  }, [selectedGame]);

  const socket = useSocket();
  useEffect(() => {
    socket?.on(SocketEventTypes.CHESS_GAME_UPDATED, (game: ChessGame) => {
      handleGameUpdate(game);
    });
    socket?.on(SocketEventTypes.CHESS_CHALLENGE_ACCEPTED, (game: ChessGame) => {
      handleGameUpdate(game);
    });
    socket?.on(SocketEventTypes.CHESS_CHALLENGED, (game: ChessGame) => {
      setGames(old => old.concat(game));
    });
    socket?.on(SocketEventTypes.CHESS_CHALLENGE_DECLINED, ({ id }: ChessGameIdData) => {
      setGames(old => old.filter(g => g.model.id !== id));
      alert.error(`Game declined: ${id}`);
    });
    socket?.on(SocketEventTypes.CHESS_GAME_RESIGNED, ({ id, resigner }: ChessGameForfeitData) => {
      if (user?.id === resigner) {
        alert.success(`Game resigned: ${id}`);
      } else {
        alert.success(`You've won game ${id} by resignation!`);
      }
      addForfeitedGame(id);
    });
    return () => {
      socket?.removeAllListeners();
    };
  }, [socket, handleGameUpdate, alert, user, addForfeitedGame]);

  function updateGameState(game: Chess) {
    setGames(old => old.map(g => (g.model.id === selectedGame?.model.id ? {
      ...g,
      model: {
        ...g.model,
        pgn: game.pgn(),
      },
    } : g)));
  }

  async function acceptChallenge(gameId: ChessGame['model']['id']): Promise<void> {
    setBusy(true);
    try {
      const res = await fetchApi<ChessGame>({
        method: 'POST',
        path: `/chess/${gameId}/accept`,
      });
      setBusy(false);
      await handleGameUpdate(res);
      setSelectedGameId(gameId);
    } catch (err) {
      alert.error(`Something went wrong: ${get(err, 'status')}`);
    }
    setBusy(false);
  }

  async function declineChallenge(gameId: ChessGame['model']['id']): Promise<void> {
    setBusy(true);
    await fetchApi({
      method: 'POST',
      path: `/chess/${gameId}/decline`,
    }).catch(err => {
      alert.error(`Something went wrong: ${get(err, 'status')}`);
    });
    setGames(old => old.filter(g => g.model.id !== gameId));
    setBusy(false);
  }

  async function undoMove(gameId: ChessGame['model']['id']): Promise<void> {
    setBusy(true);
    try {
      game.undo();
      updateGameState(game);
      const res = await fetchApi<ChessGame>({
        method: 'POST',
        path: `/chess/${gameId}/undo`,
      });
      await handleGameUpdate(res);
    } catch (err) {
      alert.error(`Something went wrong: ${get(err, 'status')}`);
    }
    setBusy(false);
  }

  async function resign(gameId: ChessGame['model']['id']): Promise<void> {
    setBusy(true);
    await fetchApi({
      method: 'POST',
      path: `/chess/${gameId}/resign`,
    }).catch(err => {
      alert.error(`Something went wrong: ${get(err, 'status')}`);
    });
    addForfeitedGame(gameId);
    setBusy(false);
  }

  interface Action {
    icon: typeof Handshake,
    label: string,
    fn: (gameId: ChessGame['model']['id']) => void | Promise<void>,
    disabled?: boolean,
  }
  const actions: Action[] = selectedGame ? [
    {
      icon: Handshake,
      label: 'Resign',
      fn: gameId => {
        openConfirmationModal({
          title: 'Resign?',
          details: `Are you sure you want to resign game ${gameId}?`,
          onConfirm: () => {
            return resign(gameId);
          },
        });
      },
      disabled: resignedGames.has(selectedGame.model.id),
    },
    {
      icon: Undo,
      label: 'Undo',
      fn: undoMove,
      disabled: Boolean(!turnInfo?.madeLastMove) || game.history().length === 0,
    },
  ] : [];

  const gameOptions: Option<number>[] = playableGames.map(game => ({
    label: `${game.label} - ${game.model.id}`,
    value: game.model.id,
  }));

  const actionItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  };

  // Note: Do not use the viewOnly config value in Chessground since it's bugged
  // and it seems that if it was ever true, then the board will always be view only
  const viewOnly = game.isGameOver() || resignedGames.has(selectedGameId) || busy;

  const minResizable = 100;
  const maxResizable = Math.min(containerWidth || minResizable, containerHeight || minResizable);

  const chessboard = (
    <Chessground
      contained
      config={{
        coordinates: false,
        fen: game.fen(),
        orientation,
        lastMove,
        check: game.isCheck(),
        turnColor,
        events: {
          move: async (from, to) => {
            game.move({
              from,
              to,
            });
            updateGameState(game);
            // If this move ends the game, there is no game response
            const res = await fetchApi<ChessGame | null>({
              method: 'POST',
              path: `/chess/${selectedGameId}/move`,
              body: JSON.stringify({
                move: `${from}${to}`,
              }),
            });
            if (res) await handleGameUpdate(res);
          },
        },
        highlight: {
          lastMove: true,
          check: true,
        },
        movable: {
          color: turnInfo?.isMyTurn && !viewOnly ? turnColor : undefined,
          free: false,
          dests,
        },
        premovable: {
          enabled: false,
        },
      }}
    />
  );

  return (
    <Box ref={containerRef} height="100%" display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" gap={2}>
      {confirmationModal}
      <ChallengeModal
        busy={busy}
        open={challengeModalOpen}
        onClose={() => setChallengeModalOpen(false)}
        onConfirm={async payload => {
          setBusy(true);
          try {
            const res = await fetchApi<ChessGame>({
              method: 'POST',
              path: '/chess/challenge',
              body: JSON.stringify(payload),
            });
            setGames(old => old.concat(res));
            setChallengeModalOpen(false);
          } catch (err) {
            alert.error(`Something went wrong: ${get(err, 'status')}`);
          }
          setBusy(false);
        }}
      />
      <Box maxWidth="100%" width={300} display="flex" flexDirection="column" gap={2}>
        <Autocomplete
          disablePortal
          autoHighlight
          options={gameOptions}
          fullWidth
          disableClearable
          renderInput={params => (
            <TextField
              {...params}
              label="Selected Game"
            />
          )}
          onChange={(event, newValue) => {
            if (newValue) setSelectedGameId(newValue.value);
          }}
          value={gameOptions.find(o => o.value === selectedGameId) || { label: '', value: 0 }}
        />
        {incomingChallenges.length > 0 && (
          <Card>
            <CardHeader title={<Typography variant="h6">Incoming Challenges</Typography>} />
            <CardContent sx={{ paddingTop: 0 }}>
              <List>
                {incomingChallenges.map(game => (
                  <ListItem
                    key={game.model.id}
                    disablePadding
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body1">{game.label}</Typography>
                    <Box display="flex">
                      <IconButton disabled={busy} onClick={() => acceptChallenge(game.model.id)} color="success">
                        <Check />
                      </IconButton>
                      <IconButton disabled={busy} onClick={() => declineChallenge(game.model.id)} color="error">
                        <Clear />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        {outgoingChallenges.length > 0 && (
          <Card>
            <CardHeader title={<Typography variant="h6">Outgoing Challenges</Typography>} />
            <CardContent sx={{ paddingTop: 0 }}>
              <List>
                {outgoingChallenges.map(game => (
                  <ListItem
                    key={game.model.id}
                    disablePadding
                  >
                    <Typography variant="body1">{game.label}</Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader title={<Typography variant="h6">Actions</Typography>} />
          <CardContent sx={{ pt: 0 }}>
            <List disablePadding>
              <ListItem
                button
                onClick={() => setChallengeModalOpen(true)}
                sx={actionItemStyle}
              >
                <FontAwesomeIcon icon={faChessKing} width={24} height={24} />
                <Typography variant="body1">Create Challenge</Typography>
              </ListItem>
              {selectedGame && actions.map(action => (
                <ListItem
                  key={action.label}
                  button
                  onClick={() => action.fn(selectedGame.model.id)}
                  disabled={action.disabled || busy || resignedGames.has(selectedGame.model.id)}
                  sx={actionItemStyle}
                >
                  <action.icon sx={{ width: 24, height: 24 }} />
                  <Typography variant="body1">{action.label}</Typography>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
      <Box
        ref={resizableBoxRef}
        width={containerHeight && containerWidth && containerHeight > containerWidth ? '100%' : containerHeight}
        height={containerHeight && containerWidth && containerHeight > containerWidth ? containerWidth : '100%'}
        className={cx(boardClasses)}
        display="flex"
        alignItems="center"
      >
        {isMobile ? chessboard : (
          <ResizableBox
            width={resizableBoxWidth || minResizable}
            height={resizableBoxHeight || minResizable}
            minConstraints={[minResizable, minResizable]}
            maxConstraints={[maxResizable, maxResizable]}
            lockAspectRatio
            resizeHandles={['ne']}
          >
            {chessboard}
          </ResizableBox>
        )}
      </Box>
    </Box>
  );
};

export default ChessView;
