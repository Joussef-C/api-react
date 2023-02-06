import React from 'react'
import './Curr.css';


const Curr = ({ name,
    price,
    symbol,
    marketcap,
    volume,
    image,
    priceChange }) => {
    return (     


        <table className='coin-container'>
        <tbody >
            <tr className='coin-row'>
                <td className='coin'>
       
                <img src={image} alt='crypto' /> 
                <h1>{name}</h1>                
                <p className='coin-symbol'>{symbol}</p>
                
                </td>

                    <td><p className='coin-price'>£{price.toLocaleString()}</p></td>
                    <td><p className='coin-marketcap'>
                         £{marketcap.toLocaleString()}
                    </p></td>
                    <td> {priceChange < 0 ? (
                            <p className='coin-percent red'>{priceChange.toFixed(2)}%</p>
                        ) : (
                           <p className='coin-percent green'>{priceChange.toFixed(3)}%</p>
                           )}</td>
                    <td>
                    <p className='coin-volume'>£{volume.toLocaleString()}</p>
                    </td>
                    
                </tr>
            </tbody>
        </table>



    )
}

export default Curr