import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaTwitterSquare, FaDiscord } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import { GatewayProvider } from '@civic/solana-gateway-react';

import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from './candymachine/candy-machine';
import { AlertState } from './candymachine/utils';
import { Header } from './candymachine/Header';
import { MintButton } from './candymachine/MintButton';

import ProgressiveImage from './components/ProgressiveImage/ProgressiveImage';
import styles from './Home.module.css';
import SOLPAHNT_LOGO from './assets/images/solphant-logo.png';
import SOLPAHNT_PLACEHOLDER from './assets/images/solphant-placeholder.png';
import ELEPHANT_LOGO from './assets/images/elephant-logo.png';
import ELEPHANT_PLACEHOLDER from './assets/images/elephant-placeholder.png';
import ALIMANGO_LOGO from './assets/images/alimango-logo.png';
import ALIMANGO_PLACEHOLDER from './assets/images/alimango-placeholder.png';

const ConnectButton = styled(WalletDialogButton)`
  background: linear-gradient(38deg, #c1bfe6 30%, #ea88dd 70%);
`;

const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection,
        );
        setCandyMachine(cndy);
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const onMint = async () => {
    try {
      setIsUserMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            true,
          );
        }

        if (status && !status.err) {
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setIsUserMinting(false);
    }
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);

  return (
    <>
      <div style={{ background: "linear-gradient(135deg, #8bfccd, #c5b0fb)"}}>
        <div className={styles.header}>
          <ProgressiveImage
            src={ELEPHANT_LOGO}
            alt=""
            placeholder={ELEPHANT_PLACEHOLDER}
            errorImage=""
            className={styles.logo}
          />
          <ProgressiveImage
            src={ALIMANGO_LOGO}
            alt=""
            placeholder={ALIMANGO_PLACEHOLDER}
            errorImage=""
            className={styles.logo}
          />
        </div>
        <div className={styles.container}>
          <div className={styles.phantLogo}>
            <ProgressiveImage
              src={SOLPAHNT_LOGO}
              alt=""
              placeholder={SOLPAHNT_PLACEHOLDER}
              errorImage=""
              className=""
            />
          </div>
          <div className={`d-flex flex-column ${styles.rightpan}`}>
            <h1 className={styles.title}>SOLPHANT V1</h1>
            <div className={styles.text}>SolPhant V1 is a version 1 collection of 3999 NFT by Phant on Solana Network. Each NFT can be staked without leaving the wallet of the holder. This will also be a key to some dApp we will build.</div>
            <div className="d-flex justify-content-center">
              <div className={styles.mainButton}>
                {wallet.connected ? (
                  <>
                    <Header candyMachine={candyMachine} />
                    <MintContainer>
                      {candyMachine?.state.isActive &&
                      candyMachine?.state.gatekeeper &&
                      wallet.publicKey &&
                      wallet.signTransaction ? (
                        <GatewayProvider
                          wallet={{
                            publicKey:
                              wallet.publicKey ||
                              new PublicKey(CANDY_MACHINE_PROGRAM),
                            //@ts-ignore
                            signTransaction: wallet.signTransaction,
                          }}
                          gatekeeperNetwork={
                            candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                          }
                          clusterUrl={rpcUrl}
                          options={{ autoShowModal: false }}
                        >
                          <MintButton
                            candyMachine={candyMachine}
                            isMinting={isUserMinting}
                            onMint={onMint}
                          />
                        </GatewayProvider>
                      ) : (
                        <MintButton
                          candyMachine={candyMachine}
                          isMinting={isUserMinting}
                          onMint={onMint}
                        />
                      )}
                    </MintContainer>
                  </>
                ) : (
                  <ConnectButton>CONNECT WALLET</ConnectButton>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <FaTwitterSquare className={styles.socialTwitter} />
          <div className={styles.circleDiscord}>
            <FaDiscord
              className={styles.socialDiscord}
              style={{ color: "linear-gradient(135deg, #8bfccd, #c5b0fb)"}}
            />
          </div>
        </div>
      </div>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Home;

