# ----- [Build stage] Node로 정적 파일 빌드 -----
FROM node:20-alpine AS build
WORKDIR /app

# [EDIT] 패키지 매니저/스크립트가 다르면 아래 두 줄 변경 (yarn/pnpm 등)
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# 소스 복사 및 빌드
COPY . .

# [EDIT] Vite 컴파일 타임 환경변수. 빌드 시 --build-arg 로 주입
#   예) docker build --build-arg VITE_API_BASE_URL=/api .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# [EDIT] 빌드 스크립트명 다르면 변경 (npm run build / yarn build 등)
RUN npm run build

# ----- [Runtime stage] Nginx로 정적 파일 서빙 (+ 프록시) -----
FROM nginx:alpine

# [EDIT] Vite는 dist, CRA는 build 폴더
COPY --from=build /app/dist /usr/share/nginx/html

# [중요] 프록시/SPA 라우팅 설정 파일(별도 파일). 리포지토리의 frontend/nginx.conf에 둬야 함.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
