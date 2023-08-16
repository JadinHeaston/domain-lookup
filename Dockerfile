#Base image.
FROM node:19-slim

#Expected build-time variables.
ARG port
ARG timezone

#Setting timezone.
RUN apt-get update && apt-get install -y tzdata
RUN cp /usr/share/zoneinfo/${timezone} /etc/localtime
RUN echo "${timezone}" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

#Setting the directory.
WORKDIR /usr/app

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

#Copy the files into the container.
COPY . .

# Add user so we don't need --no-sandbox.
# same layer as npm install to keep re-chowned files from using up several hundred MBs more space
RUN groupadd -r user && useradd -r -g user -G audio,video user \
    && mkdir -p /home/user/Downloads \
    && chown -R user:user /home/user \
    && chown -R user:user .

# Run everything after as non-privileged user.
USER user

#Install dependencies.
RUN mkdir node_modules
RUN npm ci --quiet

#Expose the Docker port.
EXPOSE ${port}
