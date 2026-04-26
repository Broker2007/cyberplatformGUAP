package minio

import (
	"context"
	"fmt"

	minioSDK "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Storage struct {
	InternalClient *minioSDK.Client
	PublicClient   *minioSDK.Client
}

func New(
	internalEndpoint string,
	internalUseSSL bool,
	publicEndpoint string,
	publicUseSSL bool,
	accessKey string,
	secretKey string,
) (*Storage, error) {
	internalClient, err := minioSDK.New(internalEndpoint, &minioSDK.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: internalUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("create internal minio client: %w", err)
	}

	publicClient, err := minioSDK.New(publicEndpoint, &minioSDK.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: publicUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("create public minio client: %w", err)
	}

	return &Storage{
		InternalClient: internalClient,
		PublicClient:   publicClient,
	}, nil
}

func (s *Storage) EnsureBucket(ctx context.Context, bucket string) error {
	exists, err := s.InternalClient.BucketExists(ctx, bucket)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	return s.InternalClient.MakeBucket(ctx, bucket, minioSDK.MakeBucketOptions{})
}
