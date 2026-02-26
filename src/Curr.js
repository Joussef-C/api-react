import React from 'react';
import './Curr.css';

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  notation: 'compact',
  maximumFractionDigits: 2,
});

const formatPrice = (value) => currencyFormatter.format(value ?? 0);
const formatCompactCurrency = (value) => compactCurrencyFormatter.format(value ?? 0);

const Curr = ({
  id,
  name,
  price,
  symbol,
  marketcap,
  volume,
  image,
  priceChange,
  isSelected,
  onSelectCoin,
}) => {
  const safeChange = Number.isFinite(priceChange) ? priceChange : 0;
  const changeClass = safeChange < 0 ? 'negative' : 'positive';
  const rowClass = isSelected
    ? 'market-row market-row--interactive market-row--selected'
    : 'market-row market-row--interactive';

  const handleSelect = () => {
    if (typeof onSelectCoin === 'function') {
      onSelectCoin(id);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <article
      className={rowClass}
      role="row"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={`Select ${name} for GBP conversion`}
    >
      <div className="asset" role="cell">
        <img src={image} alt={`${name} icon`} />
        <div className="asset-meta">
          <p className="asset-name">{name}</p>
          <p className="asset-symbol">{symbol.toUpperCase()}</p>
        </div>
      </div>

      <p className="cell" role="cell">
        {formatPrice(price)}
      </p>
      <p className="cell cell-muted" role="cell">
        {formatCompactCurrency(volume)}
      </p>
      <p className={`cell ${changeClass}`} role="cell">
        {safeChange.toFixed(2)}%
      </p>
      <p className="cell cell-muted" role="cell">
        {formatCompactCurrency(marketcap)}
      </p>
    </article>
  );
};

export default Curr;
