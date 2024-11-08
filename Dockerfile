FROM node:18

ARG NEXT_PUBLIC_API_ORIGIN
ENV NEXT_PUBLIC_API_ORIGIN ${NEXT_PUBLIC_API_ORIGIN}

COPY . /client
WORKDIR /client

RUN chmod +x run.sh

RUN yarn
RUN yarn build

EXPOSE 8080

CMD ["./run.sh"]
