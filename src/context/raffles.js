export const parseRaffles = (rafflesOnGoingRaw, raffleEndedRaw) => {
    console.log('rafflesOnGoingRaw ', rafflesOnGoingRaw);
    console.log('raffleEndedRaw ', raffleEndedRaw);
    const raffles = [];
    console.log('typeOf(rafflesOnGoingRaw) ', typeof(rafflesOnGoingRaw));
    console.log('typeof(raffleEndedRaw) ', typeof(raffleEndedRaw));
    rafflesOnGoingRaw = typeof(rafflesOnGoingRaw) === 'string' ? rafflesOnGoingRaw : '';
    raffleEndedRaw = typeof(raffleEndedRaw) === 'string' ? raffleEndedRaw : '';
    console.log('typeof(raffleEndedRaw) -- ', raffleEndedRaw);

    if (rafflesOnGoingRaw !== '') {
        const raffleInfoRaw = ((rafflesOnGoingRaw).toString()).split(",");
        for (let i = 0; i < raffleInfoRaw.length; i += 10) {
            const raffle = {
                raffleId: raffleInfoRaw[i],
                price: raffleInfoRaw[i+1] / 10**18, // 18 decimals
                // Temporary: (Usual endedRaffleInfoRaw[i+2] / 1000000000000000000)
                doopPrice: raffleInfoRaw[i] === '0' ? 1 : raffleInfoRaw[i+2] / 10**18, // 18 decimals
                img: `https://picsum.photos/2/2?random=${i*9}`,
                payableWithDoop: raffleInfoRaw[i + 5] === 'true',
                hasEnded: false,
                endTime: new Date(raffleInfoRaw[i+3] * 1000),
                winner: !raffleInfoRaw[i+7] ? 'Not Selected Yet' : raffleInfoRaw[i+7],
                participants: raffleInfoRaw[i + 4],
                nftContract: raffleInfoRaw[i+8],
                nftTokenId: raffleInfoRaw[i+9]
            }
            raffles.push(raffle);
        }
    }

    if (raffleEndedRaw !== '') {
        const endedRaffleInfoRaw = ((raffleEndedRaw).toString()).split(",");
        for (let i = 0; i < endedRaffleInfoRaw.length; i += 10) {
            const raffle = {
                raffleId: endedRaffleInfoRaw[i],
                price: endedRaffleInfoRaw[i+1] / 10**18, // 18 decimals
                // Temporary: (Usual endedRaffleInfoRaw[i+2] / 1000000000000000000)
                doopPrice: endedRaffleInfoRaw[i] === '0' ? 1 : endedRaffleInfoRaw[i+2] / 10**18, // 18 decimals
                payableWithDoop: endedRaffleInfoRaw[i + 5] === 'true',
                img: `https://picsum.photos/2/2?random=${i*9}`,
                hasEnded: true,
                endTime: new Date(endedRaffleInfoRaw[i+3] * 1000),
                winner: !endedRaffleInfoRaw[i+7] ? 'Not Selected Yet' : endedRaffleInfoRaw[i+7],
                participants: endedRaffleInfoRaw[i + 4],
                nftContract: endedRaffleInfoRaw[i+8],
                nftTokenId: endedRaffleInfoRaw[i+9]
            }
            raffles.push(raffle);
        }
    }

    console.log('Raffles from parser', raffles);
    return raffles;
}