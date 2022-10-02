FROM node:16-buster

# Install Chromium
RUN apt-get update \
  && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install aws-lambda-ric build dependencies
RUN apt-get update && \
  apt-get install -y \
  g++ \
  make \
  cmake \
  unzip \
  libcurl4-openssl-dev

WORKDIR /node-code

# Install node js dependencies and create user to run chromium (non root user)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN npm install aws-lambda-ric \
  && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /node-code

COPY . /node-code/

# Create entrypoint and start app handler
USER pptruser
ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["local-app.handler"]