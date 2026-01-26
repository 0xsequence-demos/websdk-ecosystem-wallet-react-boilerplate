import {
  mainnet,
  polygon,
  Chain,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
  immutableZkEvmTestnet,
} from "wagmi/chains";

const chains = [
  mainnet,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
  immutableZkEvmTestnet,
] as [Chain, ...Chain[]];

export default chains;
