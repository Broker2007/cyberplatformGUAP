package minio

import (
	"context"
	"io"
	"net/url"
	"time"

	minioSDK "github.com/minio/minio-go/v7"
)

func (s *Storage) PutObject(
	ctx context.Context,
	bucket string,
	key string,
	body io.Reader,
	size int64,
	contentType string,
) error {
	_, err := s.InternalClient.PutObject(ctx, bucket, key, body, size, minioSDK.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

func (s *Storage) DeleteObject(ctx context.Context, bucket, key string) error {
	return s.InternalClient.RemoveObject(ctx, bucket, key, minioSDK.RemoveObjectOptions{})
}

func (s *Storage) GetPresignedURL(
	ctx context.Context,
	bucket, key string,
	expires time.Duration,
) (string, error) {
	ur, err := s.PublicClient.PresignedGetObject(ctx, bucket, key, expires, url.Values{})
	if err != nil {
		return "", err
	}
	return ur.String(), nil
}
