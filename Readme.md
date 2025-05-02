# Vector Databases and the BoxLang/CFML Developer

This repo holds the demos from my Vector Databases and the BoxLang/CFML Developer. The slide deck is also included as a pdf. There are 3 demos each in a folder. The first one is a color picker that searches colors by vector, the second categorizes items using vectors, and the 3rd is an example of long term cache and semantic searching using a vector database.

## Color Picker Demo

To run the Color Picker example, simply start a webserver in the folder as this demo is purely HTML/CSS and JavaScript. I personally just started a [CommandBox](https://commandbox.ortusbooks.com/) server because this talk was designed for Box developers, but you can use whatever you like.

## Categorize Items Demo

There are a few things needed to run this demo. First you need a docker container running Couchbase (or any Couchbase server you can connect to). To run for my example I ran the following docker command.

```
docker run -d --platform linux/amd64 --name vector-db -p 8091-8097:8091-8097 -p 9123:9123 -p 11207:11207 -p 11210:11210 -p 11280:11280 -p 18091-18097:18091-18097 couchbase
```

You can than setup your Couchbase server by visiting (http://localhost:8091/) and setting up the cluster giving it a name and password to log in.

I have setup the connection to the server in code to use some environment variables, I have an example .env file in the repo or you can set them manually. You need the following variables.

```
cbUsername
cbPassword
cbHostname
cbBucket
cbScope
cbCollection
cbSearchIndex
```

I personally do this by creating a .env file and sourcing the variables using the source command.

```
 source .env
```

The next thing you need is BoxLang installed on your machine, you can find installation instructions in [BoxLang documentation](https://boxlang.ortusbooks.com/getting-started/installation)

Now that you have BoxLang installed, we need to install one module to make these demos work. The [bx-ai](https://forgebox.io/view/bx-ai) module. Run this command to install the module into your core BoxLang.

```
install-bx-module bx-ai
```

Next you need to go to your BoxLang Home directory. You can find the path here in the [BoxLang Home Documentation](https://boxlang.ortusbooks.com/getting-started/running-boxlang#start-the-repl-8) or you can use the [BoxLang Extension](https://marketplace.visualstudio.com/items?itemName=ortus-solutions.vscode-boxlang) in VSCode and open the path from there.

In the BoxLang Home directory you will need to do a few things. First you will need to copy the files in the lib directory of this repo to lib directory in the BoxLang Home directory. Alternatively you can add the lib directory of this repo to your BoxLang config by modifying the boxlang.json file in the config directory and adding the path to the `javaLibraryPaths`.

Next you will need to edit the boxlang.json file in the config directory and add the following configuration for the bx-ai module, in the modules section of the config. (you can copy and paste this out of the example in the boxlang.json in this repo). Note that this demo is currently only set up to work with Gemini as a provider.

```
"bxai" : {
    "settings": {
        "provider": "gemini",
        "apiKey": "<add your api key here>",
        "defaultParams": {
            "model": "gemini-2.0-flash"
        }
    }
}
```

The final setup piece to run this demo is to setup Couchbase. This will use the environment variables you setup earlier. To run the setup that will make sure you have the bucket, scope, collection, and indexes needed for the demo run the following command from the demo folder.

```
boxlang setupCouchbase.bx
```

Now all you have to do is run the demo.

```
boxlang categorizeItem.bx
```

Note by default this is set to use the "savedEmbed.json" file instead of calling the provider to do the batch embedding, you can have it run the batch embedding by changing `createEmbeddings(textArray,true);` in the `main()` function to be `createEmbeddings(textArray,false);`.

## Search/Cache Demo

The setup for this demo is the same as that for the Categorize Items Demo.

After you have run that same setup, all you need to do is run the Demo.

```
boxlang cachecall.bx
```
