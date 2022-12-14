FROM public.ecr.aws/lambda/nodejs:16-x86_64 as builder
WORKDIR /usr/app
COPY  package*.json tsconfig.json ./
RUN npm install
COPY ./src/ ./src
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:16-x86_64
WORKDIR ${LAMBDA_TASK_ROOT}
COPY package.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/app/dist/ ./
CMD ["app.handler"]