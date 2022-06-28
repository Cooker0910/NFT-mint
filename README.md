# SOLPHANT V1

The SolPhant-Minter project is an candy machine ```V2``` mint app.

A candy machine is an on-chain Solana program (or smart contract) for managing fair mint. Fair mints:

* Start and finish at the same time for everyone.

* Won't accept your funds if they're out of NFTs to sell.

# Getting Set Up

## *Prerequisites* 

* Ensure you have recent versions of both node and yarn installed.

* Install the Solana Command Line Toolkit [Here](https://docs.solana.com/cli/install-solana-cli-tools).

* Install the Metaplex Command Line Utility [Here](https://docs.metaplex.com/candy-machine-v2/getting-started).

## *Installation*

1. Install The Dependencies. Example:
> cd Frog-Nation-Minter
> yarn install

2. Define Your Environment Variables Using The Instructions Below, And Start Up The Server With ``` npm start ```

3. Edit Components And Home Page Information To Your NFT Project Information 

4. Build The Project. Example:
> yarn build

## Environment Variables

To run the project, first update ```.env``` with the following variables:
> REACT_APP_CANDY_MACHINE_ID=`Replace With Your Candy Machine Address`

This is a Solana account address. You can get the value for this from the ```.cache/temp file.``` This file is created when you run the ```metaplex upload``` command in terminal.

> REACT_APP_SOLANA_NETWORK=__PLACEHOLDER__

This identifies the Solana network you want to connect to. Options are ```devnet```, ```testnet```, and ```mainnet-beta```.

> REACT_APP_SOLANA_RPC_HOST=https://explorer-api.devnet.solana.com

This identifies the RPC server your web app will access the Solana network through. 


# Built For Candy Machine v2 Only 
