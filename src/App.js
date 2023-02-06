import './App.css';
import { useState,useEffect } from 'react';
import Curr from './Curr';
import axios from 'axios';

//https://api.coingecko.com/api/v3/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=100&page=1&sparkline=false

//

// 


function App() {

const [coins, setCoins] = useState([]);
const [search, setSearch] = useState('');

useEffect(() => {
  axios
    .get(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=gbp&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    )
    .then(res => {
      setCoins(res.data);
      console.log(res.data);
    })
    
}, []);


const handleChange = e => {
  setSearch(e.target.value);
};

const filteredCoins = coins.filter(curr =>
  curr.name.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="coin-app">
  
  <div className='coin-search, wrapper'>

          <input
            className='coin-input'
            type='text'
            onChange={handleChange}           
            required
          />
                  <label>
            <span>
                Search
            </span>
        </label>

      </div>
      <table className='coin-container'>
      <thead className='thead'>
        <tr className='coin-row'>
            <td className='coin'>Coin</td>
            <td className='coin-price'>Price</td>
            <td className='coin-volume'>24h-volume</td>
            <td className='coin-percent'>7-days</td>
            <td className='coin-marketcap'>Market-cap</td>
        </tr>
        </thead>
      </table>



        
      {filteredCoins.map(curr => {
        return (
          <Curr
            key={curr.id}
            name={curr.name}
            price={curr.current_price}
            symbol={curr.symbol}
            marketcap={curr.total_volume}
            volume={curr.market_cap}
            image={curr.image}
            priceChange={curr.price_change_percentage_24h}
          />
        );
      })}
    </div>
  );
}

export default App;
