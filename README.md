### Local Development

```
# Get the required node_modules
npm install --registry=https://registry.npm.taobao.org

# Start the local server
# 1. Use the default locale, it'll be English
npm run start
# 2. Use other locale, such as Chinese
npm run start -- --locale=zh-Hans

# Test multiple language, have to build it first and then serve it
npm run build
npm run serve
```

For now, we're mainly using markdown to write docs, so most of the content is under the directory below:
1. docs/, for English markdown files
2. i18n/zh-Hans/docusaurus-plugin-content-docs/current, for Chinese markdown files

So under each directory above, they should have the same structure. You can update or put new markdown files as the existing ones, and they'll show up normally.

You can copy between different languages like:
```
cp -r docs/<some-file> i18n/zh-Hans/docusaurus-plugin-content-docs/current/<some-file>
```

### i18n Tips
For how docusaurus supports i18n, you can get the details [i18n Support](https://docusaurus.io/docs/i18n/introduction)

For translation of docs sidebar category labels, you can run the command below to generate the current.json file under other languages, and then translate it under i18n. For example:
```
npm run write-translations -- --locale zh-Hans
```

### Production

Build docker image to deploy
```
# Run the docker build only once to create the base image
# Also need to run if node modules is updated
docker build -f Dockerfile.base -t arbiter/docs-node-base:lts .

# Once we have the base image ready(built above)
# Use it as the build base, it'll be 'arbiter/docs-node-base:lts' by default
# And then run the build below to build the final doc image
docker build -t arbiter/websites:<tag> .
```

#### Thanks to Docusaurus
This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.
