// Import helper to map currency tp country flags
import { currencyToFlagCode } from './currency-to-flag-code.js'

//  Select elements from the DOM
const inputSourceCurrency=document.getElementById('inputSourceCurrency');
const currectSelectElements = document.querySelectorAll('.currency-converter_select select');


const imageSourceCurrency = document.getElementById('imageSourceCurrency'); 
const selectSourceCurrency = document.getElementById('selectSourceCurrency');


const imageTargetCurrency = document.getElementById('imageTargetCurrency');
const selectTargetCurrency = document.getElementById('selectTargetCurrency');

const buttonSwap=document.getElementById('buttonSwap');

const buttonConvert=document.getElementById('buttonConvert');
const exchangeRateText = document.getElementById('exchangeRateText');

// Declar variables
let isFetching = false;
let conversionRate=0;

let sourceCurrencyValue = 0;
let targetCurrencyValue = 0;

// Swap source and target currencies
buttonSwap.addEventListener('click', () => {
    // Swap select values
    [selectSourceCurrency.value, selectTargetCurrency.value] =
    [selectTargetCurrency.value, selectSourceCurrency.value];

    // Swap conversion rate
    inputSourceCurrency.value= targetCurrencyValue;
    // Update flags
    changeFlag(selectSourceCurrency);
    changeFlag(selectTargetCurrency);

    if (isFetching){
        conversionRate= 1/conversionRate;
    }
    // Update exchange rate and conversion result
    updateExchangeRate();
});


//  Update exchange rate upon input 
inputSourceCurrency.addEventListener('input',event=>{
    // Update exchange rate
    if (isFetching && inputSourceCurrency.value >0){
        updateExchangeRate();
    }
})


//  Perform conversion when button is clicked
buttonConvert.addEventListener('click', async()=>{
    // when input is less than or equal to 0 
    if (inputSourceCurrency.value <=0 ){
        alert('Please enter a valid amount')
        return;
    }

    exchangeRateText.textContent='Fetching exchange rate , please wait...'

    const selectSourceCurrencyValue = selectSourceCurrency.value;
    const selectTargetCurrencyValue = selectTargetCurrency.value;
    
    try {
        const reponse =
        await fetch(`
            https://v6.exchangerate-api.com/v6/b0fc11f9f33fc312a3e9236d/pair/${selectSourceCurrencyValue}/${selectTargetCurrencyValue}`
        );
        const data = await reponse.json();

        conversionRate= data.conversion_rate;
        isFetching=true;
        updateExchangeRate();
    }catch(error){
        console.log('Error fetching exchange rate!',error);
        exchangeRateText.textContent = 'Error fetching exchange rate!'
    }
})


// Update exchange rate displayed
function updateExchangeRate(){
    sourceCurrencyValue= parseFloat(inputSourceCurrency.value).toFixed(2);
    targetCurrencyValue = (sourceCurrencyValue * conversionRate)

    exchangeRateText.textContent= 
    `${formatCurrency(sourceCurrencyValue)} ${selectSourceCurrency.value}
    = ${formatCurrency(targetCurrencyValue)} ${selectTargetCurrency.value}`
}


currectSelectElements.forEach(selectElement =>{
    for (const [currency, flagCode] of Object.entries(currencyToFlagCode)){
        const newOptionElement= document.createElement('option');
        newOptionElement.value=currency;
        newOptionElement.textContent= currency;
        selectElement.appendChild(newOptionElement);
    }

    // listen for changes
    selectElement.addEventListener('change', ()=>{
        inputSourceCurrency.value= '0';
        isFetching= false;
        updateExchangeRate();
        changeFlag(selectElement);
    });


    // set default select target value
    if (selectElement.id === 'selectTargetCurrency'){
        selectElement.value='IDR';
    }
})







function  changeFlag(selectElement){
    const selectValue=selectElement.value;
    const selectID = selectElement.id;
    const flagCode = currencyToFlagCode[selectValue];


    if (selectID === 'selectSourceCurrency'){
    imageSourceCurrency.src= `https://flagcdn.com/w640/${flagCode}.png`
    }
    else{
    imageTargetCurrency.src= `https://flagcdn.com/w640/${flagCode}.png`
    }
}


// Format currency

function formatCurrency(number){
    return new Intl.NumberFormat().format(number);
}