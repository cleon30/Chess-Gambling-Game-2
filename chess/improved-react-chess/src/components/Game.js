import React, { useEffect, useState } from 'react';
import Board from './Board';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, AnchorProvider, web3
} from '@project-serum/anchor';
import './App.css';
import idl from './idl.json';
import kp from './keypair.json';
import kp1 from './keypair2.json';
import kp2 from './keypair3.json';
import kp3 from './keypair4.json';
import FallenPieces from './FallenPieces.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';

import {
  checkerPos,
  getPieceIndex,
  getOpponentPlayerId,
  isGameOver,
  isPossibleAndLegal,
  kingWillBeCapturedBy,
  returnBoardAfterMove,
  highlightPossiblePathsFromSrc,
  getPlayerPieces
} from '../helpers/model';

const { SystemProgram, Keypair } = web3;
const anchor = require("@project-serum/anchor");
const arr = Object.values(kp._keypair.secretKey);
const arr1 = Object.values(kp1._keypair.secretKey);
const arr2 = Object.values(kp2._keypair.secretKey);
const arr3 = Object.values(kp3._keypair.secretKey);
const secret = new Uint8Array(arr);
const secret1 = new Uint8Array(arr1);
const secret2 = new Uint8Array(arr2);
const secret3 = new Uint8Array(arr3);
const LAMPORTS_PER_SOL = 1000000000;
const adminAccount = web3.Keypair.fromSecretKey(secret)
const baseAccount = web3.Keypair.fromSecretKey(secret1)
const programID = new PublicKey(idl.metadata.address);
const player1= web3.Keypair.fromSecretKey(secret2)
const player2 = web3.Keypair.fromSecretKey(secret3)
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed"
}





