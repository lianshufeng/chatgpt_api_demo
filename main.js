const {Configuration, OpenAIApi} = require("openai");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


const configuration = new Configuration({
    apiKey: "<apikey>"
});


// use proxy
const openai = new OpenAIApi(configuration, 'https://openai.jpy.wang/v1');

const query = async function (req, res) {
    const body = req.body;

    const messageBody = []
    body.forEach((it) => {
        messageBody.push({"role": "user", "content": it.Human});
        if (it.AI && it.AI != '') {
            messageBody.push({"role": "assistant", "content": it.AI});
        }
    })
    console.log(JSON.stringify(messageBody))


    // Response header
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream; charset=UTF-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client


    const response = openai.createChatCompletion({
        "model": "gpt-3.5-turbo",
        "messages": messageBody,
        "temperature": 0.9,
        "stream": true
        // "max_tokens": 500,
        // "top_p": 1,
        // "frequency_penalty": 0,
        // "presence_penalty": 0.6,
        // "best_of": 1,
        // "logprobs": 0,
        // "stop": [
        //     " Human:",
        //     " AI:"
        // ],
    }, {responseType: 'stream'});


    response.then(resp => {

        let respCache = '';
        resp.data.on('data', data => {
            //repeat package
            const newData = data.toString();
            respCache += newData;
            if (newData.substring(newData.length - 2, newData.length) != '\n\n') {
                return;
            }

            // \n\n split
            respCache.split('\n\n').forEach((item) => {
                let dataText = item.trim().substring(5).trim();
                if (item == '') {
                    return;
                }
                if (dataText === '[DONE]') {
                    res.end();
                    return
                }
                let ret = JSON.parse(dataText);
                if (ret.choices && ret.choices.length > 0 && ret.choices[0]['delta'] && ret.choices[0]['delta']['content']) {
                    let content = ret.choices[0]['delta']['content'];
                    res.write(content)
                }
            })

            //clean cache
            respCache = ''
        });
    })

}

app.use(express.static(__dirname + '/static'));
app.post('/chat', query)


app.listen(8080);