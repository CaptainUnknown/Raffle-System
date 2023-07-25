import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

export default function useMerkle() {
  let tree;
  let leafNodes;

  const generateTree = async () => {
    let nodeList = ["grizzlyIsAmazing", "grizzlyIsAwesome"];
    leafNodes = nodeList.map((node) => keccak256(node));
    tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  };

  const getRoot = () => {
    let rootHash = tree.getHexRoot();
    return rootHash;
  };

  const getProof = async () => {
    let proofHash = tree.getHexProof(leafNodes[0]);
    return proofHash;
  };

  const getKeccak = () => {
    let nodeList = ["grizzlyIsAmazing", "grizzlyIsAwesome"];
    let l = keccak256(nodeList[0]);
    l = "0x" + l.toString("hex");
    return l;
  };

  return { generateTree, getRoot, getProof, getKeccak };
}
