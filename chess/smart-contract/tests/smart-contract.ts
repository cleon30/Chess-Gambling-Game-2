import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert, expect } from "chai";
import { SmartContract } from "../target/types/smart_contract";

const { SystemProgram } = anchor.web3;
describe("smart-contract", () => {
  
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const LAMPORTS_PER_SOL = 1000000000;
  const chess = anchor.web3.Keypair.generate();
  const chess_admin = anchor.web3.Keypair.generate();
  const player1 = anchor.web3.Keypair.generate();
  const player2 = anchor.web3.Keypair.generate();
  const player3 = anchor.web3.Keypair.generate();
  const insufficientMoneyPlayer = anchor.web3.Keypair.generate();
  const program = anchor.workspace.SmartContract as Program<SmartContract>;
  const players = [player1, player2];
  const winnerIdx = 0;
  before(async () => {
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        chess_admin.publicKey,
        1*LAMPORTS_PER_SOL
      ),
      "confirmed"
    );
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        chess.publicKey,
        1 * LAMPORTS_PER_SOL
      )
    );
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        players[0].publicKey,
        1 * LAMPORTS_PER_SOL
      )
    );
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        players[1].publicKey,
        1 * LAMPORTS_PER_SOL
      )
    );
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        player3.publicKey,
        0.8 * LAMPORTS_PER_SOL
      )
    );
  });
  it("Creates a chess account", async () => {
    await program.methods
      .initializeGame(new anchor.BN(2), new anchor.BN(0.1 * LAMPORTS_PER_SOL))
      .accounts({
        chess: chess.publicKey,
        admin: chess_admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([chess, chess_admin])
      .rpc();
    let chessState = await program.account.chess.fetch(chess.publicKey);

    expect(chessState.playersAmount).to.equal(0);

    expect(chessState.authority.toString()).to.equal(
      chess_admin.publicKey.toString()
    );

    expect(chessState.playersMinimum).to.equal(2);
  });
  it("Player 1 joins the game", async () => {
    let startBalance: number = await program.provider.connection.getBalance(
        players[0].publicKey
    );
    const idx: number = (await program.account.chess.fetch(chess.publicKey))
      .playersAmount;
    const buf = Buffer.alloc(4);
    buf.writeUIntBE(idx, 0, 4);
    const [ticket, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [buf, chess.publicKey.toBytes()],
      program.programId
    );
    await program.methods
      .join()
      .accounts({
        chess: chess.publicKey,
        player: players[0].publicKey,
        ticket,
        systemProgram: SystemProgram.programId,
      })
      .signers([players[0]])
      .rpc();

    const chessState = await program.account.chess.fetch(chess.publicKey);
    expect(chessState.playersAmount).to.equal(idx + 1);

    const ticketState = await program.account.ticket.fetch(ticket);
    expect(ticketState.submitter.toString()).to.equal(
      players[0].publicKey.toString()
    );
    expect(ticketState.isActive).to.be.true;
    let endBalanace = await program.provider.connection.getBalance(players[0].publicKey);
    expect(endBalanace).to.be.lessThan(startBalance);
  });
  it("Player 3 unable to join the chess because of insufficient funds", async () => {
    let idx: number = (await program.account.chess.fetch(chess.publicKey))
        .playersAmount;
    const buf = Buffer.alloc(4);
    buf.writeUIntBE(idx, 0, 4);
    const [ticket] = await anchor.web3.PublicKey.findProgramAddress(
        [buf, chess.publicKey.toBytes()],
        program.programId
    );
    try {
      await program.methods
          .join()
          .accounts({
            chess: chess.publicKey,
            player: player3.publicKey,
            ticket,
            systemProgram: SystemProgram.programId,
          })
          .signers([player3])
          .rpc();
      assert.fail();
    } catch (e) {
      console.log(e)
      const chessState = await program.account.chess.fetch(
          chess.publicKey
      );
      expect(chessState.playersAmount).to.equal(2);
    }
  });
  it("Player 1 and 2 joins the game", async () => {
    let idx: number = (await program.account.chess.fetch(chess.publicKey))
      .playersAmount;
    const buf2 = Buffer.alloc(4);
    buf2.writeUIntBE(idx, 0, 4);
    const [ticket1] = await anchor.web3.PublicKey.findProgramAddress(
      [buf2, chess.publicKey.toBytes()],
      program.programId
    );
    await program.methods
      .join()
      .accounts({
        chess: chess.publicKey,
        player: players[0].publicKey,
        ticket: ticket1,
        systemProgram: SystemProgram.programId,
      })
      .signers([players[0]])
      .rpc();

    let chessState = await program.account.chess.fetch(chess.publicKey);
    expect(chessState.playersAmount).to.equal(idx + 1);

    const ticket1State = await program.account.ticket.fetch(ticket1);
    expect(ticket1State.submitter.toString()).to.equal(
      players[0].publicKey.toString()
    );
    expect(ticket1State.isActive).to.be.true;

    idx = (await program.account.chess.fetch(chess.publicKey))
      .playersAmount;
    const buf3 = Buffer.alloc(4);
    buf3.writeUIntBE(idx, 0, 4);
    const [ticket2] = await anchor.web3.PublicKey.findProgramAddress(
      [buf3, chess.publicKey.toBytes()],
      program.programId
    );
    await program.methods
      .join()
      .accounts({
        chess: chess.publicKey,
        player: players[1].publicKey,
        ticket: ticket2,
        systemProgram: SystemProgram.programId,
      })
      .signers([players[1]])
      .rpc();

    chessState = await program.account.chess.fetch(chess.publicKey);
    expect(chessState.playersAmount).to.equal(idx + 1);

    const ticket2State = await program.account.ticket.fetch(ticket2);
    expect(ticket2State.submitter.toString()).to.equal(
      players[1].publicKey.toString()
    );
    expect(ticket2State.isActive).to.be.true;
  });
  it("Picks winner", async () => {
    

  let startBalance: number = await program.provider.connection.getBalance(
    players[winnerIdx].publicKey
  );

  const buf = Buffer.alloc(4);
  buf.writeUIntBE(winnerIdx, 0, 4);

  const [ticket] = await anchor.web3.PublicKey.findProgramAddress(
    [buf, chess.publicKey.toBytes()],
    program.programId
  );

  // Get chess ticket
  await program.methods
    .payOutWinner()
    .accounts({
      ticket,
      chess: chess.publicKey,
      winner: players[winnerIdx].publicKey,
    })
    .signers([])
    .rpc();

    let endBalanace = await program.provider.connection.getBalance(players[winnerIdx].publicKey);
    expect(endBalanace).to.be.greaterThan(startBalance);
  });
});
