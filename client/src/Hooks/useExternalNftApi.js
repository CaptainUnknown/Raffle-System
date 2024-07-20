import {
  whoopAddress,
  eaAddress,
  weaponAddress,
  epicWeaponAddress,
  openSeaAPIKey,
} from "../Constant/constants";

// gateway https://ipfs.moralis.io:2053/ipfs/

export default function useExternalNftApi() {
  const fetchNfts = async (address, cursor) => {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key":
          "qhNuG7sopkwlrhmiSHknBHvBR1VHIvqaRU5X3mqxbzfWSZGjUvUigNe0qljKXiCq",
      },
    };

    let url;

    if (cursor) {
      url = `https://deep-index.moralis.io/api/v2/${address}/nft?chain=eth&format=decimal&cursor=${cursor}&&token_addresses=${whoopAddress}&token_addresses=${eaAddress}&token_addresses=${weaponAddress}&token_addresses=${epicWeaponAddress}&normalizeMetadata=false`;
    } else {
      url = `https://deep-index.moralis.io/api/v2/${address}/nft?chain=eth&format=decimal&token_addresses=${whoopAddress}&token_addresses=${eaAddress}&token_addresses=${weaponAddress}&token_addresses=${epicWeaponAddress}&normalizeMetadata=false`;
    }

    let whoopImgRes = await fetch(
      `https://api.opensea.io/api/v2/chain/ethereum/account/${address}/nfts?collection=whoopsies&limit=200`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Api-Key": openSeaAPIKey,
        },
      }
    );

    let whoopImgs = await whoopImgRes.json();

    let res = await fetch(url, options);
    res = await res.json();
    res.result.forEach((item) => {
      if (item.token_address === whoopAddress.toLowerCase()) {
        let meta = JSON.parse(item.metadata);
        meta.image = whoopImgs.nfts.find(
          (asset) => asset.identifier === item.token_id
        ).image_url;
        item.metadata = JSON.stringify(meta);
      }
    });
    return res;
  };

  const fetchTransfers = async (start, key) => {
    let params;
    if (key) {
      params = [
        {
          fromBlock: start,
          toBlock: "latest",
          contractAddresses: [
            `${whoopAddress}`,
            `${eaAddress}`,
            `${weaponAddress}`,
            `${epicWeaponAddress}`,
          ],
          category: ["erc721", "specialnft"],
          withMetadata: true,
          excludeZeroValue: false,
          order: "asc",
          maxCount: "0x3e8",
          pageKey: key,
        },
      ];
    } else {
      params = [
        {
          fromBlock: start,
          toBlock: "latest",
          contractAddresses: [
            `${whoopAddress}`,
            `${eaAddress}`,
            `${weaponAddress}`,
            `${epicWeaponAddress}`,
          ],
          category: ["erc721", "specialnft"],
          withMetadata: true,
          excludeZeroValue: false,
          order: "asc",
          maxCount: "0x3e8",
        },
      ];
    }

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "alchemy_getAssetTransfers",
        params: params,
      }),
    };

    let res = await fetch(
      //"https://eth-goerli.g.alchemy.com/v2/EFqeZRB5930qCvKErbeJKUxooVyNV4qQ", // testnet
      "https://eth-mainnet.g.alchemy.com/v2/fWWp_qP8N18IXE2aT4rluwbnEJpSM-C6", // mainnet
      options
    );
    return res.json();
  };

  const getAllTransfers = async (start) => {
    let res = await fetchTransfers(start, null);
    let transfers = res.result.transfers.map((item) => item);
    let pageKey = res.result.pageKey ? res.result.pageKey : null;
    while (pageKey) {
      let nextPage = await fetchTransfers(start, pageKey);
      nextPage.result.transfers.forEach((item) => transfers.push(item));
      pageKey = nextPage.result.pageKey ? nextPage.result.pageKey : null;
    }
    return transfers;
  };

  const getMeta = async (id) => {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    let url = `https://ipfs.moralis.io:2053/ipfs/QmVGujqpDTL5FtZhYNirVL9WUG26fPaRg8cNBzanux7XSB/${id}.json`;
    console.log(url);
    let res = await fetch(url, options);
    res = await res.json();
    return res;
  };

  const fetchAllNfts = async (address) => {
    let ownedRes = await fetchNfts(address);
    let owned = ownedRes.result.map((item) => item);
    let pages = ownedRes.total / ownedRes.page_size;
    pages = pages.toFixed(0);
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    if (ownedRes.cursor) {
      let cursor = ownedRes.cursor;
      for (let i = 1; i <= pages; i++) {
        if (cursor) {
          let nextPage = await fetchNfts(address, cursor);
          nextPage.result.forEach((item) => owned.push(item));
          cursor = nextPage.cursor;
          await timer(1000);
        } else {
          break;
        }
      }
    }

    let whoopsOwned = [];
    let eaOwned = [];
    let weaponsOwned = [];
    let epicWeaponsOwned = [];
    owned.forEach(async (nft) => {
      if (nft.token_address === whoopAddress.toLowerCase()) {
        let temp;
        if (nft.metadata) {
          temp = {
            id: nft.token_id,
            meta: JSON.parse(nft.metadata),
          };
        } else {
          let meta = await getMeta(nft.token_id, whoopAddress);
          temp = {
            id: nft.token_id,
            meta: JSON.parse(meta),
          };
        }

        whoopsOwned.push(temp);
      }
      if (nft.token_address === eaAddress.toLowerCase()) {
        let temp = {
          id: nft.token_id,
          meta: JSON.parse(nft.metadata),
        };
        eaOwned.push(temp);
      }
      if (nft.token_address === weaponAddress.toLowerCase()) {
        let temp = {
          id: nft.token_id,
          meta: JSON.parse(nft.metadata),
        };
        weaponsOwned.push(temp);
      }
      if (nft.token_address === epicWeaponAddress.toLowerCase()) {
        let temp = {
          id: nft.token_id,
          meta: JSON.parse(nft.metadata),
        };
        epicWeaponsOwned.push(temp);
      }
    });

    let allNfts = {
      whoops: whoopsOwned.sort((a, b) => a.id - b.id),
      ea: eaOwned.sort((a, b) => a.id - b.id),
      weapons: weaponsOwned.sort((a, b) => a.id - b.id),
      epicWeapons: epicWeaponsOwned.sort((a, b) => a.id - b.id),
    };
    //console.log(allNfts);
    return allNfts;
  };

  return { fetchAllNfts, fetchTransfers, getAllTransfers };
}
