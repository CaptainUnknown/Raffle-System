export const parseRaffles = (rafflesOnGoingRaw, raffleEndedRaw) => {
    console.log('rafflesOnGoingRaw ', rafflesOnGoingRaw);
    console.log('raffleEndedRaw ', raffleEndedRaw);
    const raffles = [];
    rafflesOnGoingRaw = typeof(rafflesOnGoingRaw) === 'string' ? rafflesOnGoingRaw : '';
    raffleEndedRaw = typeof(raffleEndedRaw) === 'string' ? raffleEndedRaw : '';

    if (rafflesOnGoingRaw !== '') {
        const raffleInfoRaw = ((rafflesOnGoingRaw).toString()).split(",");
        for (let i = 0; i < raffleInfoRaw.length; i += 12) {
            const raffle = {
                raffleId: raffleInfoRaw[i],
                price: raffleInfoRaw[i+1] / 10**18, // 18 decimals
                doopPrice: raffleInfoRaw[i+2] / 10**18, // 18 decimals
                img: `https://picsum.photos/2/2?random=${i*9}`,
                payableWithDoop: raffleInfoRaw[i + 5] === 'true',
                hasEnded: false,
                endTime: new Date(raffleInfoRaw[i+3] * 1000),
                unixEndTime: raffleInfoRaw[i+3],
                winner: !raffleInfoRaw[i+7] ? 'Not Selected Yet' : raffleInfoRaw[i+7],
                participants: raffleInfoRaw[i + 4],
                nftContract: raffleInfoRaw[i+8],
                nftContract_L2: raffleInfoRaw[i+9],
                nftTokenId: raffleInfoRaw[i+10],
                nftTokenId_L2: raffleInfoRaw[i+11]
            }
            raffles.push(raffle);
        }
    }

    if (raffleEndedRaw !== '') {
        const endedRaffleInfoRaw = ((raffleEndedRaw).toString()).split(",");
        console.log('Ended Raffle: ', endedRaffleInfoRaw);
        for (let i = 0; i < endedRaffleInfoRaw.length; i += 12) {
            const raffle = {
                raffleId: endedRaffleInfoRaw[i],
                price: endedRaffleInfoRaw[i+1] / 10**18, // 18 decimals
                doopPrice: endedRaffleInfoRaw[i+2] / 10**18, // 18 decimals
                payableWithDoop: endedRaffleInfoRaw[i + 5] === 'true',
                img: `https://picsum.photos/2/2?random=${i*9}`,
                hasEnded: true,
                endTime: new Date(endedRaffleInfoRaw[i+3] * 1000),
                unixEndTime: endedRaffleInfoRaw[i+3],
                winner: !endedRaffleInfoRaw[i+6] ? 'Not Selected Yet' : endedRaffleInfoRaw[i+7],
                participants: endedRaffleInfoRaw[i + 4],
                nftContract: endedRaffleInfoRaw[i+8],
                nftContract_L2: endedRaffleInfoRaw[i+9],
                nftTokenId: endedRaffleInfoRaw[i+10],
                nftTokenId_L2: endedRaffleInfoRaw[i+11]
            }
            raffles.push(raffle);
        }
    }

    console.log('Raffles from parser', raffles);
    return raffles;
}