FROM public.ecr.aws/lambda/nodejs:16

RUN npm install
RUN npm run build
COPY dist/* package.json package-lock.json ${LAMBDA_TASK_ROOT}

CMD ["app.handler"]