import './App.css';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Curr from './Curr';

const API_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=100&page=1&sparkline=false';
const INITIAL_CONVERT_AMOUNT = '1';

const normalizeNumericInput = (value) =>
  String(value ?? '').replace(/[\u00A3,\s]/g, '');

const parseNumberInput = (value) => {
  const normalizedValue = normalizeNumericInput(value);

  if (normalizedValue === '') {
    return null;
  }

  const parsed = Number.parseFloat(normalizedValue);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumberInput = (value, maximumFractionDigits, useGrouping = false) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  return value.toLocaleString('en-GB', {
    useGrouping,
    maximumFractionDigits,
  });
};

const formatCoinAmountInput = (value) =>
  formatNumberInput(value, 8, true);

const formatGbpAmountInput = (value) =>
  `\u00A3${formatNumberInput(value, 2, true)}`;

function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [convertAmount, setConvertAmount] = useState(INITIAL_CONVERT_AMOUNT);
  const [gbpAmount, setGbpAmount] = useState('');
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [lastEditedField, setLastEditedField] = useState('coin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchCoins = async () => {
      try {
        const response = await axios.get(API_URL);

        if (!active) {
          return;
        }

        setCoins(response.data);

        if (response.data.length > 0) {
          const firstCoin = response.data[0];
          const initialCoinAmount = parseNumberInput(INITIAL_CONVERT_AMOUNT);

          setSelectedCoinId(firstCoin.id);

          if (initialCoinAmount !== null && initialCoinAmount >= 0) {
            setGbpAmount(formatGbpAmountInput(initialCoinAmount * firstCoin.current_price));
          }
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setError('Unable to load market data right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCoins();

    return () => {
      active = false;
    };
  }, []);

  const selectedCoin = useMemo(
    () => coins.find((coin) => coin.id === selectedCoinId),
    [coins, selectedCoinId]
  );

  const filteredCoins = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return coins;
    }

    return coins.filter(
      (curr) =>
        curr.name.toLowerCase().includes(query) ||
        curr.symbol.toLowerCase().includes(query)
    );
  }, [coins, search]);

  const visibleCoins = filteredCoins.slice(0, 20);

  const updateFromCoinAmount = (nextCoinAmountValue, coin = selectedCoin) => {
    const parsedCoinAmount = parseNumberInput(nextCoinAmountValue);

    if (parsedCoinAmount === null || parsedCoinAmount < 0 || !coin || coin.current_price <= 0) {
      setGbpAmount('');
      return;
    }

    setGbpAmount(formatGbpAmountInput(parsedCoinAmount * coin.current_price));
  };

  const updateFromGbpAmount = (nextGbpAmountValue, coin = selectedCoin) => {
    const parsedGbpAmount = parseNumberInput(nextGbpAmountValue);

    if (parsedGbpAmount === null || parsedGbpAmount < 0 || !coin || coin.current_price <= 0) {
      setConvertAmount('');
      return;
    }

    setConvertAmount(formatCoinAmountInput(parsedGbpAmount / coin.current_price));
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleAmountChange = (event) => {
    const nextValue = event.target.value;
    const parsedCoinAmount = parseNumberInput(nextValue);

    setLastEditedField('coin');

    if (parsedCoinAmount === null || parsedCoinAmount < 0) {
      setConvertAmount('');
      setGbpAmount('');
      return;
    }

    const formattedCoinValue = formatCoinAmountInput(parsedCoinAmount);
    setConvertAmount(formattedCoinValue);
    updateFromCoinAmount(formattedCoinValue);
  };

  const handleGbpChange = (event) => {
    const nextValue = event.target.value;
    const parsedGbpAmount = parseNumberInput(nextValue);

    setLastEditedField('gbp');

    if (parsedGbpAmount === null || parsedGbpAmount < 0) {
      setGbpAmount('');
      setConvertAmount('');
      return;
    }

    const formattedGbpValue = formatGbpAmountInput(parsedGbpAmount);
    setGbpAmount(formattedGbpValue);
    updateFromGbpAmount(formattedGbpValue);
  };

  const selectCoin = (coinId) => {
    const nextCoin = coins.find((coin) => coin.id === coinId);

    setSelectedCoinId(coinId);

    if (!nextCoin || nextCoin.current_price <= 0) {
      return;
    }

    if (lastEditedField === 'gbp') {
      updateFromGbpAmount(gbpAmount, nextCoin);
      return;
    }

    updateFromCoinAmount(convertAmount, nextCoin);
  };

  const handleCoinChange = (event) => {
    selectCoin(event.target.value);
  };

  const handleSelectCoinFromList = (coinId) => {
    selectCoin(coinId);
  };

  const clearSearch = () => {
    setSearch('');
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="hero-kicker">Live Crypto Monitor</p>
        <h1>Track the market in a single glance.</h1>
        <p className="hero-copy">
          Focus on what matters: search fast, compare key metrics, and decide
          quickly.
        </p>

        <form
          className="hero-controls"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="sr-only" htmlFor="coin-search">
            Search assets
          </label>
          <input
            id="coin-search"
            className="hero-input"
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or symbol"
            autoComplete="off"
          />
          <button
            className="btn-primary"
            type="button"
            onClick={clearSearch}
            disabled={!search.trim()}
          >
            Clear
          </button>
        </form>

        <form
          className="converter"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Crypto to GBP converter"
        >
          <div className="converter-field converter-field--result">
            <label htmlFor="convert-amount">Coin amount</label>
            <div className="converter-result">
              <span className="currency-badge">
                {selectedCoin ? selectedCoin.symbol.toUpperCase() : 'COIN'}
              </span>
              <input
                id="convert-amount"
                className="converter-gbp-input"
                type="text"
                value={convertAmount}
                onChange={handleAmountChange}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="converter-field">
            <label htmlFor="convert-coin">Coin</label>
            <div className="converter-select-wrap">
              {selectedCoin ? (
                <img
                  className="converter-coin-icon"
                  src={selectedCoin.image}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="converter-coin-icon converter-coin-icon--placeholder"
                  aria-hidden="true"
                />
              )}
              <select
                id="convert-coin"
                className="converter-select"
                value={selectedCoinId}
                onChange={handleCoinChange}
                disabled={loading || coins.length === 0}
              >
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
              <span className="converter-chevron" aria-hidden="true" />
            </div>
          </div>

          <div className="converter-field converter-field--result">
            <label htmlFor="convert-gbp">GBP amount</label>
            <div className="converter-result">
              <span className="currency-badge">
                <span className="gb-flag" aria-hidden="true">
                  <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                    <clipPath id="gb-flag-clip">
                      <path d="M0,0 v30 h60 v-30 z" />
                    </clipPath>
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                    <path
                      d="M0,0 60,30 M60,0 0,30"
                      stroke="#fff"
                      strokeWidth="6"
                      clipPath="url(#gb-flag-clip)"
                    />
                    <path
                      d="M0,0 60,30 M60,0 0,30"
                      stroke="#C8102E"
                      strokeWidth="4"
                      clipPath="url(#gb-flag-clip)"
                    />
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                  </svg>
                </span>
                GBP
              </span>
              <input
                id="convert-gbp"
                className="converter-gbp-input"
                type="text"
                value={gbpAmount}
                onChange={handleGbpChange}
                placeholder={'\u00A30.00'}
                inputMode="decimal"
              />
            </div>
          </div>
        </form>
      </header>

      <section className="market" aria-labelledby="market-heading">
        <div className="market-head">
          <h2 id="market-heading">Market Snapshot</h2>
          <p className="market-caption">
            {loading ? 'Loading...' : `${filteredCoins.length} assets shown`}
          </p>
        </div>

        <div
          className="market-table"
          role="table"
          aria-label="Top crypto prices and metrics"
        >
          <div className="market-row market-row--head" role="row">
            <p role="columnheader">Asset</p>
            <p role="columnheader">Price</p>
            <p role="columnheader">24h Volume</p>
            <p role="columnheader">24h Change</p>
            <p role="columnheader">Market Cap</p>
          </div>

          {loading && <p className="status">Loading market data...</p>}
          {error && !loading && <p className="status status--error">{error}</p>}
          {!loading && !error && visibleCoins.length === 0 && (
            <p className="status">No assets match your search.</p>
          )}

          {!loading &&
            !error &&
            visibleCoins.map((curr) => (
              <Curr
                key={curr.id}
                id={curr.id}
                name={curr.name}
                price={curr.current_price}
                symbol={curr.symbol}
                marketcap={curr.market_cap}
                volume={curr.total_volume}
                image={curr.image}
                priceChange={curr.price_change_percentage_24h}
                isSelected={curr.id === selectedCoinId}
                onSelectCoin={handleSelectCoinFromList}
              />
            ))}
        </div>
      </section>
    </main>
  );
}

export default App;
