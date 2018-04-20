# facebotcoin
facebook chatbot that will query bitcoin prices from coinsph api

## Requirements
1. Node.js
2. Facebook page (which will you needed to generate the **PAGE_ACCESS_TOKEN** and used to test your chatbot)

### installaton
1. run ``` npm i```
2. create an app then setup your webhook at [facebook developer page](https://developers.facebook.com/)
3. create a .env file then copy and paste your **PAGE_ACCESS_TOKEN** and **VALIDATION_TOKEN** from the app

###### You may follow this [tutorial](https://www.youtube.com/watch?v=bUwiKFTvmDQ) to successfully create an app and setup your webhook.

### run
``` npm start ```

``` lt --port 5000 --subdomain your-subdomain``` 
###### --port value should be the same with your node.js server port
