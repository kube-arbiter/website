## Production ##################################################################
# Also define a production target which doesn't use devDeps
FROM arbiter/docs-node-base:lts as production
WORKDIR /home/node/app

# Copy the source code over
COPY --chown=node:node . /home/node/app/
# Build the Docusaurus app
RUN npm run build

## Deploy ######################################################################
# Use a stable nginx image
FROM nginx:stable-alpine as deploy
WORKDIR /usr/share/nginx/html/
# Copy what we've installed/built from production
COPY --from=production /home/node/app/build /usr/share/nginx/html/
