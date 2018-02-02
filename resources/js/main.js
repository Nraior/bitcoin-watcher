/*
	By: Damian Nowakowski
	https://github.com/Nairorox/
	
	geometry from https://www.toptal.com/designers/subtlepatterns/ 
	bitcoin background from https://pixabay.com/
	railroad bell sound from http://soundbible.com
	latest btc price from https://blockchain.info/ticker
*/
const body = document.querySelector('body');
const currencyChoose = document.querySelector('.select-container');
const currencySelect = currencyChoose.querySelector('select');
const priceLive = document.querySelector('.btcPrice');
const alarmStateDOM = document.querySelector('.alarmState');
const alarmStateAnchor = alarmStateDOM.parentElement;
const alarmSwitch = document.querySelector('.alarmSwitch');
const alarmInput = document.querySelector('.alarmInput');
const twkMeter = document.querySelector('.twkMeter');
const twkPercentage = document.querySelector('.twkPercentage');
const lamboMeter = document.querySelector('.lamboMeter');
const lamboPercentage = document.querySelector('.lamboPercentage');
const toggleNightmodeButton = document.querySelector('.fontello-style');

const alarm = new Audio('resources/sounds/railroad_crossing_bell-Brylon_Terry-1551570865.mp3')

class Price{
	constructor(){
		this.watcherDOM = priceLive;
		this.alarmState = alarmStateDOM;
		this.alarmSwitch = false;
		this.alarmType = 'below';
	//	this.alarmSound = null;
		this.currency = null;
		this.updateInterval = 0;
		this.curPrice = 0;
		this.lastPrice;
		this.data = null;
		this.allCryptos = null;
		this.color = null;
		this.diffr = null;
	}

	getAllCryptos(){	//crypto data from coinmarketcap todo
		fetch('https://api.coinmarketcap.com/v1/ticker/').then(data => data.json().then(jsondata => {
			this.allCryptos = jsondata;
			//console.log(this.allCryptos);
			}
		));
	}

	getData(){	//gets btc price data from blockchain 

		fetch('https://blockchain.info/pl/ticker').then(raw => raw.json().then(data => {
				this.data = data;
				this.curPrice = data[this.currency].last;
				if(this.curPrice > this.lastPrice){
					this.color = "green";
					if(this.lastPrice){
						this.diffr = this.curPrice / this.lastPrice;
					}
				}
				else if(this.curPrice < this.lastPrice){
					this.color = "red";
					if(this.lastPrice){
						this.diffr = this.curPrice / this.lastPrice;
					}
				}
				else{
					this.color = null;
				}
			}
		)).catch(err => console.error(err));
	}

	updatePrice(){	//updates display
		this.getData();
		if(this.data){
			this.watcherDOM.innerText = `${this.curPrice} ${this.currency}`;
			if(this.diffr){
				this.watcherDOM.innerText += `(${Math.floor((this.diffr - 1)*10000)/100}%)`;
			}
			if(this.color){
				this.watcherDOM.style.color = this.color;
			}
			console.log(this.alarmType);
			if(this.alarmSwitch){
				if(this.alarmType == "below" && this.curPrice < Number(alarmInput.value) ){
					alarm.play();
				}
				else if(this.alarmType == "above" && this.curPrice > Number(alarmInput.value)){ 
					alarm.play();
				}
			}
			let twkValue = this.data.USD.last / 20000;
			let lamboValue = this.data.USD.last / 400000;
			lamboMeter.value = lamboValue;
			twkMeter.value = twkValue;
			lamboPercentage.innerText = Math.floor(lamboValue*10000)/100 + '%';
			twkPercentage.innerText =  Math.floor(twkValue*10000)/100 + '%';
		}
		this.lastPrice = this.curPrice;
	}

	switchAlarm(){
		if(!alarm.paused){
			alarm.pause();
		}
		alarmStateDOM.innerText =  alarmStateDOM.innerText == 'OFF' ? 'ON' : 'OFF';
		this.alarmSwitch = alarmStateDOM.innerText == "ON" ? true : false;

	}

	changeAlarmType(domEl){	//changing alarm type
		alarm.pause();
		domEl.innerText = domEl.innerText == 'below' ? 'above' : 'below';
		this.alarmType = domEl.innerText;
	}
}

const mainPrice = new Price();	//main

(function(){	//initializing at start
		fetch('https://blockchain.info/pl/ticker').then(raw => raw.json().then(data => {
					for(currencyItem in data){
						currencySelect.innerHTML += `<option>${currencyItem}</option>`
					}
					mainPrice.currency = currencySelect.value;
					lamboMeter.value = data.USD.last/400000;
					twkMeter.value = data.USD.last/20000;

			}
		)).catch(err => console.error(err));
	
		currencySelect.addEventListener('change', function(){
			mainPrice.currency = this.value
		});

		setInterval(function(){
			mainPrice.updatePrice();

		}, 300);

		let curDate = new Date();
		let hours = curDate.getHours();
		if(hours > 21 || hours < 6){
			body.classList.add("nightMode");
		}
})();

function toggleNightmode(){
	if(body.classList.contains('nightMode')){
		body.classList.remove('nightMode');
		toggleNightmodeButton.classList.add('icon-moon');
		toggleNightmodeButton.classList.remove('icon-sun');
	}
	else{
		body.classList.add('nightMode');
		toggleNightmodeButton.classList.add('icon-sun');
		toggleNightmodeButton.classList.remove('icon-moon');
	}
}

alarmStateAnchor.addEventListener('click', function(){
	mainPrice.switchAlarm();
});

	alarmSwitch.addEventListener('click', function(){
		mainPrice.changeAlarmType(this);
	});

	document.querySelector('.fontello-container').addEventListener('click', function(e){
		toggleNightmode();
	})