# One service for Render: builds the web app, then serves it and the ADA API from the same address.

# 1. Build the web app
FROM node:22-slim AS web
WORKDIR /web
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY frontend/ ./
# "/" = call the API on this same site
ENV REACT_APP_BACKEND_URL=/ CI=false GENERATE_SOURCEMAP=false
RUN yarn build

# 2. Serve it with the API
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=web /web/build ./static
ENV STATIC_DIR=/app/static PORT=10000
EXPOSE 10000
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT}"]
