 
### gpt-3.5-turbo demo cdn stream vuejs

- demo
[OpenAI GPT-3.5 Turbo API](https://chat.jpy.wang).

- run
````shell
# install 
npm install

# replace main.js
apiKey: "<apikey>"

````

- CDN && Proxy Api
````javascript
const openai = new OpenAIApi(configuration, 'https://openai.jpy.wang/v1');
````

- nginx
````shell
    location / {
        ...
        
        #Allow forwarding progress
        proxy_buffering off;
        
        ...
    }
````

- docker
````shell
docker-compose up -d
````

