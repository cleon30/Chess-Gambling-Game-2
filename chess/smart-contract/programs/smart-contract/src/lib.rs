use anchor_lang::prelude::*;

declare_id!("GRDPj2eij7ePLGDPUH363Wvt3EEx5SMCs9kvczHUadeg");

#[program]
pub mod smart_contract {
    use super::*;

    pub fn initialize_game(ctx: Context<Initialize>, players_minimum: u32, entry_price: u64) -> Result<()> {
        let chess: &mut Account<Chess> = &mut ctx.accounts.chess;        
        chess.authority = ctx.accounts.admin.key();                
        chess.players_amount = 0;  
        chess.is_finished = false; 
        chess.is_paid = false;           
        chess.players_minimum = players_minimum;
        chess.entry_price = entry_price;

        Ok(())
    }

    pub fn join(ctx: Context<Join>) -> Result<()>{
        let chess: &mut Account<Chess> = &mut ctx.accounts.chess;
        let player: &mut Signer = &mut ctx.accounts.player;

        
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &player.key(),
            &chess.key(),
            chess.entry_price,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                player.to_account_info(),
                chess.to_account_info(),
            ],
        )?;
        // Deserialise ticket account
        let ticket: &mut Account<Ticket> = &mut ctx.accounts.ticket;                

        ticket.is_active = true;
        // Set submitter field as the address pays for account creation
        ticket.submitter = ctx.accounts.player.key();

        // Set ticket index equal to the counter
        ticket.idx = chess.players_amount;        

        // Increment total submissions counter
        chess.players_amount += 1;                      

        Ok(())  
    
    }
    
    
    pub fn set_winner(ctx: Context<SetWinner>) -> Result<()> {
        let chess: &mut Account<Chess> = &mut ctx.accounts.chess;
        let ticket: &mut Account<Ticket> = &mut ctx.accounts.ticket;                
        chess.winner = ticket.submitter;
        Ok(())
    }
    pub fn pay_out_winner(ctx: Context<Payout>) -> Result<()> {

        // Check if it matches the winner address
        let chess: &mut Account<Chess> = &mut ctx.accounts.chess;
        let recipient: &mut AccountInfo =  &mut ctx.accounts.winner;        

        // Get total money stored under original chess account
        let balance: u64 = chess.to_account_info().lamports();                      
        chess.is_paid = true;
        **chess.to_account_info().try_borrow_mut_lamports()? -= balance;
        **recipient.to_account_info().try_borrow_mut_lamports()? += balance; 
        let ticket: &mut Account<Ticket> =  &mut ctx.accounts.ticket;        

        chess.players_amount -= 1;
        ticket.is_active = false;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 9000)]
    // , constraint = chess.to_account_info().lamports == *chess.players_minimum*2
    pub chess: Account<'info, Chess>,
    #[account(mut)]
    pub admin: Signer<'info>,    
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct Join<'info> {
    #[account(init, 
        seeds = [
            &chess.players_amount.to_be_bytes(), 
            chess.key().as_ref()
        ], 
        constraint = player.to_account_info().lamports() >= chess.entry_price,
        bump, 
        payer = player, 
        space=80
    )]
    pub ticket: Account<'info, Ticket>,        
    #[account(mut)]                            
    pub chess: Account<'info, Chess>,
    #[account(mut)]                                 
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,    
}
#[derive(Accounts)]
pub struct SetWinner<'info> {    
    #[account(mut, constraint =chess.is_finished == true)]
    pub chess: Account<'info, Chess>,        
    pub ticket: Account<'info, Ticket>,
}
#[derive(Accounts)]
pub struct Payout<'info> {             
    #[account(mut, 
        constraint = 
        //ticket.submitter == *winner.key && 
        //ticket.idx == chess.winner_index &&
        chess.is_paid == false
    )]       
    pub chess: Account<'info, Chess>,          // To assert winner and withdraw lamports
    #[account(mut)]
    /// CHECK: no check
    pub winner: AccountInfo<'info>,                // Winner account
    #[account(mut, constraint = ticket.is_active == true)]                  
    pub ticket: Account<'info, Ticket>,            // Winning PDA
}

#[account]
pub struct Chess {    
    pub is_finished: bool,
    pub is_paid: bool,
    pub authority: Pubkey, 
    pub winner: Pubkey,
    pub winner_index: u32, 
    pub players_amount: u32,
    pub players_minimum: u32,
    pub entry_price: u64,
}
#[account]
#[derive(Default)] 
pub struct Ticket {    
    pub submitter: Pubkey,    
    pub idx: u32,
    pub is_active: bool,
  
}