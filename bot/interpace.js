var request = require('request');

class Interpace {

  constructor(options={}) {
    this.API_URL = options.API_URL || "";
    this.currency = options.currency || "";
  }

  marketQuote(callback){
		if(callback){
			this._getJSON(this.currency, (res) => {
				if(res){callback(res);}
			});
			return this;
		} else {
			return false;
		}
	}

  _getJSON(url, callback) {
    console.log(`    Getting quotes from: ${this.API_URL+url}`)
		request(this.API_URL+url, (error, response, body) => {
			if(error){
				callback(false);
				return this;
			}
			if(response && response.statusCode == 200){
				callback(JSON.parse(body))
			} else {
				callback(false);
				return this;
			}
		});
	}

}

module.exports = Interpace;
