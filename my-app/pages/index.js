import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { BigNumber, Contract, providers, utils } from "ethers";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {
  CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
  CRYPTO_DEV_TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
} from "../constants/index";
export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  // Get Provider or Signer
  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();

      if (chainId !== 4) {
        window.alert("Please switch to Rinkeby network!");
        throw new Error("Please switch to Rinkeby network!");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;
    } catch (err) {
      console.error(err);
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getTokensToBeClaimed = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const cryptoDevTokenContract = new Contract(
        CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_CONTRACT_ABI,
        signer
      );
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        var amount = 0;

        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await cryptoDevTokenContract.tokenIdsClaimed(tokenId);

          if (!claimed) {
            amount += 1;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount.toString()));
      }
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };

  // get the balance of user
  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const cryptoDevTokenContract = new Contract(
        CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_CONTRACT_ABI,
        signer
      );

      const address = await signer.getAddress();

      const tokenBalance = await cryptoDevTokenContract.balanceOf(address);
      setBalanceOfCryptoDevTokens(tokenBalance);
    } catch (err) {
      console.error(err);
    }
  };

  // get the total amount of token minted
  const getTotalTokenMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const cryptoDevTokenContract = new Contract(
        CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_CONTRACT_ABI,
        provider
      );
      const totalTokenMinted = await cryptoDevTokenContract.totalSupply();
      setTokensMinted(totalTokenMinted);
    } catch (err) {
      console.error(err);
    }
  };

  // mint tokens
  const mintCryptoDevTokens = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const cryptoDevTokenContract = new Contract(
        CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.001 * amount;

      const txn = await cryptoDevTokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await txn.wait();
      setLoading(false);
      window.alert("Successfully minted Crypto Dev Token");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokenMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  const claimCryptoDevTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const cryptoDevTokenContract = new Contract(
        CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_CONTRACT_ABI,
        signer
      );

      const txn = await cryptoDevTokenContract.claim();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      window.alert("Successfully claimed the Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokenMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  // render button based on condition
  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          />
        </div>
        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevTokens(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
      getBalanceOfCryptoDevTokens();
      getTotalTokenMinted();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Crypto Devs ICO</title>
        <meta name="description" content="ICO-dApp"></meta>
        <link rel="icon" href="./favicon.ico"></link>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)}{" "}
                Crypto Dev Tokens
              </div>
              <div className={styles.description}>
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted
              </div>
              {renderButton()}
            </div>
          ) : (
            <button className={styles.button}>Connect your wallet</button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg"></img>
        </div>
      </div>
      <footer className={styles.footer}>Made with by &#10084; Sk Sajid</footer>
    </div>
  );
}
