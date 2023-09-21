const supportedChains = [
  {
    name: "BSC Mainnet",
    short_name: "bsc-mainnet",
    chain: "BSC",
    network: "bsc-mainnet",
    chain_id: 56,
    network_id: 56,
    rpc_url: "https://bsc-dataseed2.bnbchain.org",
    native_currency: {
      symbol: "BNB",
      name: "BSC Chain",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "BSC Testnet",
    short_name: "bsc-testnet",
    chain: "BSC",
    network: "bsc-testnet",
    chain_id: 97,
    network_id: 97,
    rpc_url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    native_currency: {
      symbol: "tBNB",
      name: "BSC Chain",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Localhost",
    short_name: "localhost",
    chain: "Localhost",
    network: "localhost",
    chain_id: 5777,
    network_id: 5777,
    rpc_url: "",
    native_currency: {
      symbol: "tBNB",
      name: "Localhost",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  }
];

export default supportedChains;
