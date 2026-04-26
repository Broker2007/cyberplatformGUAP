FROM golang:1.25

LABEL maintaner="i_hate_web_development@fucknigger.com"

WORKDIR app/


COPY go.mod go.sum ./

RUN go mod download

COPY . .
RUN go build -o cyberplatform backend/cmd/api/main.go