export default function Game() {
  const [squares, setSquares] = useState(initialiseChessBoard());
  const [whiteFallenPieces, setWhiteFallenPieces] = useState([]);
  const [blackFallenPieces, setBlackFallenPieces] = useState([]);
  const [player, setPlayer] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [status, setStatus] = useState('');
  const [turn, setTurn] = useState('white');
  const [gameOverMsg, setGameOverMsg] = useState();
  const [enPassantTarget, setEnPassantTarget] = useState({});
  const [walletAddress, setWalletAddress] = useState(null);
  

  
  const [blackCastled, setBlackCastled] = useState({
    left: false,
    right: false
  });
  const [whiteCastled, setWhiteCastled] = useState({
    left: false,
    right: false
  });
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };
  const joining1 = async() =>{
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    var idx = (await program.account.chess.fetch(baseAccount.publicKey)).playersAmount;
    var buf2 = Buffer.alloc(4);
    buf2.writeUIntBE(idx, 0, 4);
    var ticket1 = (await anchor.web3.PublicKey.findProgramAddress([buf2, baseAccount.publicKey.toBytes()], program.programId))[0];

    console.log("ping")
    await program.methods
    .join()
    .accounts({
      chess: baseAccount.publicKey,
      player: player1.publicKey,
      ticket: ticket1,
      systemProgram: SystemProgram.programId,
    })
    .signers([player1])
    .rpc();
  }
  const joining2 = async() =>{
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    var idx2 = (await program.account.chess.fetch(baseAccount.publicKey)).playersAmount;
    var buf3 = Buffer.alloc(4);
    buf3.writeUIntBE(idx2, 0, 4);
    var ticket2 = (await anchor.web3.PublicKey.findProgramAddress([buf3, baseAccount.publicKey.toBytes()], program.programId))[0];

    console.log("ping")
    await program.methods
    .join()
    .accounts({
      chess: baseAccount.publicKey,
      player: player2.publicKey,
      ticket: ticket2,
      systemProgram: SystemProgram.programId,
    })
    .signers([player2])
    .rpc();
  }
  const connectWallet = async () => {
    const { solana } = window;
  
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
      console.log(adminAccount.publicKey.toString());
      console.log(baseAccount.publicKey.toString());
      console.log(player1.publicKey.toString());
      console.log(player2.publicKey.toString())
      await joining1();
      await joining2();
    }
  };
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  };
 
 
  const createChessAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.methods
      .initializeGame(new anchor.BN(2), new anchor.BN(0.1 * LAMPORTS_PER_SOL))
      .accounts({
        chess: baseAccount.publicKey,
        admin: adminAccount.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([baseAccount,adminAccount])
        .rpc();
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  };
  
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>

  );
  
  // const submision = () =>{
  
  //   const provider = getProvider();
  //   const program = new Program(idl, programID, provider);
  //   console.log("ping")
  //   await program.methods
  //   .payOutWinner()
  //   .accounts({
  //     ticket,
  //     chess: chess.publicKey,
  //     winner: players[winnerIdx].publicKey,
  //   })
  //   .signers([])
  //   .rpc();

  // };
  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't be initialized.
    
      return (
        <div className="connected-container">
          <button className="cta-button submit-image-button" onClick={createChessAccount}>
            Place your bet
          </button>
        </div>
      )
    
    } 
  
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);


  
  useEffect(() => {
    
    if (walletAddress){
    const players = { white: 1, black: 2 };
    setSquares(squares =>
      squares.map(square =>
        square.player === players[turn]
          ? {
              ...square,
              state:
                gameOverMsg ||
                ['check', 'checkmate'].indexOf(square.state) !== -1
                  ? square.state
                  : 'highlighted'
            }
          : square
      )
    );
          }
  }, [turn]);


  return (
    <div className="App">
      {/* This was solely added for some styling fanciness */}
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">♚Chess Gambling Game♚</p>
          <p className="sub-text">Chess Game built on Solana ✨</p>
     
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
          </div>
    
  );
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <FallenPieces whiteFallenPieces={whiteFallenPieces} />
        <Board
          squares={squares}
          turn={turn}
          onClick={handleClick}
          onCastling={handleCastling}
          player={player}
          blackCastled={blackCastled}
          whiteCastled={whiteCastled}
        />
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ lineHeight: 2 }}>{status || gameOverMsg}</div>
          <FallenPieces blackFallenPieces={blackFallenPieces} />
        </div>
      </div>
    </div>
    </div>
  
    
    
  );

  function handleCastling(direction) {
    const opponent = getOpponentPlayerId(player);
    const { playerPieces } = getPlayerPieces({
      player: opponent,
      squares
    });
    let kingPos = getPieceIndex({ player, squares, type: 'king' });
    let rookPos = -1;
    let kingMidDest = -1;
    let kingEndDest = -1;

    if (turn === 'white') {
      if (direction === 'right') {
        kingMidDest = 61;
        kingEndDest = 62;
        rookPos = 63;
      } else {
        kingMidDest = 59;
        kingEndDest = 58;
        rookPos = 56;
      }
    } else {
      if (direction === 'right') {
        kingMidDest = 5;
        kingEndDest = 6;
        rookPos = 7;
      } else {
        kingMidDest = 3;
        kingEndDest = 2;
        rookPos = 0;
      }
    }
    for (let piece of playerPieces) {
      if (
        isPossibleAndLegal({
          src: piece.index,
          dest: kingMidDest,
          squares,
          player: opponent
        })
      ) {
        setSquares(squares =>
          squares.map((square, index) => {
            if (index === piece.index) {
              return {
                ...square,
                state: 'danger'
              };
            }
            return {
              ...square,
              state: square.state === 'danger' ? '' : square.state
            };
          })
        );
        setStatus(
          `Castling not allowed because the king cannot pass through a square that is attacked by an enemy piece`
        );
        return;
      }
    }
    const rookDest = kingMidDest;
    const newSquares = returnBoardAfterMove({
      squares: returnBoardAfterMove({
        squares,
        src: kingPos,
        dest: kingEndDest,
        player
      }),
      src: rookPos,
      dest: rookDest,
      player
    });
    if (handleMove({ myKingIndex: kingEndDest, newSquares }) === 'success') {
      if (turn === 'black') {
        setBlackCastled(castled => ({ ...castled, [direction]: true }));
      } else {
        setWhiteCastled(castled => ({ ...castled, [direction]: true }));
      }
    }
  }

  function handleClick(i) {
    if (selectedIndex === -1) {
      if (!squares[i] || squares[i].player !== player) {
        return;
      }
      setSquares(squares =>
        highlightPossiblePathsFromSrc({
          player,
          squares,
          src: i,
          enPassantTarget
        })
      );
      setStatus('');
      setSelectedIndex(i);
    } else {
      if (squares[i] && squares[i].player === player) {
        setSelectedIndex(i);
        setStatus('');
        setSquares(squares =>
          highlightPossiblePathsFromSrc({ player, squares, src: i })
        );
      } else {
        if (
          isPossibleAndLegal({
            src: selectedIndex,
            dest: i,
            squares,
            player,
            enPassantTarget
          })
        ) {
          const newSquares = returnBoardAfterMove({
            squares,
            src: selectedIndex,
            dest: i,
            player,
            enPassantTarget
          });
          const myKingIndex = getPieceIndex({
            player,
            squares: newSquares,
            type: 'king'
          });
          handleMove({ myKingIndex, newSquares, dest: i, src: selectedIndex });
        }
      }
    }
  }

  function handleMove({ myKingIndex, newSquares, dest, src }) {
    const newWhiteFallenPieces = [...whiteFallenPieces];
    const newBlackFallenPieces = [...blackFallenPieces];
    const potentialCapturers = kingWillBeCapturedBy({
      kingIndex: myKingIndex,
      player,
      squares: newSquares
    });
    if (potentialCapturers.length > 0) {
      setSquares(squares =>
        squares.map((square, index) => {
          if (potentialCapturers.indexOf(index) !== -1) {
            return {
              ...square,
              state: 'danger'
            };
          }
          return {
            ...square,
            state: square.state === 'danger' ? '' : square.state
          };
        })
      );
      setStatus('Your King will be captured if you make that move.');
      return;
    }
    if (dest) {
      if (squares[src].type === 'pawn') {
        if (enPassantTarget && enPassantTarget.player) {
          const srcRow = Math.floor(src / 8);
          const destRow = Math.floor(dest / 8);
          const destColumn = dest % 8;
          const attacking =
            player === 1 ? srcRow - destRow === 1 : destRow - srcRow === 1;
          const enPassanting =
            !squares[dest].player &&
            enPassantTarget.player !== player &&
            attacking &&
            enPassantTarget.index % 8 === destColumn;
          if (enPassanting) {
            enPassantTarget.player === 1
              ? newWhiteFallenPieces.push(squares[enPassantTarget.index])
              : newBlackFallenPieces.push(squares[enPassantTarget.index]);
              console.log(squares[dest].type);
              console.log(squares[dest].player)
          }
        }
      }
      if (squares[dest].player) {
        squares[dest].player === 1
          ? newWhiteFallenPieces.push(squares[dest])
          : newBlackFallenPieces.push(squares[dest]);
          console.log(squares[dest].type);
          console.log(squares[dest].player)

      }
    }
    setSelectedIndex(-1);
    const theirKingIndex = getPieceIndex({
      player: getOpponentPlayerId(player),
      squares: newSquares,
      type: 'king'
    });
    if (
      checkerPos({
        squares: newSquares,
        kingIndex: theirKingIndex,
        player
      }).length !== 0
    ) {
      newSquares[theirKingIndex] = {
        ...newSquares[theirKingIndex],
        state: 'check'
      };
    }
    if (dest) {
      newSquares[dest].moved = true;
    }
    setSquares(newSquares);
    setWhiteFallenPieces(newWhiteFallenPieces);
    setBlackFallenPieces(newBlackFallenPieces);
    setStatus('');
    const endGame = async() =>{

      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      let players = [player1,player2]
      var buf = Buffer.alloc(4);
      let winnerIdx = squares[dest].player -1;
      buf.writeUIntBE(winnerIdx, 0, 4);
      var ticket = (await anchor.web3.PublicKey.findProgramAddress([buf, baseAccount.publicKey.toBytes()], program.programId))[0];
      // Get chess ticket
      await program.methods
          .payOutWinner()
          .accounts({
          ticket: ticket,
          chess: baseAccount.publicKey,
          winner: players[winnerIdx].publicKey,
      })
          .signers([])
          .rpc();
      

    };
    const gameOver = isGameOver({
      player: getOpponentPlayerId(player),
      squares: newSquares,
      enPassantTarget
    });
    if (gameOver) {
      if (gameOver === 'Checkmate') {
        setSquares(squares =>
          squares.map((square, index) =>
            index === theirKingIndex
              ? { ...square, state: 'checkmate' }
              : square
          )
        );
      }
      endGame();
      setGameOverMsg(gameOver);
    }
    if (dest) {
      const target =
        newSquares[dest].type === 'pawn' &&
        (dest === src + 16 || dest === src - 16)
          ? { index: dest, player: newSquares[dest].player }
          : {};
      setEnPassantTarget(target);
    }
    setPlayer(getOpponentPlayerId(player));
    setTurn(turn === 'white' ? 'black' : 'white');
    return 'success';
  }
}