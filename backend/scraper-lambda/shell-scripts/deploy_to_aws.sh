set -ex

IMAGE_NAME="lambda-aws"
echo "Deploying ${IMAGE_NAME}"

REGION=$(aws configure get region)
echo "Using region ${REGION}"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Using account id ${ACCOUNT_ID}"

IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${IMAGE_NAME}:$(date +%s)"
echo "Created Image URI ${IMAGE_URI}"

# Provide existing S3 bucket name and SCRAPER user related info for environment variables
S3_BUCKET=ethan-painter-artifacts
SCRAPER_USERNAME="Ethan"
SCRAPER_PHONE_NUMBER="8049385624"

# Create new ECR repository, tag the local image, and push it to ECR
aws ecr create-repository --repository-name ${IMAGE_NAME} --region "${REGION}" || true
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
docker tag ${IMAGE_NAME}:latest "${IMAGE_URI}"
docker push "${IMAGE_URI}"

# Provide stack name for the ABC scraper
STACK_NAME="ABC-Scraper-Stack"

# Deploy with SAM with the Image URI
sam deploy cloudformation --stack-name ${STACK_NAME} -t template.yaml --region "${REGION}" \
  --parameter-overrides ImageUriParameter="${IMAGE_URI}" ScraperUsername="${SCRAPER_USERNAME}" ScraperUserPhoneNumber="${SCRAPER_PHONE_NUMBER}" \
  --image-repository ${IMAGE_URI} --capabilities CAPABILITY_IAM