export const arbitrumNova = {
    id: 42_170,
    name: 'Arbitrum Nova',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        public: {
            http: ['https://nova.arbitrum.io/rpc'],
        },
        default: {
            http: [`https://rpc.ankr.com/arbitrumnova/c38c40685cd9b48ca9e5a8e52eee48103ef99e793c5e9442aff9fa569c8749a5`],
        },
    },
    blockExplorers: {
        default: {
            name: 'Arbiscan',
            url: 'https://nova.arbiscan.io',
            apiUrl: 'https://api-nova.arbiscan.io/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 1746963,
        },
    },
    testnet: false,
};