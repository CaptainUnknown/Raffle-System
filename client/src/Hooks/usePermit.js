import { hexToNumber, slice } from "viem"

export const UsePermit = () => {
    /**
     * Signs a permit for a given ERC-2612 ERC20 token using the specified parameters.
     *
     * @param {WalletClient} walletClient - Wallet client to invoke for signing the permit message
     * @param {SignPermitProps} props - The properties required to sign the permit.
     * @param {string} props.contractAddress - The address of the ERC20 token contract.
     * @param {string} props.erc20Name - The name of the ERC20 token.
     * @param {number} props.value - The amount of the ERC20 to approve.
     * @param {string} props.ownerAddress - The address of the token holder.
     * @param {string} props.spenderAddress - The address of the token spender.
     * @param {number} props.deadline - The permit expiration timestamp in seconds.
     * @param {number} props.nonce - The nonce of the address on the specified ERC20.
     * @param {number} props.chainId - The chain ID for which the permit will be valid.
     * @param {number} props.permitVersion - The version of the permit (optional, defaults to "1").
     */
    const signPermit = async (
        walletClient,
        {
            contractAddress,
            erc20Name,
            ownerAddress,
            spenderAddress,
            value,
            deadline,
            nonce,
            chainId,
            permitVersion
        }
    ) => {
        const types = {
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ]
        }

        const domainData = {
            name: erc20Name,
            /** We assume 1 if permit version is not specified */
            version: permitVersion ?? "1",
            chainId: chainId,
            verifyingContract: contractAddress
        }

        const message = {
            owner: ownerAddress,
            spender: spenderAddress,
            value,
            nonce,
            deadline
        }

        const signature = await walletClient.signTypedData({
            account: ownerAddress,
            message,
            domain: domainData,
            primaryType: "Permit",
            types
        })
        const [r, s, v] = [
            slice(signature, 0, 32),
            slice(signature, 32, 64),
            slice(signature, 64, 65)
        ]
        return { r, s, v: hexToNumber(v) }
    }

    return { signPermit }
}